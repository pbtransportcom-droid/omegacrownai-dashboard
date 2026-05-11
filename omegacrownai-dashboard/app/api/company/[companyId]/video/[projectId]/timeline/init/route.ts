import { NextResponse } from "next/server";
import { createDefaultTimeline } from "@/lib/sugent/video/timelineEngine";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ companyId: string; projectId: string }> }
) {
  const { companyId, projectId } = await params;
  const contentType = req.headers.get("content-type") || "";

  const timeline = await createDefaultTimeline({ companyId, projectId });

  if (!contentType.includes("application/json")) {
    return NextResponse.redirect(new URL(`/projects/${companyId}/company/video`, req.url));
  }

  return NextResponse.json(timeline);
}
