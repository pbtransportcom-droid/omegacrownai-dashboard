import { NextResponse } from "next/server";
import { saveDirectorsRoomConsensusAsVersion } from "@/lib/sugent/directors-room/directorsRoomEngine";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ companyId: string; sessionId: string }> }
) {
  const { companyId, sessionId } = await params;

  const result = await saveDirectorsRoomConsensusAsVersion({
    companyId,
    sessionId,
  });

  return NextResponse.json(result, {
    status: result.ok ? 200 : 409,
  });
}
