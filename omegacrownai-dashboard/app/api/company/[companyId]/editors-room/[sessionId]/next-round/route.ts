import { NextResponse } from "next/server";
import { runEditorsRoomRound } from "@/lib/sugent/editors-room/editorsRoomEngine";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ companyId: string; sessionId: string }> }
) {
  const { sessionId } = await params;

  const round = await runEditorsRoomRound({
    sessionId,
  });

  return NextResponse.json({
    ok: true,
    round,
  });
}
