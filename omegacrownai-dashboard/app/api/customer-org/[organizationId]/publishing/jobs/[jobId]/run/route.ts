import { NextResponse } from "next/server";
import { runCustomerPublishingJob } from "@/lib/sugent/customer-publishing/customerPublishingEngine";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ organizationId: string; jobId: string }> }
) {
  const { jobId } = await params;
  const result = await runCustomerPublishingJob(jobId);

  return NextResponse.json(result, {
    status: result.ok ? 200 : 404,
  });
}
