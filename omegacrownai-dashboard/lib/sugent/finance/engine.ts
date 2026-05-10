import { prisma } from "@/lib/db";
import { setDepartmentKPI, writeDepartmentMemory } from "@/lib/sugent/company/departments";

export function calculateRunway({
  cashBalance,
  monthlyRevenue,
  monthlyExpenses,
}: {
  cashBalance: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
}) {
  const burn = Math.max(0, monthlyExpenses - monthlyRevenue);

  if (burn <= 0) {
    return {
      burn,
      runwayMonths: 999,
      status: "profitable_or_break_even",
    };
  }

  return {
    burn,
    runwayMonths: Number((cashBalance / burn).toFixed(2)),
    status: cashBalance / burn >= 6 ? "healthy" : cashBalance / burn >= 3 ? "watch" : "risk",
  };
}

export async function ensureFinanceAccount({
  companyId,
  departmentId,
}: {
  companyId: string;
  departmentId?: string | null;
}) {
  const existing = await prisma.financeAccount.findFirst({
    where: { companyId, type: "operating" },
    orderBy: { createdAt: "asc" },
  });

  if (existing) return existing;

  return prisma.financeAccount.create({
    data: {
      companyId,
      departmentId: departmentId || null,
      name: "Operating Account",
      type: "operating",
      currency: "USD",
      balance: 10000,
      status: "active",
    },
  });
}

export async function createFinanceTransaction({
  companyId,
  departmentId,
  accountId,
  type,
  category,
  amount,
  description,
  metadata = {},
}: {
  companyId: string;
  departmentId?: string | null;
  accountId?: string | null;
  type: "revenue" | "expense";
  category: string;
  amount: number;
  description?: string | null;
  metadata?: any;
}) {
  const transaction = await prisma.financeTransaction.create({
    data: {
      companyId,
      departmentId: departmentId || null,
      accountId: accountId || null,
      type,
      category,
      amount,
      description: description || null,
      metadata,
    },
  });

  if (accountId) {
    await prisma.financeAccount.update({
      where: { id: accountId },
      data: {
        balance: {
          increment: type === "revenue" ? amount : -amount,
        },
      },
    });
  }

  return transaction;
}

export async function createFinanceForecast({
  companyId,
  departmentId,
  name = "Finance Forecast",
  monthlyRevenue,
  monthlyExpenses,
  cashBalance,
  period = "month",
  assumptions = {},
}: {
  companyId: string;
  departmentId?: string | null;
  name?: string;
  monthlyRevenue: number;
  monthlyExpenses: number;
  cashBalance: number;
  period?: string;
  assumptions?: any;
}) {
  const runway = calculateRunway({
    cashBalance,
    monthlyRevenue,
    monthlyExpenses,
  });

  return prisma.financeForecast.create({
    data: {
      companyId,
      departmentId: departmentId || null,
      name,
      period,
      revenue: monthlyRevenue,
      expenses: monthlyExpenses,
      cashBalance,
      runwayMonths: runway.runwayMonths,
      assumptions,
      result: runway,
    },
  });
}

export async function runFinanceEngine({
  companyId,
  departmentId,
  objective,
}: {
  companyId: string;
  departmentId?: string | null;
  objective: string;
}) {
  const account = await ensureFinanceAccount({
    companyId,
    departmentId,
  });

  const revenue = await createFinanceTransaction({
    companyId,
    departmentId,
    accountId: account.id,
    type: "revenue",
    category: "projected_sales",
    amount: 5000,
    description: `Projected revenue from finance task: ${objective}`,
    metadata: { source: "finance_engine" },
  });

  const expense = await createFinanceTransaction({
    companyId,
    departmentId,
    accountId: account.id,
    type: "expense",
    category: "operating_cost",
    amount: 1500,
    description: `Projected operating expense from finance task: ${objective}`,
    metadata: { source: "finance_engine" },
  });

  const updatedAccount = await prisma.financeAccount.findUnique({
    where: { id: account.id },
  });

  const forecast = await createFinanceForecast({
    companyId,
    departmentId,
    name: objective.slice(0, 80) || "Finance Forecast",
    monthlyRevenue: 5000,
    monthlyExpenses: 1500,
    cashBalance: updatedAccount?.balance || account.balance,
    assumptions: {
      objective,
      revenueSource: "projected_sales",
      expenseSource: "operating_cost",
    },
  });

  if (departmentId) {
    await setDepartmentKPI({
      departmentId,
      metric: "monthly_revenue",
      value: 5000,
      period: "month",
      note: `Finance engine revenue projection for: ${objective}`,
    });

    await setDepartmentKPI({
      departmentId,
      metric: "monthly_expenses",
      value: 1500,
      period: "month",
      note: `Finance engine expense projection for: ${objective}`,
    });

    await setDepartmentKPI({
      departmentId,
      metric: "runway_months",
      value: forecast.runwayMonths,
      period: "month",
      note: "Calculated by finance engine.",
    });

    await writeDepartmentMemory({
      departmentId,
      kind: "finance_execution",
      content: `Finance engine executed: ${objective}. Revenue $5000, expenses $1500, runway ${forecast.runwayMonths} months.`,
      tags: {
        source: "finance_engine",
        accountId: account.id,
        forecastId: forecast.id,
        revenueTransactionId: revenue.id,
        expenseTransactionId: expense.id,
      },
    });
  }

  return {
    ok: true,
    intent: "finance_department_execution",
    reply: `Finance forecast created. Revenue $5,000, expenses $1,500, runway ${forecast.runwayMonths} months.`,
    account: updatedAccount || account,
    transactions: [revenue, expense],
    forecast,
    summary: {
      monthlyRevenue: 5000,
      monthlyExpenses: 1500,
      net: 3500,
      runwayMonths: forecast.runwayMonths,
      status: (forecast.result as any)?.status || "unknown",
    },
  };
}

export async function getFinanceDashboard(companyId: string) {
  const [accounts, transactions, forecasts] = await Promise.all([
    prisma.financeAccount.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.financeTransaction.findMany({
      where: { companyId },
      orderBy: { occurredAt: "desc" },
      take: 100,
      include: { account: true },
    }),
    prisma.financeForecast.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  const revenue = transactions
    .filter((item) => item.type === "revenue")
    .reduce((sum, item) => sum + item.amount, 0);

  const expenses = transactions
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + item.amount, 0);

  return {
    ok: true,
    companyId,
    accounts,
    transactions,
    forecasts,
    summary: {
      accounts: accounts.length,
      transactions: transactions.length,
      forecasts: forecasts.length,
      revenue,
      expenses,
      net: revenue - expenses,
      cashBalance: accounts.reduce((sum, account) => sum + account.balance, 0),
      latestRunwayMonths: forecasts[0]?.runwayMonths || 0,
    },
  };
}
