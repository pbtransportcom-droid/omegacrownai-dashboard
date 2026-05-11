import { NextResponse } from "next/server";
import { moveClip } from "@/lib/sugent/video/timelineEngine";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ companyId: string; projectId: string; clipId: string }> }
) {
  const { companyId, projectId, clipId } = await params;
  const body = await req.json();

  const clip = await moveClip({
    companyId,
    projectId,
    clipId,
    newTrackId: body.newTrackId || null,
    newStartTimeSeconds: Number(body.newStartTimeSeconds || 0),
  });

  return NextResponse.json({ ok: true, clip });
}
