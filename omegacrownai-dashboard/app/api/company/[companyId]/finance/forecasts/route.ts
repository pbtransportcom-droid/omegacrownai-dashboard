import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createFinanceForecast, ensureFinanceAccount } from "@/lib/sugent/finance/engine";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;

  const forecasts = await prisma.financeForecast.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({
    ok: true,
    companyId,
    forecasts,
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const body = await req.json();

  const financeDept = await prisma.companyDepartment.findFirst({
    where: { companyId, slug: "finance" },
  });

  const account = await ensureFinanceAccount({
    companyId,
    departmentId: financeDept?.id || null,
  });

  const forecast = await createFinanceForecast({
    companyId,
    departmentId: financeDept?.id || null,
    name: String(body.name || "Finance Forecast"),
    monthlyRevenue: Number(body.monthlyRevenue || 0),
    monthlyExpenses: Number(body.monthlyExpenses || 0),
    cashBalance: Number(body.cashBalance || account.balance || 0),
    assumptions: body.assumptions || {},
  });

  return NextResponse.json({
    ok: true,
    forecast,
  });
}
