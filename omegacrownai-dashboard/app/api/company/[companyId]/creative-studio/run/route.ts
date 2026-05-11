import { NextResponse } from "next/server";
import { runCreativeStudioFlow } from "@/lib/sugent/creative-agents/coordinator";

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

  const result = await runCreativeStudioFlow({
    companyId,
    mode: body.mode === "podcast" ? "podcast" : "video",
    brief: String(body.brief || "Create a premium OmegaCrown AI creative project."),
    title: body.title ? String(body.title) : null,
    campaignId: body.campaignId ? String(body.campaignId) : null,
    autoApprove: body.autoApprove === true || body.autoApprove === "true",
  });

  if (!contentType.includes("application/json")) {
    return NextResponse.redirect(req.headers.get("referer") || new URL("/", req.url));
  }

  return NextResponse.json({
    ok: result?.status === "completed",
    run: result,
  });
}
