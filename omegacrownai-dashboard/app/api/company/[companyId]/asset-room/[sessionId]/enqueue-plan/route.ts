import { NextResponse } from "next/server";
import { enqueueAssetRoomPlan } from "@/lib/sugent/asset-room/assetRoomEngine";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ companyId: string; sessionId: string }> }
) {
  const { sessionId } = await params;

  const result = await enqueueAssetRoomPlan({
    sessionId,
  });

  return NextResponse.json(result, {
    status: result.ok ? 200 : 409,
  });
}
