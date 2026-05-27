import { NextResponse } from "next/server";

const RUNTIME_URL =
  process.env.SOVEREIGN_RUNTIME_URL || "http://localhost:4101";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string; file: string }> }
) {
  const { projectId, file } = await params;

  const response = await fetch(`${RUNTIME_URL}/runs/${projectId}`);
  const run = await response.json();

  if (!response.ok) {
    return NextResponse.json(run, { status: response.status });
  }

  const artifact = (run.artifacts || []).find((item: any) =>
    String(item.path || "").endsWith(`/${file}`)
  );

  if (!artifact) {
    return NextResponse.json(
      { ok: false, error: "Artifact not found", projectId, file },
      { status: 404 }
    );
  }

  return NextResponse.json({
    ok: true,
    projectId,
    file,
    artifact,
  });
}
