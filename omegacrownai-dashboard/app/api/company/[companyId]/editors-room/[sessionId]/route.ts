import { NextResponse } from "next/server";
import { getEditorsRoomSession } from "@/lib/sugent/editors-room/editorsRoomEngine";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ companyId: string; sessionId: string }> }
) {
  const { sessionId } = await params;
  const session = await getEditorsRoomSession(sessionId);

  if (!session) {
    return NextResponse.json(
      { ok: false, error: "EDITORS_ROOM_SESSION_NOT_FOUND" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    ok: true,
    session,
  });
}
