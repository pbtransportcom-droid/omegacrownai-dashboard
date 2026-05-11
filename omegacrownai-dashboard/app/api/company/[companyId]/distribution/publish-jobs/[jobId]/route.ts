import { NextResponse } from "next/server";
import { getPublishJob } from "@/lib/sugent/distribution/distributionEngine";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ companyId: string; jobId: string }> }
) {
  const { companyId, jobId } = await params;

  const job = await getPublishJob({
    companyId,
    jobId,
  });

  if (!job) {
    return NextResponse.json(
      { ok: false, error: "PUBLISH_JOB_NOT_FOUND" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    ok: true,
    job,
  });
}
