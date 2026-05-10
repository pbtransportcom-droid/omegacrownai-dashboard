import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createMarketingCampaign } from "@/lib/sugent/marketing/engine";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;

  const campaigns = await prisma.marketingCampaign.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
    include: { assets: true },
    take: 100,
  });

  return NextResponse.json({
    ok: true,
    companyId,
    campaigns,
  });
}

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

  const marketingDept = await prisma.companyDepartment.findFirst({
    where: {
      companyId,
      slug: "marketing",
    },
  });

  const result = await createMarketingCampaign({
    companyId,
    departmentId: marketingDept?.id || null,
    name: String(body.name || body.objective || "Marketing Campaign"),
    objective: String(body.objective || body.message || "Create a marketing campaign."),
    offer: body.offer ? String(body.offer) : "OmegaCrown AI autonomous company operating system",
    audience: body.audience || {
      segment: String(body.segment || "founders and operators"),
    },
    channels: body.channels || ["website", "email", "social", "ads"],
    createAssets: String(body.createAssets ?? "true") !== "false",
  });

  if (!contentType.includes("application/json")) {
    return NextResponse.redirect(new URL(`/projects/${companyId}/company/marketing`, req.url));
  }

  return NextResponse.json(result);
}
