import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function ProjectCompanyPage({
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
        kpis: {
          orderBy: { timestamp: "desc" },
          take: 20,
        },
        memory: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        workers: {
          orderBy: { createdAt: "asc" },
          take: 20,
        },
        tasks: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    }),
  ]);

  return (
    <main className="space-y-6">
      <section className="rounded-3xl border border-border bg-panel/70 p-6">
        <Link href={`/projects/${id}`} className="text-sm text-cyan-300 hover:underline">
          ← Back to project
        </Link>

        <p className="mt-5 text-xs uppercase tracking-[0.25em] text-emerald-300">
          Sugent OS v2.0
        </p>

        <h1 className="mt-3 text-4xl font-black text-white">
          Autonomous Company Builder · {project?.name || "Project"}
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
          Create and manage company strategy, KPIs, memory, workers, and task state.
        </p>
      </section>

      <section className="rounded-3xl border border-border bg-panel/70 p-5">
        <h2 className="text-xl font-black text-white">Create Company</h2>

        <form action="/api/company" method="POST" className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <input type="hidden" name="projectId" value={id} />

          <input
            name="name"
            placeholder="Company name"
            className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none"
          />

          <input
            name="mission"
            placeholder="Mission"
            className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none"
          />

          <input
            name="vision"
            placeholder="Vision"
            className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none"
          />

          <button className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-black text-white hover:bg-emerald-500">
            Create Company
          </button>
        </form>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <Metric label="Companies" value={String(companies.length)} />
        <Metric label="Workers" value={String(companies.reduce((sum, company) => sum + company.workers.length, 0))} />
        <Metric label="KPIs" value={String(companies.reduce((sum, company) => sum + company.kpis.length, 0))} />
        <Metric label="Tasks" value={String(companies.reduce((sum, company) => sum + company.tasks.length, 0))} />
      </section>

      <section className="space-y-4">
        {companies.length ? (
          companies.map((company) => (
            <div key={company.id} className="rounded-3xl border border-border bg-panel/70 p-5">
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-2xl font-black text-white">{company.name}</h2>
                  <p className="mt-2 text-sm text-muted">{company.mission || "No mission set."}</p>
                  <p className="mt-1 font-mono text-xs text-muted">{company.id}</p>
                </div>

                <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-100">
                  {company.status}
                </div>
              </div>

              <div className="mt-5 grid gap-4 xl:grid-cols-4">
                <Panel title="KPIs" value={company.kpis} />
                <Panel title="Memory" value={company.memory} />
                <Panel title="Workers" value={company.workers} />
                <Panel title="Tasks" value={company.tasks} />
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-border bg-black/20 p-5 text-sm text-muted">
            No company has been created for this project yet.
          </div>
        )}
      </section>
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
      <pre className="mt-2 max-h-72 overflow-auto text-xs text-slate-200">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}
