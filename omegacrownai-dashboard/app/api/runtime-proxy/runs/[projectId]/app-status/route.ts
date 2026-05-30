import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const requireRuntime = eval("require") as NodeRequire;
  const runner = requireRuntime(
    process.cwd() + "/services/sovereign-runtime/dist/apps/generatedAppRunner.js"
  );

  return NextResponse.json(runner.getGeneratedAppStatus(projectId));
}
