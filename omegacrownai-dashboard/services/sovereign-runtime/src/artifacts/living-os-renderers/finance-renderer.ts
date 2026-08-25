import type {
  LivingOSProductionPlan,
} from "../living-os-planner.js";

import type {
  LivingOSRenderedFile,
} from "./bookstore-renderer.js";

function safe(value: unknown) {
  return String(value || "")
    .replace(/[<>&]/g, "")
    .trim();
}

function financeBrand(
  plan: LivingOSProductionPlan
) {
  const value = safe(
    plan.business.brandName
  );

  if (
    !value ||
    /finance platform|financial platform|banking platform|custom business/i.test(
      value
    )
  ) {
    return "CrownLedger Financial";
  }

  return value;
}

export function renderFinanceLivingOS(
  plan: LivingOSProductionPlan
): LivingOSRenderedFile[] {
  if (plan.industry !== "finance") {
    throw new Error(
      `Finance renderer received ${plan.industry}`
    );
  }

  const brand = financeBrand(plan);

  const files: LivingOSRenderedFile[] = [];

  files.push({
    file: "living-os-plan.json",
    title: "Finance Living OS Plan",
    type: "json",
    content: JSON.stringify(
      plan,
      null,
      2
    ),
  });

  files.push({
    file: "data/accounts.json",
    title: "Financial Accounts",
    type: "json",
    content: JSON.stringify(
      [
        {
          id: "account-001",
          name: "Operating Account",
          type: "checking",
          institution: "Crown Bank",
          balance: 48250.44,
          availableBalance: 47190.12,
          currency: "USD",
          status: "active",
        },
        {
          id: "account-002",
          name: "Reserve Account",
          type: "savings",
          institution: "Crown Bank",
          balance: 92500,
          availableBalance: 92500,
          currency: "USD",
          status: "active",
        },
        {
          id: "account-003",
          name: "Investment Portfolio",
          type: "investment",
          institution: "Crown Capital",
          balance: 156840.78,
          availableBalance: 151250.32,
          currency: "USD",
          status: "active",
        },
      ],
      null,
      2
    ),
  });

  files.push({
    file: "data/transactions.json",
    title: "Financial Transactions",
    type: "json",
    content: JSON.stringify(
      [
        {
          id: "txn-001",
          accountId: "account-001",
          description: "Client payment",
          amount: 4250,
          type: "credit",
          category: "Revenue",
          status: "posted",
          date: "2026-08-01",
        },
        {
          id: "txn-002",
          accountId: "account-001",
          description: "Cloud infrastructure",
          amount: -780.44,
          type: "debit",
          category: "Technology",
          status: "posted",
          date: "2026-08-02",
        },
        {
          id: "txn-003",
          accountId: "account-003",
          description: "Portfolio dividend",
          amount: 1142.22,
          type: "credit",
          category: "Investment Income",
          status: "posted",
          date: "2026-08-03",
        },
      ],
      null,
      2
    ),
  });

  files.push({
    file: "components/FinanceProvider.tsx",
    title: "Finance Application Provider",
    type: "typescript",
    content: `"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";

type FinanceAccount = {
  id: string;
  name: string;
  type: string;
  institution: string;
  balance: number;
  availableBalance: number;
  currency: string;
  status: string;
};

type FinanceContextValue = {
  selectedAccountId: string;
  setSelectedAccountId: (
    id: string
  ) => void;
  transferAmount: number;
  setTransferAmount: (
    amount: number
  ) => void;
  totalBalance: number;
};

const FinanceContext =
  createContext<
    FinanceContextValue | null
  >(null);

const startingBalances = [
  48250.44,
  92500,
  156840.78,
];

export function FinanceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [
    selectedAccountId,
    setSelectedAccountId,
  ] = useState(
    "account-001"
  );

  const [
    transferAmount,
    setTransferAmount,
  ] = useState(0);

  const totalBalance =
    useMemo(
      () =>
        startingBalances.reduce(
          (
            total,
            balance
          ) =>
            total +
            balance,
          0
        ),
      []
    );

  return (
    <FinanceContext.Provider
      value={{
        selectedAccountId,
        setSelectedAccountId,
        transferAmount,
        setTransferAmount,
        totalBalance,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context =
    useContext(
      FinanceContext
    );

  if (!context) {
    throw new Error(
      "useFinance must be used inside FinanceProvider."
    );
  }

  return context;
}
`,
  });

  files.push({
    file: "app/layout.tsx",
    title: "Finance Root Layout",
    type: "typescript",
    content: `import "./globals.css";

import type {
  Metadata,
} from "next";

import {
  FinanceProvider,
} from "../components/FinanceProvider";

export const metadata: Metadata = {
  title:
    "${brand} | Financial Operating Platform",
  description:
    "Secure financial accounts, transactions, transfers, reporting, budgeting, compliance, and administrative operations.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <FinanceProvider>
          {children}
        </FinanceProvider>
      </body>
    </html>
  );
}
`,
  });

  files.push({
    file: "components/FinanceHeader.tsx",
    title: "Finance Header",
    type: "typescript",
    content: `import Link from "next/link";

export function FinanceHeader() {
  return (
    <header className="finance-header">
      <Link
        href="/dashboard"
        className="finance-brand"
      >
        <span className="finance-mark">
          CL
        </span>

        <span>
          <strong>
            ${brand}
          </strong>

          <small>
            Financial clarity,
            securely delivered.
          </small>
        </span>
      </Link>

      <nav>
        <Link href="/dashboard">
          Dashboard
        </Link>

        <Link href="/accounts">
          Accounts
        </Link>

        <Link href="/transactions">
          Transactions
        </Link>

        <Link href="/transfers">
          Transfers
        </Link>

        <Link href="/reports">
          Reports
        </Link>
      </nav>

      <Link
        href="/settings/security"
        className="finance-button"
      >
        Security
      </Link>
    </header>
  );
}
`,
  });

  files.push({
    file: "components/FinanceHero.tsx",
    title: "Finance Hero",
    type: "typescript",
    content: `import Image from "next/image";
import Link from "next/link";

export function FinanceHero() {
  return (
    <section className="finance-hero">
      <div>
        <p className="eyebrow">
          Secure financial operating system
        </p>

        <h1>
          Understand your money.
          <span>
            Control your next move.
          </span>
        </h1>

        <p>
          Accounts, transactions,
          transfers, budgeting,
          reporting, compliance,
          and financial operations
          brought together in one
          secure platform.
        </p>

        <div className="hero-actions">
          <Link
            href="/dashboard"
            className="finance-button"
          >
            Open dashboard
          </Link>

          <Link
            href="/reports"
            className="finance-outline-button"
          >
            View reports
          </Link>
        </div>

        <div className="finance-proof">
          <span>
            Secure account access
          </span>

          <span>
            Transfer controls
          </span>

          <span>
            Transaction monitoring
          </span>

          <span>
            Audit and compliance logs
          </span>
        </div>
      </div>

      <aside className="finance-preview">
        {/* FINANCE_PRODUCTION_VISUAL_STORY */}
        <div className="finance-hero-visual">
          <Image
            src="/images/hero-visual.svg"
            alt="CrownLedger financial operations dashboard showing account visibility, transaction oversight, transfer controls, and financial performance"
            width={1280}
            height={860}
            priority
            sizes="(max-width: 900px) 100vw, 46vw"
          />
        </div>

        <p className="eyebrow">
          Financial overview
        </p>

        <h2>
          Know your position
          at a glance.
        </h2>

        <div className="finance-metrics">
          <article>
            <span>
              Total assets
            </span>

            <strong>
              $297,591
            </strong>
          </article>

          <article>
            <span>
              This month
            </span>

            <strong>
              +8.4%
            </strong>
          </article>

          <article>
            <span>
              Pending review
            </span>

            <strong>
              4
            </strong>
          </article>
        </div>
      </aside>
    </section>
  );
}
`,
  });

  files.push({
    file: "app/page.tsx",
    title: "Finance Homepage",
    type: "typescript",
    content: `import Image from "next/image";

import {
  FinanceHero,
} from "../components/FinanceHero";

export default function HomePage() {
  return (
    <main>
      <FinanceHero />

      <section
        className="finance-story-section"
        aria-labelledby="finance-story-heading"
      >
        <div className="finance-story-copy">
          <p className="eyebrow">
            Financial clarity
          </p>

          <h2 id="finance-story-heading">
            See the financial story behind every decision.
          </h2>

          <p>
            CrownLedger brings accounts,
            transactions, transfers,
            budgets, reporting, risk,
            compliance, and audit activity
            into one operating view so
            teams can understand what
            changed, why it matters, and
            what needs attention next.
          </p>

          <div className="finance-story-points">
            <article>
              <strong>
                One financial view
              </strong>

              <span>
                Connect account position,
                transaction activity,
                budgets, and reporting.
              </span>
            </article>

            <article>
              <strong>
                Controlled movement
              </strong>

              <span>
                Review transfers,
                beneficiaries, approvals,
                and exceptions with clear
                operational context.
              </span>
            </article>

            <article>
              <strong>
                Governance built in
              </strong>

              <span>
                Surface risk, compliance,
                and audit activity alongside
                daily financial operations.
              </span>
            </article>
          </div>
        </div>

        <div className="finance-story-visual">
          <Image
            src="/images/preview-visual.svg"
            alt="CrownLedger financial story view connecting accounts, transactions, budgeting, reporting, risk, compliance, and audit activity"
            width={1280}
            height={900}
            sizes="(max-width: 900px) 100vw, 48vw"
          />

          <div className="finance-story-thumbnail">
            <Image
              src="/images/thumbnail-visual.svg"
              alt="CrownLedger compact financial operations overview"
              width={560}
              height={360}
              sizes="(max-width: 900px) 48vw, 18vw"
            />

            <span>
              Live financial operating view
            </span>
          </div>
        </div>
      </section>

      <section className="content-section">
        <p className="eyebrow">
          Financial capabilities
        </p>

        <h2>
          Built for visibility,
          control, and confident
          financial decisions.
        </h2>

        <div className="finance-feature-grid">
          {[
            "Account Management",
            "Transaction Monitoring",
            "Secure Transfers",
            "Budgeting",
            "Financial Reporting",
            "Compliance Controls",
          ].map((feature) => (
            <article key={feature}>
              <h3>
                {feature}
              </h3>

              <p>
                Connected
                {" "}
                {feature.toLowerCase()}
                {" "}
                with secure
                operational workflows.
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
`,
  });

  files.push({
    file: "components/FinancialDashboard.tsx",
    title: "Financial Dashboard",
    type: "typescript",
    content: `import accounts from "../data/accounts.json";
import transactions from "../data/transactions.json";

export function FinancialDashboard() {
  const total =
    accounts.reduce(
      (
        value,
        account
      ) =>
        value +
        account.balance,
      0
    );

  return (
    <section className="financial-dashboard">
      <div className="dashboard-heading">
        <div>
          <p className="eyebrow">
            Financial dashboard
          </p>

          <h1>
            Your financial position.
          </h1>
        </div>

        <strong className="balance-total">
          {"$" +
            total.toLocaleString(
              "en-US",
              {
                minimumFractionDigits: 2,
              }
            )}
        </strong>
      </div>

      <div className="dashboard-grid">
        {accounts.map(
          (account) => (
            <article
              key={account.id}
            >
              <span>
                {account.name}
              </span>

              <strong>
                {"$" +
                  account.balance.toLocaleString(
                    "en-US",
                    {
                      minimumFractionDigits:
                        2,
                    }
                  )}
              </strong>

              <small>
                {
                  account.institution
                }
              </small>
            </article>
          )
        )}
      </div>

      <section className="transaction-panel">
        <div className="section-heading-row">
          <h2>
            Recent transactions
          </h2>

          <a href="/transactions">
            View all
          </a>
        </div>

        {transactions.map(
          (transaction) => (
            <div
              key={
                transaction.id
              }
              className="transaction-row"
            >
              <div>
                <strong>
                  {
                    transaction.description
                  }
                </strong>

                <span>
                  {
                    transaction.category
                  }
                </span>
              </div>

              <strong>
                {transaction.amount >
                0
                  ? "+"
                  : ""}
                {"$" +
                  Math.abs(
                    transaction.amount
                  ).toFixed(2)}
              </strong>
            </div>
          )
        )}
      </section>
    </section>
  );
}
`,
  });

  files.push({
    file: "app/dashboard/page.tsx",
    title: "Finance Dashboard",
    type: "typescript",
    content: `import {
  FinanceHeader,
} from "../../components/FinanceHeader";

import {
  FinancialDashboard,
} from "../../components/FinancialDashboard";

export default function DashboardPage() {
  return (
    <main>
      <FinanceHeader />
      <FinancialDashboard />
    </main>
  );
}
`,
  });

  files.push({
    file: "components/TransferForm.tsx",
    title: "Secure Transfer Workflow",
    type: "typescript",
    content: `"use client";

import { useState } from "react";
import accounts from "../data/accounts.json";

export function TransferForm() {
  const [
    fromAccount,
    setFromAccount,
  ] = useState(
    "account-001"
  );

  const [
    toAccount,
    setToAccount,
  ] = useState(
    "account-002"
  );

  const [
    amount,
    setAmount,
  ] = useState(0);

  const [
    memo,
    setMemo,
  ] = useState("");

  const [
    status,
    setStatus,
  ] = useState("");

  async function submitTransfer(
    event:
      React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      amount <= 0
    ) {
      setStatus(
        "Enter a valid transfer amount."
      );
      return;
    }

    if (
      fromAccount ===
      toAccount
    ) {
      setStatus(
        "Choose two different accounts."
      );
      return;
    }

    setStatus(
      "Submitting transfer for secure processing..."
    );

    const response =
      await fetch(
        "/api/transfers",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            fromAccount,
            toAccount,
            amount,
            memo,
            status:
              "pending-review",
          }),
        }
      );

    setStatus(
      response.ok
        ? "Transfer submitted and awaiting processing."
        : "Transfer requires review."
    );
  }

  return (
    <form
      className="transfer-form"
      onSubmit={submitTransfer}
    >
      <p className="eyebrow">
        Secure transfer
      </p>

      <h1>
        Move funds with control.
      </h1>

      <div className="form-grid">
        <label>
          From account

          <select
            value={fromAccount}
            onChange={(event) =>
              setFromAccount(
                event.target.value
              )
            }
          >
            {accounts.map(
              (account) => (
                <option
                  key={account.id}
                  value={account.id}
                >
                  {account.name}
                </option>
              )
            )}
          </select>
        </label>

        <label>
          To account

          <select
            value={toAccount}
            onChange={(event) =>
              setToAccount(
                event.target.value
              )
            }
          >
            {accounts.map(
              (account) => (
                <option
                  key={account.id}
                  value={account.id}
                >
                  {account.name}
                </option>
              )
            )}
          </select>
        </label>

        <label>
          Amount

          <input
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(event) =>
              setAmount(
                Number(
                  event.target.value
                )
              )
            }
            required
          />
        </label>

        <label>
          Memo

          <input
            value={memo}
            onChange={(event) =>
              setMemo(
                event.target.value
              )
            }
          />
        </label>
      </div>

      <button
        type="submit"
        className="finance-button"
      >
        Submit transfer
      </button>

      {status ? (
        <p>{status}</p>
      ) : null}
    </form>
  );
}
`,
  });

  files.push({
    file: "app/transfers/page.tsx",
    title: "Secure Transfers",
    type: "typescript",
    content: `import {
  FinanceHeader,
} from "../../components/FinanceHeader";

import {
  TransferForm,
} from "../../components/TransferForm";

export default function TransfersPage() {
  return (
    <main>
      <FinanceHeader />
      <TransferForm />
    </main>
  );
}
`,
  });

  files.push({
    file: "components/BudgetManager.tsx",
    title: "Budget Manager",
    type: "typescript",
    content: `"use client";

import {
  useMemo,
  useState,
} from "react";

type Budget = {
  id: string;
  category: string;
  limit: number;
  spent: number;
};

export function BudgetManager() {
  const [
    budgets,
    setBudgets,
  ] = useState<Budget[]>([
    {
      id: "budget-001",
      category: "Technology",
      limit: 5000,
      spent: 2780,
    },
    {
      id: "budget-002",
      category: "Marketing",
      limit: 8000,
      spent: 5120,
    },
    {
      id: "budget-003",
      category: "Operations",
      limit: 12000,
      spent: 8440,
    },
  ]);

  const totalLimit =
    useMemo(
      () =>
        budgets.reduce(
          (
            total,
            budget
          ) =>
            total +
            budget.limit,
          0
        ),
      [budgets]
    );

  async function saveBudgets() {
    await fetch(
      "/api/budgets",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          budgets,
          totalLimit,
        }),
      }
    );
  }

  return (
    <section className="finance-page">
      <p className="eyebrow">
        Budgeting
      </p>

      <h1>
        Set guardrails
        and monitor spend.
      </h1>

      <div className="budget-grid">
        {budgets.map(
          (budget) => (
            <article
              key={budget.id}
            >
              <h2>
                {
                  budget.category
                }
              </h2>

              <strong>
                {"$" +
                  budget.spent.toLocaleString()}
                {" / $"}
                {
                  budget.limit.toLocaleString()
                }
              </strong>

              <progress
                value={
                  budget.spent
                }
                max={
                  budget.limit
                }
              />

              <button
                type="button"
                onClick={() =>
                  setBudgets(
                    (
                      current
                    ) =>
                      current.map(
                        (
                          item
                        ) =>
                          item.id ===
                          budget.id
                            ? {
                                ...item,
                                limit:
                                  item.limit +
                                  500,
                              }
                            : item
                      )
                  )
                }
              >
                Increase limit
              </button>
            </article>
          )
        )}
      </div>

      <button
        type="button"
        className="finance-button"
        onClick={saveBudgets}
      >
        Save budgets
      </button>
    </section>
  );
}
`,
  });

  files.push({
    file: "app/budgets/page.tsx",
    title: "Budget Management",
    type: "typescript",
    content: `import {
  FinanceHeader,
} from "../../components/FinanceHeader";

import {
  BudgetManager,
} from "../../components/BudgetManager";

export default function BudgetsPage() {
  return (
    <main>
      <FinanceHeader />
      <BudgetManager />
    </main>
  );
}
`,
  });

  files.push({
    file: "lib/finance-store.ts",
    title: "Finance Persistence Store",
    type: "typescript",
    content: `import fs from "node:fs/promises";
import path from "node:path";

const directory =
  path.join(
    process.cwd(),
    "data",
    "runtime"
  );

export async function listFinanceRecords<T>(
  collection: string
): Promise<T[]> {
  try {
    return JSON.parse(
      await fs.readFile(
        path.join(
          directory,
          collection + ".json"
        ),
        "utf8"
      )
    );
  } catch {
    return [];
  }
}

export async function createFinanceRecord<
  T extends object
>(
  collection: string,
  input: T
) {
  const records =
    await listFinanceRecords(
      collection
    );

  const record = {
    ...input,
    id:
      collection +
      "-" +
      Date.now(),
    createdAt:
      new Date().toISOString(),
  };

  records.unshift(record);

  await fs.mkdir(
    directory,
    {
      recursive: true,
    }
  );

  await fs.writeFile(
    path.join(
      directory,
      collection + ".json"
    ),
    JSON.stringify(
      records,
      null,
      2
    )
  );

  return record;
}
`,
  });

  // FINANCE_FULLSTACK_PRODUCTION_CONTRACT
  // The Finance renderer owns the complete operational backend
  // required by generated-artifact-validator. JSON persistence remains
  // available for the existing dashboard surfaces while Prisma provides
  // the production database contract.

  files.push({
    file: "lib/db.ts",
    title: "Finance Prisma Client",
    type: "typescript",
    content: `import {
  PrismaClient,
} from "@prisma/client";

const globalForPrisma =
  globalThis as unknown as {
    prisma?: PrismaClient;
  };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient();

if (
  process.env.NODE_ENV !==
  "production"
) {
  globalForPrisma.prisma =
    prisma;
}

export default prisma;
`,
  });

  files.push({
    file: "lib/finance-service.ts",
    title: "Finance Service Layer",
    type: "typescript",
    content: `import {
  prisma,
} from "./db";

export async function listTransactions() {
  return prisma.transaction.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getTransaction(
  id: string
) {
  return prisma.transaction.findUnique({
    where: {
      id,
    },
  });
}

export async function createTransaction(
  input: {
    accountId?: string;
    description: string;
    amount: number;
    type?: string;
    category?: string;
    status?: string;
  }
) {
  return prisma.transaction.create({
    data: {
      accountId:
        input.accountId || null,
      description:
        input.description,
      amount:
        input.amount,
      type:
        input.type || "debit",
      category:
        input.category || null,
      status:
        input.status || "posted",
    },
  });
}

export async function updateTransaction(
  id: string,
  input: {
    description?: string;
    amount?: number;
    type?: string;
    category?: string | null;
    status?: string;
  }
) {
  return prisma.transaction.update({
    where: {
      id,
    },
    data: input,
  });
}

export async function deleteTransaction(
  id: string
) {
  return prisma.transaction.delete({
    where: {
      id,
    },
  });
}

export async function getSettings() {
  return prisma.setting.findMany({
    orderBy: {
      key: "asc",
    },
  });
}

export async function updateSettings(
  input: Record<string, unknown>
) {
  const entries =
    Object.entries(input);

  return Promise.all(
    entries.map(
      ([key, value]) =>
        prisma.setting.upsert({
          where: {
            key,
          },
          update: {
            value:
              JSON.stringify(value),
          },
          create: {
            key,
            value:
              JSON.stringify(value),
          },
        })
    )
  );
}

export async function importTransactions(
  rows: Array<{
    accountId?: string;
    description?: string;
    amount?: number;
    type?: string;
    category?: string;
    status?: string;
  }>
) {
  const validRows =
    rows.filter(
      (row) =>
        typeof row.description ===
          "string" &&
        typeof row.amount ===
          "number"
    );

  if (!validRows.length) {
    return {
      imported: 0,
    };
  }

  const result =
    await prisma.transaction.createMany({
      data:
        validRows.map(
          (row) => ({
            accountId:
              row.accountId || null,
            description:
              row.description!,
            amount:
              row.amount!,
            type:
              row.type || "debit",
            category:
              row.category || null,
            status:
              row.status || "posted",
          })
        ),
    });

  return {
    imported:
      result.count,
  };
}
`,
  });

  files.push({
    file:
      "app/api/transactions/[id]/route.ts",
    title:
      "Finance Transaction Detail API",
    type: "typescript",
    content: `import {
  NextResponse,
} from "next/server";

import {
  deleteTransaction,
  getTransaction,
  updateTransaction,
} from "../../../../lib/finance-service";

type RouteContext = {
  params:
    Promise<{
      id: string;
    }>;
};

export async function GET(
  _request: Request,
  context: RouteContext
) {
  const {
    id,
  } = await context.params;

  const transaction =
    await getTransaction(id);

  if (!transaction) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Transaction not found.",
      },
      {
        status: 404,
      }
    );
  }

  return NextResponse.json({
    ok: true,
    transaction,
  });
}

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  const {
    id,
  } = await context.params;

  const input =
    await request.json();

  const transaction =
    await updateTransaction(
      id,
      input
    );

  return NextResponse.json({
    ok: true,
    transaction,
  });
}

export async function DELETE(
  _request: Request,
  context: RouteContext
) {
  const {
    id,
  } = await context.params;

  await deleteTransaction(id);

  return NextResponse.json({
    ok: true,
    deleted: id,
  });
}
`,
  });

  files.push({
    file:
      "app/api/settings/route.ts",
    title:
      "Finance Settings API",
    type: "typescript",
    content: `import {
  NextResponse,
} from "next/server";

import {
  getSettings,
  updateSettings,
} from "../../../lib/finance-service";

export async function GET() {
  return NextResponse.json({
    ok: true,
    settings:
      await getSettings(),
  });
}

export async function PATCH(
  request: Request
) {
  const input =
    await request.json();

  if (
    !input ||
    typeof input !== "object" ||
    Array.isArray(input)
  ) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "A JSON object is required.",
      },
      {
        status: 400,
      }
    );
  }

  const settings =
    await updateSettings(input);

  return NextResponse.json({
    ok: true,
    settings,
  });
}
`,
  });

  files.push({
    file:
      "app/api/import/route.ts",
    title:
      "Finance Import API",
    type: "typescript",
    content: `import {
  NextResponse,
} from "next/server";

import {
  importTransactions,
} from "../../../lib/finance-service";

export async function POST(
  request: Request
) {
  const input =
    await request.json();

  const transactions =
    Array.isArray(input)
      ? input
      : input?.transactions;

  if (
    !Array.isArray(
      transactions
    )
  ) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "transactions must be an array.",
      },
      {
        status: 400,
      }
    );
  }

  const result =
    await importTransactions(
      transactions
    );

  return NextResponse.json({
    ok: true,
    ...result,
  });
}
`,
  });

  files.push({
    file:
      "app/api/export/route.ts",
    title:
      "Finance Export API",
    type: "typescript",
    content: `import {
  NextResponse,
} from "next/server";

import {
  listTransactions,
} from "../../../lib/finance-service";

function csvCell(
  value: unknown
) {
  const text =
    String(value ?? "");

  return (
    '"' +
    text.replace(
      /"/g,
      '""'
    ) +
    '"'
  );
}

export async function GET(
  request: Request
) {
  const transactions =
    await listTransactions();

  const url =
    new URL(request.url);

  const format =
    (
      url.searchParams.get(
        "format"
      ) || "json"
    ).toLowerCase();

  if (format === "csv") {
    const header = [
      "id",
      "accountId",
      "description",
      "amount",
      "type",
      "category",
      "status",
      "createdAt",
    ];

    const rows =
      transactions.map(
        (transaction) =>
          header
            .map(
              (key) =>
                csvCell(
                  (
                    transaction as
                      Record<
                        string,
                        unknown
                      >
                  )[key]
                )
            )
            .join(",")
      );

    return new Response(
      [
        header.join(","),
        ...rows,
      ].join("\\n"),
      {
        headers: {
          "content-type":
            "text/csv; charset=utf-8",
          "content-disposition":
            'attachment; filename="transactions.csv"',
        },
      }
    );
  }

  return NextResponse.json({
    ok: true,
    transactions,
  });
}
`,
  });

  files.push({
    file: "prisma/seed.ts",
    title: "Finance Database Seed",
    type: "typescript",
    content: `import {
  prisma,
} from "../lib/db";

async function main() {
  await prisma.setting.upsert({
    where: {
      key:
        "baseCurrency",
    },
    update: {},
    create: {
      key:
        "baseCurrency",
      value:
        JSON.stringify(
          "USD"
        ),
    },
  });

  const category =
    await prisma.category.upsert({
      where: {
        name:
          "Operations",
      },
      update: {},
      create: {
        name:
          "Operations",
      },
    });

  const account =
    await prisma.account.findFirst({
      orderBy: {
        createdAt: "asc",
      },
    }) ??
    await prisma.account.create({
      data: {
        name:
          "Primary Operating Account",
        type:
          "checking",
        currency:
          "USD",
        balance:
          25000,
        availableBalance:
          25000,
        status:
          "active",
      },
    });

  if (
    await prisma.transaction.count()
      === 0
  ) {
    await prisma.transaction.create({
      data: {
        account: {
          connect: {
            id: account.id,
          },
        },
        description:
          "Opening operating balance",
        amount: 25000,
        type:
          "credit",
        category:
          category.name,
        status:
          "posted",
      },
    });
  }

  if (
    await prisma.budget.count()
      === 0
  ) {
    await prisma.budget.create({
      data: {
        accountId:
          account.id,
        category:
          category.name,
        limit:
          10000,
        spent:
          0,
        period:
          "monthly",
      },
    });
  }

  if (
    await prisma.savingsGoal.count()
      === 0
  ) {
    await prisma.savingsGoal.create({
      data: {
        name:
          "Reserve Fund",
        targetAmount:
          50000,
        currentAmount:
          25000,
      },
    });
  }
}

main()
  .then(
    async () => {
      await prisma.$disconnect();
    }
  )
  .catch(
    async (error) => {
      console.error(error);
      await prisma.$disconnect();
      process.exit(1);
    }
  );
`,
  });

  files.push({
    file:
      "scripts/fullstack-smoke.mjs",
    title:
      "Finance Full Stack Smoke Test",
    type: "javascript",
    content: `import fs from "node:fs";
import path from "node:path";

const requiredFiles = [
  "app/api/transactions/route.ts",
  "app/api/transactions/[id]/route.ts",
  "app/api/settings/route.ts",
  "app/api/import/route.ts",
  "app/api/export/route.ts",
  "lib/db.ts",
  "lib/finance-service.ts",
  "prisma/schema.prisma",
  "prisma/seed.ts",
];

for (
  const file of requiredFiles
) {
  if (
    !fs.existsSync(
      path.join(
        process.cwd(),
        file
      )
    )
  ) {
    throw new Error(
      "Missing Finance full-stack file: " +
        file
    );
  }
}

const schema =
  fs.readFileSync(
    path.join(
      process.cwd(),
      "prisma/schema.prisma"
    ),
    "utf8"
  );

for (
  const model of [
    "Transaction",
    "Setting",
    "Category",
    "Budget",
    "SavingsGoal",
  ]
) {
  if (
    !schema.includes(
      "model " + model
    )
  ) {
    throw new Error(
      "Missing Prisma model: " +
        model
    );
  }
}

console.log(
  "Finance full-stack smoke test passed"
);
`,
  });

  const apiRoutes = [
    "accounts",
    "transactions",
    "transfers",
    "budgets",
    "reports",
    "beneficiaries",
    "payments",
    "statements",
    "risk",
    "compliance",
    "audit-logs",
  ];

  for (
    const route of apiRoutes
  ) {
    files.push({
      file:
        `app/api/${route}/route.ts`,
      title:
        `${route} Finance API`,
      type: "typescript",
      content: `import {
  NextResponse,
} from "next/server";

import {
  createFinanceRecord,
  listFinanceRecords,
} from "../../../lib/finance-store";

const collection =
  ${JSON.stringify(route)};

export async function GET() {
  return NextResponse.json({
    ok: true,
    records:
      await listFinanceRecords(
        collection
      ),
  });
}

export async function POST(
  request: Request
) {
  const input =
    await request.json();

  if (
    !input ||
    typeof input !== "object" ||
    Array.isArray(input)
  ) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "A JSON object is required.",
      },
      {
        status: 400,
      }
    );
  }

  const record =
    await createFinanceRecord(
      collection,
      input
    );

  return NextResponse.json(
    {
      ok: true,
      record,
    },
    {
      status: 201,
    }
  );
}
`,
    });
  }

  const adminPages = [
    [
      "app/admin/page.tsx",
      "Finance Operations Dashboard",
      "Accounts, transactions, transfers, reconciliation, risk, compliance, and operational alerts.",
    ],
    [
      "app/admin/accounts/page.tsx",
      "Account Administration",
      "Customer and business accounts, balances, status, limits, and account controls.",
    ],
    [
      "app/admin/transactions/page.tsx",
      "Transaction Monitoring",
      "Posted, pending, reversed, and flagged transactions with operational review tools.",
    ],
    [
      "app/admin/transfers/page.tsx",
      "Transfer Administration",
      "Transfer approvals, statuses, limits, beneficiaries, and exception handling.",
    ],
    [
      "app/admin/risk/page.tsx",
      "Risk Management",
      "Risk indicators, flagged activity, account monitoring, and review queues.",
    ],
    [
      "app/admin/compliance/page.tsx",
      "Compliance Management",
      "Compliance reviews, controls, evidence, audit status, and investigation records.",
    ],
    [
      "app/admin/audit-logs/page.tsx",
      "Financial Audit Logs",
      "Administrative activity, access events, transaction actions, and compliance-sensitive changes.",
    ],
  ];

  for (
    const [
      file,
      title,
      description,
    ] of adminPages
  ) {
    files.push({
      file,
      title,
      type: "typescript",
      content: `export default function Page() {
  return (
    <main className="finance-admin-page">
      <p className="eyebrow">
        Finance Living OS
      </p>

      <h1>
        ${title}
      </h1>

      <p>
        ${description}
      </p>

      <div className="finance-admin-grid">
        <article>
          <span>
            Active
          </span>

          <strong>
            284
          </strong>
        </article>

        <article>
          <span>
            Pending
          </span>

          <strong>
            17
          </strong>
        </article>

        <article>
          <span>
            Flagged
          </span>

          <strong>
            4
          </strong>
        </article>

        <article>
          <span>
            Reviewed today
          </span>

          <strong>
            63
          </strong>
        </article>
      </div>
    </main>
  );
}
`,
    });
  }

  files.push({
    file: "prisma/schema.prisma",
    title: "Finance Database Schema",
    type: "prisma",
    content: `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Customer {
  id           String         @id @default(cuid())
  name         String
  email        String         @unique
  phone        String?
  accounts     Account[]
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt
}

model Account {
  id               String        @id @default(cuid())
  customerId       String?
  customer         Customer?     @relation(fields: [customerId], references: [id])
  name             String
  type             String
  currency         String        @default("USD")
  balance          Decimal       @db.Decimal(18, 2)
  availableBalance Decimal       @db.Decimal(18, 2)
  status           String        @default("active")
  transactions     Transaction[]
  outgoingTransfers Transfer[]   @relation("TransferFrom")
  incomingTransfers Transfer[]   @relation("TransferTo")
  createdAt        DateTime      @default(now())
  updatedAt        DateTime      @updatedAt
}

model Transaction {
  id          String    @id @default(cuid())
  accountId   String
  account     Account   @relation(fields: [accountId], references: [id])
  description String
  amount      Decimal   @db.Decimal(18, 2)
  type        String
  category    String
  status      String    @default("pending")
  postedAt    DateTime?
  createdAt   DateTime  @default(now())
}

model Transfer {
  id              String   @id @default(cuid())
  fromAccountId   String
  fromAccount     Account  @relation("TransferFrom", fields: [fromAccountId], references: [id])
  toAccountId     String
  toAccount       Account  @relation("TransferTo", fields: [toAccountId], references: [id])
  amount          Decimal  @db.Decimal(18, 2)
  memo            String?
  status          String   @default("pending-review")
  approvedAt      DateTime?
  processedAt     DateTime?
  createdAt       DateTime @default(now())
}

model Budget {
  id          String   @id @default(cuid())
  accountId   String
  category    String
  limit       Decimal  @db.Decimal(18, 2)
  spent       Decimal  @db.Decimal(18, 2)
  period      String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Beneficiary {
  id          String   @id @default(cuid())
  name        String
  accountRef  String
  bankName    String
  status      String   @default("active")
  createdAt   DateTime @default(now())
}

model RiskEvent {
  id          String   @id @default(cuid())
  accountId   String?
  transactionId String?
  severity    String
  category    String
  reason      String
  status      String   @default("open")
  createdAt   DateTime @default(now())
  resolvedAt  DateTime?
}

model ComplianceReview {
  id          String   @id @default(cuid())
  subjectType String
  subjectId   String
  type        String
  status      String   @default("pending")
  notes       String?
  createdAt   DateTime @default(now())
  completedAt DateTime?
}

model AuditLog {
  id          String   @id @default(cuid())
  actorId     String?
  action      String
  resource    String
  resourceId  String?
  metadata    Json?
  createdAt   DateTime @default(now())
}



model Setting {
  id        String   @id @default(cuid())
  key       String   @unique
  value     String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Category {
  id        String   @id @default(cuid())
  name      String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}



model SavingsGoal {
  id            String   @id @default(cuid())
  name          String
  targetAmount  Float
  currentAmount Float    @default(0)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
`,
  });

  files.push({
    file: "app/globals.css",
    title: "Premium Finance Design System",
    type: "css",
    content: `:root {
  --navy: #071525;
  --navy-soft: #10263c;
  --surface: #ffffff;
  --background: #eef3f6;
  --text: #152430;
  --muted: #667785;
  --emerald: #16866d;
  --emerald-light: #55b89f;
  --gold: #bc985e;
  --line: rgba(21,36,48,.13);
  --dark-line: rgba(255,255,255,.1);
  --shadow: 0 28px 80px rgba(7,21,37,.15);
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: var(--background);
  color: var(--text);
  font-family:
    Inter,
    ui-sans-serif,
    system-ui,
    sans-serif;
}

a {
  color: inherit;
  text-decoration: none;
}

button,
input,
select,
textarea {
  font: inherit;
}

.finance-header {
  position: sticky;
  top: 0;
  z-index: 30;
  display: grid;
  grid-template-columns:
    1fr auto auto;
  align-items: center;
  gap: 26px;
  padding: 18px 5vw;
  border-bottom:
    1px solid var(--dark-line);
  background:
    rgba(7,21,37,.95);
  color: #fff;
  backdrop-filter:
    blur(20px);
}

.finance-brand {
  display: flex;
  align-items: center;
  gap: 13px;
}

.finance-brand >
span:last-child {
  display: grid;
  gap: 2px;
}

.finance-brand small {
  color:
    rgba(255,255,255,.62);
  font-size: 11px;
}

.finance-mark {
  display: grid;
  width: 46px;
  height: 46px;
  place-items: center;
  border-radius: 13px;
  background:
    linear-gradient(
      135deg,
      var(--emerald),
      var(--emerald-light)
    );
  font-weight: 950;
}

.finance-header nav {
  display: flex;
  gap: 20px;
  color:
    rgba(255,255,255,.72);
  font-size: 14px;
  font-weight: 700;
}

.finance-button {
  display: inline-flex;
  justify-content: center;
  border: 0;
  border-radius: 11px;
  padding: 13px 18px;
  background:
    var(--emerald);
  color: #fff;
  font-weight: 900;
  cursor: pointer;
}

.finance-outline-button {
  display: inline-flex;
  justify-content: center;
  border:
    1px solid
    rgba(255,255,255,.18);
  border-radius: 11px;
  padding: 13px 18px;
  color: #fff;
  font-weight: 800;
}

.finance-hero {
  display: grid;
  min-height: 700px;
  grid-template-columns:
    1.1fr .9fr;
  align-items: center;
  gap: 56px;
  padding: 84px 7vw;
  background:
    radial-gradient(
      circle at 15% 0%,
      rgba(22,134,109,.18),
      transparent 30%
    ),
    var(--navy);
  color: #fff;
}

.finance-hero h1,
.content-section h2,
.financial-dashboard h1,
.transfer-form h1,
.finance-page h1,
.finance-admin-page h1 {
  margin: 0;
  font-size:
    clamp(50px,7vw,94px);
  line-height: .98;
  letter-spacing: -.05em;
}

.finance-hero h1 span {
  display: block;
  color:
    var(--emerald-light);
}

.finance-hero >
div >
p:not(.eyebrow) {
  max-width: 720px;
  color:
    rgba(255,255,255,.67);
  font-size: 20px;
  line-height: 1.7;
}

.eyebrow {
  color:
    var(--emerald);
  font-size: 11px;
  font-weight: 900;
  letter-spacing: .23em;
  text-transform: uppercase;
}

.hero-actions,
.finance-proof {
  display: flex;
  flex-wrap: wrap;
  gap: 13px;
  margin-top: 28px;
}

.finance-proof {
  color:
    rgba(255,255,255,.62);
  font-size: 13px;
  font-weight: 700;
}

.finance-preview,
.finance-feature-grid article,
.financial-dashboard,
.transfer-form,
.finance-page,
.finance-admin-page,
.transaction-panel {
  border:
    1px solid var(--line);
  border-radius: 25px;
  background:
    var(--surface);
  box-shadow:
    var(--shadow);
}

.finance-preview {
  padding: 32px;
  color:
    var(--text);
}

.finance-preview h2 {
  font-size: 40px;
  line-height: 1.1;
}

.finance-metrics,
.finance-feature-grid,
.dashboard-grid,
.finance-admin-grid,
.budget-grid {
  display: grid;
  grid-template-columns:
    repeat(
      3,
      minmax(0,1fr)
    );
  gap: 17px;
  margin-top: 28px;
}

.finance-metrics article,
.dashboard-grid article,
.finance-admin-grid article {
  display: grid;
  gap: 8px;
  padding: 18px;
  border:
    1px solid var(--line);
  border-radius: 17px;
  background:
    var(--background);
}

.finance-metrics strong,
.dashboard-grid strong,
.finance-admin-grid strong {
  font-size: 29px;
}

.finance-metrics span,
.dashboard-grid span,
.finance-admin-grid span {
  color:
    var(--muted);
  font-size: 13px;
}

.content-section,
.financial-dashboard,
.transfer-form,
.finance-page,
.finance-admin-page {
  padding: 60px 7vw;
}

.content-section h2 {
  max-width: 960px;
  font-size:
    clamp(42px,6vw,76px);
}

.finance-feature-grid article {
  padding: 25px;
}

.finance-feature-grid p {
  color:
    var(--muted);
  line-height: 1.7;
}

.financial-dashboard,
.transfer-form,
.finance-page,
.finance-admin-page {
  margin: 36px;
}

.financial-dashboard h1,
.transfer-form h1,
.finance-page h1,
.finance-admin-page h1 {
  font-size:
    clamp(44px,6vw,74px);
}

.dashboard-heading,
.section-heading-row {
  display: flex;
  justify-content:
    space-between;
  align-items: center;
  gap: 24px;
}

.balance-total {
  color:
    var(--emerald);
  font-size: 34px;
}

.transaction-panel {
  margin-top: 30px;
  padding: 25px;
  box-shadow: none;
}

.transaction-row {
  display: flex;
  justify-content:
    space-between;
  align-items: center;
  gap: 20px;
  padding: 16px 0;
  border-bottom:
    1px solid var(--line);
}

.transaction-row >
div {
  display: grid;
  gap: 4px;
}

.transaction-row span {
  color:
    var(--muted);
  font-size: 13px;
}

.form-grid {
  display: grid;
  grid-template-columns:
    repeat(
      2,
      minmax(0,1fr)
    );
  gap: 16px;
  margin: 28px 0;
}

.form-grid label {
  display: grid;
  gap: 7px;
  color:
    var(--muted);
  font-weight: 700;
}

.form-grid input,
.form-grid select {
  width: 100%;
  padding: 12px 13px;
  border:
    1px solid var(--line);
  border-radius: 10px;
  background: #fff;
}

.budget-grid article {
  display: grid;
  gap: 15px;
  padding: 22px;
  border:
    1px solid var(--line);
  border-radius: 18px;
  background:
    var(--background);
}

.budget-grid progress {
  width: 100%;
}

.budget-grid button {
  border:
    1px solid var(--line);
  border-radius: 10px;
  padding: 10px;
  background: #fff;
  cursor: pointer;
}

.finance-admin-page >
p:not(.eyebrow) {
  color:
    var(--muted);
  line-height: 1.7;
}

@media (
  max-width: 980px
) {
  .finance-header {
    grid-template-columns:
      1fr auto;
  }

  .finance-header nav {
    display: none;
  }

  .finance-hero,
  .finance-metrics,
  .finance-feature-grid,
  .dashboard-grid,
  .finance-admin-grid,
  .budget-grid,
  .form-grid {
    grid-template-columns:
      1fr;
  }

  .dashboard-heading {
    align-items:
      flex-start;
    flex-direction:
      column;
  }
}

/* FINANCE_PRODUCTION_VISUAL_STORY_CSS */

.finance-hero-visual {
  overflow: hidden;
  margin: -8px -8px 24px;
  border-radius: 22px;
  border:
    1px solid
    rgba(255,255,255,.12);
  background:
    rgba(255,255,255,.035);
  box-shadow:
    0 24px 70px
    rgba(0,0,0,.18);
}

.finance-hero-visual img {
  display: block;
  width: 100%;
  height: auto;
}

.finance-story-section {
  display: grid;
  grid-template-columns:
    minmax(0, .92fr)
    minmax(420px, 1.08fr);
  align-items: center;
  gap:
    clamp(38px, 6vw, 88px);
  padding:
    clamp(72px, 9vw, 132px)
    6vw;
  background:
    var(--surface);
}

.finance-story-copy {
  max-width: 680px;
}

.finance-story-copy h2 {
  max-width: 720px;
  margin:
    10px 0 20px;
  font-size:
    clamp(36px, 4.8vw, 68px);
  line-height: .99;
  letter-spacing: -.045em;
}

.finance-story-copy > p {
  max-width: 640px;
  color:
    var(--muted);
  font-size: 18px;
  line-height: 1.75;
}

.finance-story-points {
  display: grid;
  gap: 12px;
  margin-top: 30px;
}

.finance-story-points article {
  display: grid;
  gap: 6px;
  padding:
    18px 20px;
  border:
    1px solid var(--line);
  border-radius: 16px;
  background:
    #f8fafc;
}

.finance-story-points strong {
  color:
    var(--navy);
}

.finance-story-points span {
  color:
    var(--muted);
  line-height: 1.55;
}

.finance-story-visual {
  position: relative;
  min-width: 0;
}

.finance-story-visual > img:first-child {
  display: block;
  width: 100%;
  height: auto;
  border:
    1px solid var(--line);
  border-radius: 26px;
  background:
    #fff;
  box-shadow:
    var(--shadow);
}

.finance-story-thumbnail {
  position: absolute;
  right: -24px;
  bottom: -34px;
  width:
    min(42%, 250px);
  overflow: hidden;
  border:
    7px solid #fff;
  border-radius: 18px;
  background:
    #fff;
  box-shadow:
    0 22px 55px
    rgba(7,21,37,.22);
}

.finance-story-thumbnail img {
  display: block;
  width: 100%;
  height: auto;
}

.finance-story-thumbnail span {
  display: block;
  padding:
    10px 12px;
  color:
    var(--navy);
  font-size: 12px;
  font-weight: 700;
}

/* FINANCE_PRODUCTION_VISUAL_STORY_MOBILE */

@media (max-width: 980px) {
  .finance-story-section {
    grid-template-columns: 1fr;
  }

  .finance-story-copy {
    max-width: none;
  }

  .finance-story-visual {
    padding-bottom: 36px;
  }

  .finance-story-thumbnail {
    right: 18px;
    bottom: 0;
  }
}

@media (max-width: 640px) {
  .finance-hero-visual {
    margin:
      0 0 20px;
    border-radius: 16px;
  }

  .finance-story-section {
    padding:
      64px 5vw;
  }

  .finance-story-copy h2 {
    font-size:
      clamp(34px, 11vw, 48px);
  }

  .finance-story-thumbnail {
    position: relative;
    right: auto;
    bottom: auto;
    width: 62%;
    margin:
      -24px 18px 0 auto;
  }
}

`,
  });

  return files;
}
