import { NextResponse } from "next/server";
import { getAssetJob } from "@/lib/sugent/video/assetEngine";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ companyId: string; jobId: string }> }
) {
  const { companyId, jobId } = await params;

  const job = await getAssetJob({
    companyId,
    jobId,
  });

  if (!job) {
    return NextResponse.json(
      { ok: false, error: "ASSET_GENERATION_JOB_NOT_FOUND" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    ok: true,
    job,
  });
}
