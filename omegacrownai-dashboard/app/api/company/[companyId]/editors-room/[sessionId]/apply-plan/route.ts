import { NextResponse } from "next/server";
import { applyEditorsRoomPlan } from "@/lib/sugent/editors-room/editorsRoomEngine";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ companyId: string; sessionId: string }> }
) {
  const { sessionId } = await params;

  const result = await applyEditorsRoomPlan({
    sessionId,
  });

  return NextResponse.json(result, {
    status: result.ok ? 200 : 409,
  });
}
