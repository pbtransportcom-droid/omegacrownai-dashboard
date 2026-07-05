import { NextResponse } from "next/server";

const RUNTIME_URL =
  process.env.SOVEREIGN_RUNTIME_URL || "http://localhost:4101";

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

    return NextResponse.json(executed, {
      status: executeResponse.status,
    });
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
