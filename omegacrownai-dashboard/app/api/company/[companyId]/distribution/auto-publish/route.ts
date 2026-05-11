import { NextResponse } from "next/server";
import { createPublishJobsForLatestRenderedAssets } from "@/lib/sugent/distribution/distributionEngine";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const contentType = req.headers.get("content-type") || "";

  const result = await createPublishJobsForLatestRenderedAssets(companyId);

  if (!contentType.includes("application/json")) {
    return NextResponse.redirect(new URL(`/projects/${companyId}/company/distribution`, req.url));
  }

  return NextResponse.json(result);
}
