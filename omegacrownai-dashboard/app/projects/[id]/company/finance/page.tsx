import Link from "next/link";
import { prisma } from "@/lib/db";
import { OmegaLogo } from "@/components/brand/OmegaLogo";

export default async function FinanceDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [project, companies] = await Promise.all([
    prisma.project.findUnique({ where: { id } }),
    prisma.company.findMany({
      where: { projectId: id },
      orderBy: { createdAt: "desc" },
      include: {
        departments: {
          where: { slug: "finance" },
          take: 1,
        },
      },
    }),
  ]);

  const company = companies[0] || null;

  const [accounts, transactions, forecasts] = company
    ? await Promise.all([
        prisma.financeAccount.findMany({
          where: { companyId: company.id },
          orderBy: { createdAt: "desc" },
          take: 50,
        }),
        prisma.financeTransaction.findMany({
          where: { companyId: company.id },
          orderBy: { occurredAt: "desc" },
          take: 100,
          include: { account: true },
        }),
        prisma.financeForecast.findMany({
          where: { companyId: company.id },
          orderBy: { createdAt: "desc" },
          take: 50,
        }),
      ])
    : [[], [], []];

  const revenue = transactions
    .filter((item) => item.type === "revenue")
    .reduce((sum, item) => sum + item.amount, 0);

  const expenses = transactions
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + item.amount, 0);

  const cashBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

  return (
    <main className="space-y-6">
      <div className="flex justify-center">
        <OmegaLogo className="h-16 w-auto object-contain" />
      </div>

      <section className="rounded-3xl border border-border bg-panel/70 p-6">
        <Link href={`/projects/${id}/company/departments`} className="text-sm text-cyan-300 hover:underline">
          ← Back to Departments
        </Link>

        <p className="mt-5 text-xs uppercase tracking-[0.25em] text-emerald-300">
          Finance Department Engine
        </p>

        <h1 className="mt-3 text-4xl font-black text-white">
          Finance Engine · {project?.name || "Project"}
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
          Track revenue, expenses, cash balance, forecast runway, and finance department KPIs.
        </p>
      </section>

      {company ? (
        <>
          <section className="grid gap-4 md:grid-cols-5">
            <Metric label="Revenue" value={`$${revenue.toLocaleString()}`} />
            <Metric label="Expenses" value={`$${expenses.toLocaleString()}`} />
            <Metric label="Net" value={`$${(revenue - expenses).toLocaleString()}`} />
            <Metric label="Cash Balance" value={`$${cashBalance.toLocaleString()}`} />
            <Metric label="Runway" value={`${forecasts[0]?.runwayMonths || 0} mo`} />
          </section>

          <section className="rounded-3xl border border-border bg-panel/70 p-5">
            <h2 className="text-xl font-black text-white">Add Transaction</h2>

            <form
              action={`/api/company/${company.id}/finance/transactions`}
              method="POST"
              className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5"
            >
              <select
                name="type"
                defaultValue="revenue"
                className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none"
              >
                <option value="revenue">Revenue</option>
                <option value="expense">Expense</option>
              </select>

              <input
                name="category"
                placeholder="Category"
                className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none"
              />

              <input
                name="amount"
                placeholder="Amount"
                type="number"
                step="0.01"
                className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none"
              />

              <input
                name="description"
                placeholder="Description"
                className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none"
              />

              <button className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-black text-white hover:bg-emerald-500">
                Save Transaction
              </button>
            </form>
          </section>

          <section className="grid gap-4 xl:grid-cols-2">
            <Panel title="Accounts" value={accounts} />
            <Panel title="Latest Forecast" value={forecasts[0] || {}} />
          </section>

          <section className="rounded-3xl border border-border bg-panel/70 p-5">
            <h2 className="text-xl font-black text-white">Recent Transactions</h2>

            <div className="mt-4 space-y-3">
              {transactions.length ? (
                transactions.map((transaction) => (
                  <div key={transaction.id} className="rounded-2xl border border-border bg-black/20 p-4">
                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="text-sm font-bold text-white">
                          {transaction.type} · {transaction.category} · ${transaction.amount.toLocaleString()}
                        </div>
                        <div className="mt-1 text-xs text-muted">
                          {transaction.description || "No description."}
                        </div>
                        <div className="mt-1 text-xs text-emerald-200">
                          Account: {transaction.account?.name || "No account"}
                        </div>
                      </div>

                      <div className="font-mono text-xs text-muted">{transaction.id}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-border bg-black/20 p-4 text-sm text-muted">
                  No transactions yet.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-panel/70 p-5">
            <h2 className="text-xl font-black text-white">Forecasts</h2>
            <Panel title="Forecast History" value={forecasts} />
          </section>
        </>
      ) : (
        <section className="rounded-2xl border border-border bg-black/20 p-5 text-sm text-muted">
          No company exists for this project yet.
        </section>
      )}
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-black/20 p-4">
      <div className="text-xs uppercase tracking-[0.18em] text-muted">{label}</div>
      <div className="mt-2 truncate text-xl font-black text-white">{value}</div>
    </div>
  );
}

function Panel({ title, value }: { title: string; value: any }) {
  return (
    <div className="rounded-xl border border-border bg-slate-950 p-3">
      <div className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-300">
        {title}
      </div>
      <pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap text-xs text-slate-200">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}
