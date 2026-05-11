import { NextResponse } from "next/server";
import { getDirectorsRoomSession } from "@/lib/sugent/directors-room/directorsRoomEngine";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ companyId: string; sessionId: string }> }
) {
  const { sessionId } = await params;
  const session = await getDirectorsRoomSession(sessionId);

  if (!session) {
    return NextResponse.json(
      { ok: false, error: "DIRECTORS_ROOM_SESSION_NOT_FOUND" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    ok: true,
    session,
  });
}
