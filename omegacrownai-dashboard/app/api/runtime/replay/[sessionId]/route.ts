import { NextResponse } from "next/server";
import { ReplayEngine } from "@/lib/sugent/runtime/replay";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const { searchParams } = new URL(req.url);
  const index = Number(searchParams.get("index") || 0);

  const state = await ReplayEngine.replayTo(sessionId, index);

  return NextResponse.json({
    ok: true,
    sessionId,
    state,
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const body = await req.json();
  const index = Number(body.index || 0);
  const projectId = body.projectId ? String(body.projectId) : null;

  const snapshot = await ReplayEngine.saveSnapshot(sessionId, index, projectId);

  return NextResponse.json({
    ok: true,
    sessionId,
    snapshot,
  });
}
