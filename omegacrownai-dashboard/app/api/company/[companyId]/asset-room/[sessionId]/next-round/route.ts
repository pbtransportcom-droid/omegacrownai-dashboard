import { NextResponse } from "next/server";
import { runAssetRoomRound } from "@/lib/sugent/asset-room/assetRoomEngine";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ companyId: string; sessionId: string }> }
) {
  const { sessionId } = await params;

  const round = await runAssetRoomRound({
    sessionId,
  });

  return NextResponse.json({
    ok: true,
    round,
  });
}
