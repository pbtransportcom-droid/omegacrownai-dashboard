import { NextResponse } from "next/server";
import { getTimeline } from "@/lib/sugent/video/timelineEngine";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ companyId: string; projectId: string }> }
) {
  const { companyId, projectId } = await params;
  const timeline = await getTimeline({ companyId, projectId });
  return NextResponse.json(timeline);
}
