import { NextResponse } from "next/server";
import { getSoundRoomSession } from "@/lib/sugent/sound-room/soundRoomEngine";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ companyId: string; sessionId: string }> }
) {
  const { sessionId } = await params;
  const session = await getSoundRoomSession(sessionId);

  if (!session) {
    return NextResponse.json(
      { ok: false, error: "SOUND_ROOM_SESSION_NOT_FOUND" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    ok: true,
    session,
  });
}
