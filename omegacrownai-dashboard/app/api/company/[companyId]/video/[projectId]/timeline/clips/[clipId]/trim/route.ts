import { NextResponse } from "next/server";
import { trimClip } from "@/lib/sugent/video/timelineEngine";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ companyId: string; projectId: string; clipId: string }> }
) {
  const { companyId, projectId, clipId } = await params;
  const body = await req.json();

  const clip = await trimClip({
    companyId,
    projectId,
    clipId,
    newInPointSeconds: Number(body.newInPointSeconds || 0),
    newOutPointSeconds: Number(body.newOutPointSeconds || 5),
  });

  return NextResponse.json({ ok: true, clip });
}
