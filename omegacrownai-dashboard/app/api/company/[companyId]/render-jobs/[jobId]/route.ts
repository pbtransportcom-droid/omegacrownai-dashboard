import { NextResponse } from "next/server";
import { getRenderJob } from "@/lib/sugent/video/render";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ companyId: string; jobId: string }> }
) {
  const { companyId, jobId } = await params;

  const job = await getRenderJob({
    companyId,
    jobId,
  });

  if (!job) {
    return NextResponse.json(
      { ok: false, error: "RENDER_JOB_NOT_FOUND" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    ok: true,
    job,
  });
}
