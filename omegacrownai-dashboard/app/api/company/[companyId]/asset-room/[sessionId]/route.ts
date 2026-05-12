import { NextResponse } from "next/server";
import { getAssetRoomSession } from "@/lib/sugent/asset-room/assetRoomEngine";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ companyId: string; sessionId: string }> }
) {
  const { sessionId } = await params;
  const session = await getAssetRoomSession(sessionId);

  if (!session) {
    return NextResponse.json(
      { ok: false, error: "ASSET_ROOM_SESSION_NOT_FOUND" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    ok: true,
    session,
  });
}
