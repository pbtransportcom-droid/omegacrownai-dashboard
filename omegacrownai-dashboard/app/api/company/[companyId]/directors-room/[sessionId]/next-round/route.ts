import { NextResponse } from "next/server";
import {
  getDirectorsRoomSession,
  runDirectorsRoomRound,
} from "@/lib/sugent/directors-room/directorsRoomEngine";

export async function POST(
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

  const latest = session.rounds[session.rounds.length - 1];

  const round = await runDirectorsRoomRound({
    sessionId,
    draft: latest?.nextDraft || session.finalDraft || session.initialDraft,
    roundIndex: latest ? latest.index + 1 : 0,
  });

  return NextResponse.json({
    ok: true,
    round,
  });
}
