import { NextResponse } from "next/server";
import { runSoundRoomRound } from "@/lib/sugent/sound-room/soundRoomEngine";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ companyId: string; sessionId: string }> }
) {
  const { sessionId } = await params;

  const round = await runSoundRoomRound({
    sessionId,
  });

  return NextResponse.json({
    ok: true,
    round,
  });
}
