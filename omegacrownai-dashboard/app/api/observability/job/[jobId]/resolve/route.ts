import { NextResponse } from "next/server";
import { resolveJob } from "@/lib/sugent/observability/observabilityEngine";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  const result = await resolveJob(jobId);

  return NextResponse.json(result);
}
