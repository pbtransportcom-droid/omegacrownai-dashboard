import { NextResponse } from "next/server";
import { getJobDetail } from "@/lib/sugent/observability/observabilityEngine";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  const result = await getJobDetail(jobId);

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: "JOB_NOT_FOUND" },
      { status: 404 }
    );
  }

  return NextResponse.json(result);
}
