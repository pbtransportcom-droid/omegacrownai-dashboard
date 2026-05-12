import { NextResponse } from "next/server";
import { requeueJob } from "@/lib/sugent/observability/observabilityEngine";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  const result = await requeueJob(jobId);

  return NextResponse.json(result, {
    status: result.ok ? 200 : 404,
  });
}
