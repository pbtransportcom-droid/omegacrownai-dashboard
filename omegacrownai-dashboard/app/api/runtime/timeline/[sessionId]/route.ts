import { NextResponse } from "next/server";
import { ReplayEngine } from "@/lib/sugent/runtime/replay";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const events = await ReplayEngine.getEvents(sessionId);

  return NextResponse.json({
    ok: true,
    sessionId,
    events,
  });
}
