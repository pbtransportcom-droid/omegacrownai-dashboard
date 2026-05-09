import { NextResponse } from "next/server";
import { protectPublicRoute } from "@/lib/security/protectedRoute";
import { prisma } from "@/lib/db";
import { runBrowserTask } from "@/lib/sugent/browser/runBrowserTask";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const projectId = searchParams.get("projectId");
  const sessionId = searchParams.get("sessionId");

  const tasks = await prisma.browserTask.findMany({
    where: {
      ...(projectId ? { projectId } : {}),
      ...(sessionId ? { sessionId } : {}),
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 100,
  });

  return NextResponse.json({
    ok: true,
    tasks,
  });
}

export async function POST(req: Request) {
  const publicProtection = await protectPublicRoute(req, {
    rateLimitPrefix: "browser-run",
    limit: 30,
  });
  if (!publicProtection.ok) return publicProtection.response;


  try {
    const body = await req.json();

    const result = await runBrowserTask({
      projectId: body.projectId || null,
      sessionId: body.sessionId || null,
      runtimeSessionId: body.runtimeSessionId || null,
      url: body.url ? String(body.url) : null,
      actions: body.actions || null,
      source: body.source || "api",
    });

    return NextResponse.json(result, {
      status: result.ok ? 200 : 400,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Browser task failed.",
      },
      { status: 500 }
    );
  }
}
