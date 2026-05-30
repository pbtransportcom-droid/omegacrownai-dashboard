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

    return NextResponse.json({
      ...result,
      publicUrl: `/generated-app/${projectId}`,
      note: "Generated app process is starting. Check logs if preview is not ready yet.",
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, projectId, error: String(error) },
      { status: 500 }
    );
  }
}
