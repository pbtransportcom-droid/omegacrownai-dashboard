import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const requireRuntime = eval("require") as NodeRequire;
  const runner = requireRuntime(
    process.cwd() + "/services/sovereign-runtime/dist/apps/generatedAppRunner.js"
  );

  return NextResponse.json(await runner.restartGeneratedApp(projectId));
}
