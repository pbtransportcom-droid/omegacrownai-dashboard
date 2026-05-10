import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createSalesPipeline } from "@/lib/sugent/sales/engine";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;

  const pipelines = await prisma.salesPipeline.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
    include: {
      leads: true,
      deals: true,
    },
    take: 100,
  });

  return NextResponse.json({
    ok: true,
    companyId,
    pipelines,
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

  const pipeline = await createSalesPipeline({
    companyId,
    departmentId: salesDept?.id || null,
    name: String(body.name || "Sales Pipeline"),
    description: body.description ? String(body.description) : null,
  });

  return NextResponse.json({
    ok: true,
    pipeline,
  });
}
