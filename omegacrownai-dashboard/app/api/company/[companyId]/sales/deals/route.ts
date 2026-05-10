import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createSalesDeal, ensureSalesPipeline } from "@/lib/sugent/sales/engine";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;

  const deals = await prisma.salesDeal.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
    include: {
      lead: true,
      pipeline: true,
    },
    take: 100,
  });

  return NextResponse.json({
    ok: true,
    companyId,
    deals,
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const body = await req.json();

  const salesDept = await prisma.companyDepartment.findFirst({
    where: { companyId, slug: "sales" },
  });

  const pipeline = await ensureSalesPipeline(companyId, salesDept?.id || null);

  const deal = await createSalesDeal({
    companyId,
    departmentId: salesDept?.id || null,
    pipelineId: pipeline.id,
    leadId: body.leadId ? String(body.leadId) : null,
    name: String(body.name || "Sales Deal"),
    value: Number(body.value || 0),
    nextStep: body.nextStep ? String(body.nextStep) : null,
    metadata: body.metadata || {},
  });

  return NextResponse.json({
    ok: true,
    deal,
  });
}
