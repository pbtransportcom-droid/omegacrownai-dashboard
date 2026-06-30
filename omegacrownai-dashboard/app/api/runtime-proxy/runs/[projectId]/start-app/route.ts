import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;

  try {
    const requireRuntime = eval("require") as NodeRequire;
    const runner = requireRuntime(
      process.cwd() + "/services/sovereign-runtime/dist/apps/generatedAppRunner.js"
    );

    const result = await runner.startGeneratedApp(projectId);

    return NextResponse.json(
      {
        ...result,
        status: result.status || "starting",
        ready: false,
        readiness: {
          ready: false,
          status: 202,
          waitedMs: 0,
          lastError: "",
        },
        publicUrl: `/generated-app/${projectId}`,
        note: "Generated app preview is starting. Check status again shortly.",
      },
      { status: 202 }
    );
  } catch (error) {
    return NextResponse.json(
      { ok: false, projectId, error: String(error) },
      { status: 500 }
    );
  }
}
