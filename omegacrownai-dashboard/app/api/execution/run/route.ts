import { NextResponse } from "next/server";
import { protectPublicRoute } from "@/lib/security/protectedRoute";
import { prisma } from "@/lib/db";
import { runSecureExecution } from "@/lib/sugent/secureExecution/run";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  const sessionId = searchParams.get("sessionId");

  const executions = await prisma.executionRecord.findMany({
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
    executions,
  });
}

export async function POST(req: Request) {
  const publicProtection = protectPublicRoute(req, {
    rateLimitPrefix: "secure-execution-run",
    limit: 30,
  });
  if (!publicProtection.ok) return publicProtection.response;


  try {
    const body = await req.json();

    const result = await runSecureExecution({
      projectId: body.projectId || null,
      sessionId: body.sessionId || null,
      runtimeSessionId: body.runtimeSessionId || null,
      language: String(body.language || "javascript"),
      code: String(body.code || ""),
      input: body.input || {},
    });

    return NextResponse.json(result, {
      status: result.ok ? 200 : 400,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Secure execution failed.",
      },
      { status: 500 }
    );
  }
}
