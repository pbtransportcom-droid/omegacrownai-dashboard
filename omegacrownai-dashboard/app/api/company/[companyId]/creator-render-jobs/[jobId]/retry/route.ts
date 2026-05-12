import { NextResponse } from "next/server";
import { retryCreatorRenderJob } from "@/lib/sugent/creator-render/renderJobEngine";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ companyId: string; jobId: string }> }
) {
  const { jobId } = await params;
  const result = await retryCreatorRenderJob(jobId);

  return NextResponse.json({
    ok: true,
    job: result,
  });
}
