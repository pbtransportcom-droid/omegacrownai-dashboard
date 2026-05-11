import { NextResponse } from "next/server";
import { listRenderJobsForProject } from "@/lib/sugent/video/render";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ companyId: string; projectId: string }> }
) {
  const { companyId, projectId } = await params;

  const jobs = await listRenderJobsForProject({
    companyId,
    projectId,
  });

  return NextResponse.json({
    ok: true,
    jobs,
  });
}
