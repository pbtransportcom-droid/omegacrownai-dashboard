import { NextResponse } from "next/server";
import { setClipTransition } from "@/lib/sugent/video/timelineEngine";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ companyId: string; projectId: string; clipId: string }> }
) {
  const { companyId, projectId, clipId } = await params;
  const body = await req.json();

  const clip = await setClipTransition({
    companyId,
    projectId,
    clipId,
    transitionIn: body.transitionIn || null,
    transitionOut: body.transitionOut || null,
  });

  return NextResponse.json({ ok: true, clip });
}
