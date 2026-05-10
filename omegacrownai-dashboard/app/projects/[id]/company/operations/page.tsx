import Link from "next/link";
import { prisma } from "@/lib/db";
import { OmegaLogo } from "@/components/brand/OmegaLogo";

export default async function OperationsDashboardPage({
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
          where: { slug: "operations" },
          take: 1,
        },
      },
    }),
  ]);

  const company = companies[0] || null;

  const [processes, checklists, runs] = company
    ? await Promise.all([
        prisma.operationsProcess.findMany({
          where: { companyId: company.id },
          orderBy: { createdAt: "desc" },
          take: 50,
          include: {
            checklists: { take: 5, orderBy: { createdAt: "desc" } },
            runs: { take: 5, orderBy: { createdAt: "desc" } },
          },
        }),
        prisma.operationsChecklist.findMany({
          where: { companyId: company.id },
          orderBy: { createdAt: "desc" },
          take: 50,
          include: { process: true },
        }),
        prisma.operationsRun.findMany({
          where: { companyId: company.id },
          orderBy: { createdAt: "desc" },
          take: 50,
          include: { process: true },
        }),
      ])
    : [[], [], []];

  return (
    <main className="space-y-6">
      <div className="flex justify-center">
        <OmegaLogo className="h-16 w-auto object-contain" />
      </div>

      <section className="rounded-3xl border border-border bg-panel/70 p-6">
        <Link href={`/projects/${id}/company/departments`} className="text-sm text-cyan-300 hover:underline">
          ← Back to Departments
        </Link>

        <p className="mt-5 text-xs uppercase tracking-[0.25em] text-violet-300">
          Operations Department Engine
        </p>

        <h1 className="mt-3 text-4xl font-black text-white">
          Operations Engine · {project?.name || "Project"}
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
          Generate SOPs, checklists, process runs, workflow trackers, and operations execution KPIs.
        </p>
      </section>

      {company ? (
        <>
          <section className="grid gap-4 md:grid-cols-5">
            <Metric label="Processes" value={String(processes.length)} />
            <Metric label="Active" value={String(processes.filter((process) => process.status === "active").length)} />
            <Metric label="Checklists" value={String(checklists.length)} />
            <Metric label="Runs" value={String(runs.length)} />
            <Metric label="Completed" value={String(runs.filter((run) => run.status === "completed").length)} />
          </section>

          <section className="rounded-3xl border border-border bg-panel/70 p-5">
            <h2 className="text-xl font-black text-white">Create Operations Process</h2>

            <form
              action={`/api/company/${company.id}/operations/processes`}
              method="POST"
              className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5"
            >
              <input
                name="name"
                placeholder="Process name"
                className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none"
              />

              <input
                name="objective"
                placeholder="Objective"
                className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none xl:col-span-2"
              />

              <select
                name="priority"
                defaultValue="medium"
                className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>

              <button className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-black text-white hover:bg-violet-500">
                Generate SOP
              </button>
            </form>
          </section>

          <section className="space-y-4">
            {processes.length ? (
              processes.map((process) => (
                <div key={process.id} className="rounded-3xl border border-border bg-panel/70 p-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h2 className="text-2xl font-black text-white">{process.name}</h2>
                      <p className="mt-2 text-sm text-muted">{process.description || "No description."}</p>
                      <p className="mt-1 font-mono text-xs text-muted">{process.id}</p>
                    </div>

                    <div className="rounded-xl border border-violet-400/30 bg-violet-500/10 px-3 py-2 text-xs font-bold text-violet-100">
                      {process.priority} · {process.status}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 xl:grid-cols-3">
                    <Panel title="Steps" value={process.steps || []} />
                    <Panel title="Checklists" value={process.checklists || []} />
                    <Panel title="Recent Runs" value={process.runs || []} />
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-border bg-black/20 p-5 text-sm text-muted">
                No operations processes yet.
              </div>
            )}
          </section>

          <section className="grid gap-4 xl:grid-cols-2">
            <Panel title="All Checklists" value={checklists} />
            <Panel title="All Runs" value={runs} />
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
      <div className="text-xs font-bold uppercase tracking-[0.16em] text-violet-300">
        {title}
      </div>
      <pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap text-xs text-slate-200">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}
