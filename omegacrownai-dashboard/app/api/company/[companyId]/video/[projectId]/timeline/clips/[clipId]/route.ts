import { NextResponse } from "next/server";
import { deleteClip } from "@/lib/sugent/video/timelineEngine";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ companyId: string; projectId: string; clipId: string }> }
) {
  const { companyId, projectId, clipId } = await params;

  const result = await deleteClip({
    companyId,
    projectId,
    clipId,
  });

  return NextResponse.json(result);
}
