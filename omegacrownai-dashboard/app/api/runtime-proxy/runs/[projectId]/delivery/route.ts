import { NextResponse } from "next/server";

const RUNTIME_URL =
  process.env.SOVEREIGN_RUNTIME_URL || "http://localhost:4101";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;

  const response = await fetch(`${RUNTIME_URL}/runs/${projectId}`);
  const run = await response.json();

  if (!response.ok) {
    return NextResponse.json(run, { status: response.status });
  }

  return NextResponse.json({
    ok: true,
    projectId,
    delivery: run.delivery || null,
    artifacts: run.artifacts || [],
    validation: run.validation || null,
  });
}
