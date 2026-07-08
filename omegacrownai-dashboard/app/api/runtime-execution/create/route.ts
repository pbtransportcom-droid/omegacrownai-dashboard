import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth";

const RUNTIME_URL =
  process.env.SOVEREIGN_RUNTIME_URL || "http://localhost:4101";

const ANONYMOUS_BUILD_COOKIE = "oc_anonymous_build_count";
const ANONYMOUS_BUILD_LIMIT = 3;

const SUPPORTED_MODES = new Set([
  "website",
  "app",
  "automation",
  "marketing",
  "podcast",
  "music",
  "video",
  "studio",
  "trading",
]);


function getCookieValue(req: Request, name: string) {
  const cookieHeader = req.headers.get("cookie") || "";
  const cookies = cookieHeader
    .split(";")
    .map((cookie) => cookie.trim())
    .filter(Boolean);

  const match = cookies.find((cookie) => cookie.startsWith(`${name}=`));
  if (!match) return null;

  return decodeURIComponent(match.slice(name.length + 1));
}

function getAnonymousBuildCount(req: Request) {
  const rawValue = getCookieValue(req, ANONYMOUS_BUILD_COOKIE);
  const parsed = Number.parseInt(rawValue || "0", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function createSignupRequiredResponse(used: number) {
  return NextResponse.json(
    {
      ok: false,
      requiresSignup: true,
      error:
        "Your free demo build limit has been reached. Create a free account to continue building with OmegaCrownAI.",
      signupUrl: "/signup",
      loginUrl: "/login",
      access: {
        tier: "anonymous",
        anonymousBuildsUsed: used,
        anonymousBuildsLimit: ANONYMOUS_BUILD_LIMIT,
        remainingAnonymousBuilds: 0,
      },
    },
    { status: 403 }
  );
}

function normalizeMode(body: any) {
  const rawMode = String(
    body?.mode ||
      body?.intent ||
      body?.type ||
      body?.department ||
      "general"
  )
    .trim()
    .toLowerCase();

  return SUPPORTED_MODES.has(rawMode) ? rawMode : "general";
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authConfig);
    const isRegisteredUser = Boolean(session?.user?.email);
    const anonymousBuildCount = getAnonymousBuildCount(req);

    if (!isRegisteredUser && anonymousBuildCount >= ANONYMOUS_BUILD_LIMIT) {
      return createSignupRequiredResponse(anonymousBuildCount);
    }

    const body = await req.json();
    const mode = normalizeMode(body);

    const runtimePayload = {
      ...body,
      mode,
      intent: body?.intent || mode,
      type: body?.type || mode,
      department: body?.department || mode,
    };

    const createResponse = await fetch(`${RUNTIME_URL}/runs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(runtimePayload),
    });

    const created = await createResponse.json();

    if (!createResponse.ok || !created?.projectId) {
      return NextResponse.json(created, {
        status: createResponse.status,
      });
    }

    const executeResponse = await fetch(
      `${RUNTIME_URL}/runs/${created.projectId}/execute`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(runtimePayload),
      }
    );

    const executed = await executeResponse.json();

    const nextAnonymousBuildCount = isRegisteredUser
      ? anonymousBuildCount
      : anonymousBuildCount + 1;

    const response = NextResponse.json(
      {
        ...executed,
        access: {
          tier: isRegisteredUser ? "registered" : "anonymous",
          anonymousBuildsUsed: nextAnonymousBuildCount,
          anonymousBuildsLimit: ANONYMOUS_BUILD_LIMIT,
          remainingAnonymousBuilds: isRegisteredUser
            ? null
            : Math.max(ANONYMOUS_BUILD_LIMIT - nextAnonymousBuildCount, 0),
        },
      },
      {
        status: executeResponse.status,
      }
    );

    if (!isRegisteredUser) {
      response.cookies.set(ANONYMOUS_BUILD_COOKIE, String(nextAnonymousBuildCount), {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: String(error),
      },
      { status: 500 }
    );
  }
}
