import { NextResponse } from "next/server";

const RUNTIME_URL =
  process.env.SOVEREIGN_RUNTIME_URL || "http://localhost:4101";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const body = await req.json();

  const response = await fetch(`${RUNTIME_URL}/runs/${projectId}/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
