import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ensureFinanceAccount } from "@/lib/sugent/finance/engine";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;

  const accounts = await prisma.financeAccount.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({
    ok: true,
    companyId,
    accounts,
  });
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;

  const financeDept = await prisma.companyDepartment.findFirst({
    where: { companyId, slug: "finance" },
  });

  const account = await ensureFinanceAccount({
    companyId,
    departmentId: financeDept?.id || null,
  });

  return NextResponse.json({
    ok: true,
    account,
  });
}
