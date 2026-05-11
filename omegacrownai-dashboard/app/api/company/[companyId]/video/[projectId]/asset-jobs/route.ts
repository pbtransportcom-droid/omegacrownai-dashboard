import { NextResponse } from "next/server";
import { listAssetJobsForProject } from "@/lib/sugent/video/assetEngine";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ companyId: string; projectId: string }> }
) {
  const { companyId, projectId } = await params;

  const jobs = await listAssetJobsForProject({
    companyId,
    projectId,
  });

  return NextResponse.json({
    ok: true,
    jobs,
  });
}
