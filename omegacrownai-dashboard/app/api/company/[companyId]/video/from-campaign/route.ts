import { NextResponse } from "next/server";
import { createVideoProjectFromCampaign } from "@/lib/sugent/video/engine";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const contentType = req.headers.get("content-type") || "";

  let body: any = {};
  if (contentType.includes("application/json")) {
    body = await req.json();
  } else {
    const form = await req.formData();
    body = Object.fromEntries(form.entries());
  }

  const campaignId = String(body.campaignId || "");

  if (!campaignId) {
    return NextResponse.json(
      { ok: false, error: "campaignId is required" },
      { status: 400 }
    );
  }

  const project = await createVideoProjectFromCampaign({
    companyId,
    campaignId,
  });

  if (!contentType.includes("application/json")) {
    return NextResponse.redirect(new URL(`/projects/${companyId}/company/video`, req.url));
  }

  return NextResponse.json({
    ok: true,
    project,
  });
}
