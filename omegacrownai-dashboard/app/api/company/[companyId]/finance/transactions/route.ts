import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createFinanceTransaction, ensureFinanceAccount } from "@/lib/sugent/finance/engine";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;

  const transactions = await prisma.financeTransaction.findMany({
    where: { companyId },
    orderBy: { occurredAt: "desc" },
    include: { account: true },
    take: 100,
  });

  return NextResponse.json({
    ok: true,
    companyId,
    transactions,
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

  const financeDept = await prisma.companyDepartment.findFirst({
    where: { companyId, slug: "finance" },
  });

  const account = await ensureFinanceAccount({
    companyId,
    departmentId: financeDept?.id || null,
  });

  const transaction = await createFinanceTransaction({
    companyId,
    departmentId: financeDept?.id || null,
    accountId: account.id,
    type: String(body.type || "revenue") === "expense" ? "expense" : "revenue",
    category: String(body.category || "general"),
    amount: Number(body.amount || 0),
    description: body.description ? String(body.description) : null,
    metadata: body.metadata || {},
  });

  if (!contentType.includes("application/json")) {
    return NextResponse.redirect(new URL(`/projects/${companyId}/company/finance`, req.url));
  }

  return NextResponse.json({
    ok: true,
    transaction,
  });
}
