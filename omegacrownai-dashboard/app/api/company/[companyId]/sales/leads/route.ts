import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createSalesLead, ensureSalesPipeline } from "@/lib/sugent/sales/engine";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;

  const leads = await prisma.salesLead.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({
    ok: true,
    companyId,
    leads,
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

  const salesDept = await prisma.companyDepartment.findFirst({
    where: { companyId, slug: "sales" },
  });

  const pipeline = await ensureSalesPipeline(companyId, salesDept?.id || null);

  const lead = await createSalesLead({
    companyId,
    departmentId: salesDept?.id || null,
    pipelineId: pipeline.id,
    name: String(body.name || "New Lead"),
    company: body.company ? String(body.company) : null,
    email: body.email ? String(body.email) : null,
    source: body.source ? String(body.source) : "manual",
    notes: body.notes ? String(body.notes) : null,
    metadata: body.metadata || {},
  });

  if (!contentType.includes("application/json")) {
    return NextResponse.redirect(new URL(`/projects/${companyId}/company/sales`, req.url));
  }

  return NextResponse.json({
    ok: true,
    lead,
  });
}
