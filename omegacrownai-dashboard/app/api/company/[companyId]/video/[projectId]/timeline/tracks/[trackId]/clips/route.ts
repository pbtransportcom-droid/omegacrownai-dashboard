import { NextResponse } from "next/server";
import { addClip } from "@/lib/sugent/video/timelineEngine";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ companyId: string; projectId: string; trackId: string }> }
) {
  const { companyId, projectId, trackId } = await params;
  const body = await req.json();

  const clip = await addClip({
    companyId,
    projectId,
    trackId,
    assetId: body.assetId || null,
    sceneId: body.sceneId || null,
    startTimeSeconds: Number(body.startTimeSeconds || 0),
    durationSeconds: Number(body.durationSeconds || 5),
  });

  return NextResponse.json({ ok: true, clip });
}
