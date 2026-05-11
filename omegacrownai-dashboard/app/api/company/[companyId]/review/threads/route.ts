import { NextResponse } from "next/server";
import { listReviewThreads } from "@/lib/sugent/versioning/reviewEngine";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const url = new URL(req.url);

  const threads = await listReviewThreads({
    companyId,
    projectId: url.searchParams.get("projectId"),
    versionId: url.searchParams.get("versionId"),
  });

  return NextResponse.json({
    ok: true,
    threads,
  });
}
