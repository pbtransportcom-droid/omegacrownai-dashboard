import { NextResponse } from "next/server";
import {
  createPublishJob,
  listPublishJobs,
} from "@/lib/sugent/distribution/distributionEngine";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const url = new URL(req.url);
  const assetId = url.searchParams.get("assetId");

  const result = await listPublishJobs({
    companyId,
    assetId,
  });

  return NextResponse.json(result);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const contentType = req.headers.get("content-type") || "";

  let body: any = {};
  if (contentType.includes("application/json")) {
    body = await req.json().catch(() => ({}));
  } else {
    const form = await req.formData().catch(() => null);
    body = form ? Object.fromEntries(form.entries()) : {};
  }

  if (!body.assetId || !body.targetId) {
    return NextResponse.json(
      { ok: false, error: "assetId and targetId are required" },
      { status: 400 }
    );
  }

  const job = await createPublishJob({
    companyId,
    assetId: String(body.assetId),
    targetId: String(body.targetId),
    scheduledAt: body.scheduledAt ? new Date(String(body.scheduledAt)) : null,
    metadata: body.metadata || {},
  });

  if (!contentType.includes("application/json")) {
    return NextResponse.redirect(new URL(`/projects/${companyId}/company/distribution`, req.url));
  }

  return NextResponse.json({
    ok: true,
    job,
  });
}
