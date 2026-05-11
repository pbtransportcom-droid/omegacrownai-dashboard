import Link from "next/link";
import { OmegaLogo } from "@/components/brand/OmegaLogo";
import { getExecutiveCommandCenter } from "@/lib/sugent/executive/commandCenter";

export default async function ExecutiveCommandCenterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getExecutiveCommandCenter(id);

  if (!data.ok || !data.company) {
    return (
      <main className="space-y-6">
        <div className="flex justify-center">
          <OmegaLogo className="h-16 w-auto object-contain" />
        </div>

        <section className="rounded-3xl border border-border bg-panel/70 p-6">
          <Link href={`/projects/${id}/company`} className="text-sm text-cyan-300 hover:underline">
            ← Back to Company OS
          </Link>

          <h1 className="mt-5 text-4xl font-black text-white">Executive Command Center</h1>
          <p className="mt-3 text-sm text-muted">{data.error || "No company exists yet."}</p>
        </section>
      </main>
    );
  }

  const summary = data.summary;
  const company = data.company;

  return (
    <main className="space-y-6">
      <div className="flex justify-center">
        <OmegaLogo className="h-16 w-auto object-contain" />
      </div>

      <section className="rounded-3xl border border-border bg-panel/70 p-6">
        <Link href={`/projects/${id}/company`} className="text-sm text-cyan-300 hover:underline">
          ← Back to Company OS
        </Link>

        <p className="mt-5 text-xs uppercase tracking-[0.25em] text-yellow-300">
          OmegaCrown AI · CEO Command Layer
        </p>

        <h1 className="mt-3 text-4xl font-black text-white">
          Executive Command Center
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
          Unified view of departments, workers, tasks, KPIs, revenue, pipeline, operations, and support risk for {company.name}.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={`/projects/${id}/company/executive/history`}
            className="rounded-xl border border-yellow-400/30 bg-yellow-500/10 px-5 py-3 text-sm font-black text-yellow-100 hover:bg-yellow-500/20"
          >
            Executive History
          </Link>

          <a
            href={`/api/projects/${id}/executive/report`}
            className="rounded-xl border border-yellow-400/30 bg-yellow-500/10 px-5 py-3 text-sm font-black text-yellow-100 hover:bg-yellow-500/20"
          >
            Daily Executive Report
          </a>

          <form action={`/api/projects/${id}/executive/action-plan`} method="POST">
            <button className="rounded-xl border border-yellow-400/30 bg-yellow-500/10 px-5 py-3 text-sm font-black text-yellow-100 hover:bg-yellow-500/20">
              Create CEO Action Plan
            </button>
          </form>

          <form action={`/api/projects/${id}/executive/run`} method="POST">
            <input type="hidden" name="sessionId" value={`executive-${id}`} />
            <input type="hidden" name="runtimeSessionId" value={`executive-${id}`} />
            <input type="hidden" name="limit" value="10" />
            <button className="rounded-xl bg-yellow-600 px-5 py-3 text-sm font-black text-white hover:bg-yellow-500">
              Run Executive Loop
            </button>
          </form>

          <Link href={`/projects/${id}/company/departments`} className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-5 py-3 text-sm font-black text-emerald-100 hover:bg-emerald-500/20">
            Departments
          </Link>
          <Link href={`/projects/${id}/company/marketing`} className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-5 py-3 text-sm font-black text-amber-100 hover:bg-amber-500/20">
            Marketing
          </Link>

          <Link href={`/projects/${id}/company/video`} className="rounded-xl border border-fuchsia-400/30 bg-fuchsia-500/10 px-5 py-3 text-sm font-black text-fuchsia-100 hover:bg-fuchsia-500/20">
            Video Studio
          </Link>

          <Link href={`/projects/${id}/company/podcast`} className="rounded-xl border border-purple-400/30 bg-purple-500/10 px-5 py-3 text-sm font-black text-purple-100 hover:bg-purple-500/20">
            Podcast Studio
          </Link>

          <Link href={`/projects/${id}/company/distribution`} className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-5 py-3 text-sm font-black text-emerald-100 hover:bg-emerald-500/20">
            Distribution
          </Link>

          <Link href={`/projects/${id}/company/versioning`} className="rounded-xl border border-sky-400/30 bg-sky-500/10 px-5 py-3 text-sm font-black text-sky-100 hover:bg-sky-500/20">
            Versioning
          </Link>

          <Link href={`/projects/${id}/company/creative-studio`} className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-5 py-3 text-sm font-black text-rose-100 hover:bg-rose-500/20">
            Creative Studio
          </Link>

          <Link href={`/projects/${id}/company/workspaces`} className="rounded-xl border border-indigo-400/30 bg-indigo-500/10 px-5 py-3 text-sm font-black text-indigo-100 hover:bg-indigo-500/20">
            Workspaces
          </Link>

          <Link href="/runtime" className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-5 py-3 text-sm font-black text-cyan-100 hover:bg-cyan-500/20">
            Runtime
          </Link>

          <Link href={`/projects/${id}/company/directors-room`} className="rounded-xl border border-yellow-400/30 bg-yellow-500/10 px-5 py-3 text-sm font-black text-yellow-100 hover:bg-yellow-500/20">
            Director's Room
          </Link>
          <Link href={`/projects/${id}/company/sales`} className="rounded-xl border border-sky-400/30 bg-sky-500/10 px-5 py-3 text-sm font-black text-sky-100 hover:bg-sky-500/20">
            Sales
          </Link>
          <Link href={`/projects/${id}/company/finance`} className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-5 py-3 text-sm font-black text-emerald-100 hover:bg-emerald-500/20">
            Finance
          </Link>
          <Link href={`/projects/${id}/company/operations`} className="rounded-xl border border-violet-400/30 bg-violet-500/10 px-5 py-3 text-sm font-black text-violet-100 hover:bg-violet-500/20">
            Operations
          </Link>
          <Link href={`/projects/${id}/company/support`} className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-5 py-3 text-sm font-black text-rose-100 hover:bg-rose-500/20">
            Support
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric label="Departments" value={String(summary.departments)} />
        <Metric label="Workers" value={`${summary.idleWorkers}/${summary.workers} idle`} />
        <Metric label="Pending Tasks" value={String(summary.pendingTasks)} />
        <Metric label="KPI Records" value={String(summary.departmentKpis)} />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric label="Pipeline Value" value={`$${Number(summary.pipelineValue || 0).toLocaleString()}`} />
        <Metric label="Revenue" value={`$${Number(summary.revenue || 0).toLocaleString()}`} />
        <Metric label="Net" value={`$${Number(summary.net || 0).toLocaleString()}`} />
        <Metric label="Runway" value={`${summary.runwayMonths || 0} mo`} />
      </section>

      <section className="grid gap-4 xl:grid-cols-5">
        <DepartmentCard
          title="Marketing"
          href={`/projects/${id}/company/marketing`}
          colorClass="text-amber-300"
          metrics={[
            ["Campaigns", summary.campaigns],
            ["Assets", summary.marketingAssets],
          ]}
        />

        <DepartmentCard
          title="Sales"
          href={`/projects/${id}/company/sales`}
          colorClass="text-sky-300"
          metrics={[
            ["Open Deals", summary.openDeals],
            ["Pipeline", `$${Number(summary.pipelineValue || 0).toLocaleString()}`],
          ]}
        />

        <DepartmentCard
          title="Finance"
          href={`/projects/${id}/company/finance`}
          colorClass="text-emerald-300"
          metrics={[
            ["Cash", `$${Number(summary.cashBalance || 0).toLocaleString()}`],
            ["Runway", `${summary.runwayMonths || 0} mo`],
          ]}
        />

        <DepartmentCard
          title="Operations"
          href={`/projects/${id}/company/operations`}
          colorClass="text-violet-300"
          metrics={[
            ["Processes", summary.operationsProcesses],
            ["Runs", summary.operationsRuns],
          ]}
        />

        <DepartmentCard
          title="Support"
          href={`/projects/${id}/company/support`}
          colorClass="text-rose-300"
          metrics={[
            ["Open", summary.openSupportTickets],
            ["High", summary.highPrioritySupport],
          ]}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-3xl border border-border bg-panel/70 p-5">
          <h2 className="text-xl font-black text-white">Executive Recommendations</h2>

          <div className="mt-4 space-y-3">
            {data.recommendations.map((item: any, index: number) => (
              <div key={index} className="rounded-2xl border border-border bg-black/20 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-yellow-300">
                  {item.priority} · {item.area}
                </div>
                <h3 className="mt-2 text-sm font-black text-white">{item.title}</h3>
                <p className="mt-2 text-xs leading-5 text-muted">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-panel/70 p-5">
          <h2 className="text-xl font-black text-white">Open Task Queue</h2>

          <div className="mt-4 space-y-3">
            {company.tasks.filter((task: any) => task.status !== "success").length ? (
              company.tasks
                .filter((task: any) => task.status !== "success")
                .slice(0, 12)
                .map((task: any) => (
                  <div key={task.id} className="rounded-2xl border border-border bg-black/20 p-4">
                    <div className="text-sm font-bold text-white">
                      {task.type} · {task.status}
                    </div>
                    <div className="mt-1 font-mono text-xs text-muted">{task.id}</div>
                    <div className="mt-2 text-xs leading-5 text-muted">
                      {(task.input as any)?.message || "No message"}
                    </div>
                    {task.worker && (
                      <div className="mt-2 text-xs text-cyan-200">
                        Worker: {task.worker.name} / {task.worker.role}
                      </div>
                    )}
                  </div>
                ))
            ) : (
              <div className="rounded-xl border border-border bg-black/20 p-4 text-sm text-muted">
                No open tasks.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-panel/70 p-5">
        <h2 className="text-xl font-black text-white">Department KPI Rollup</h2>
        <pre className="mt-4 max-h-96 overflow-auto rounded-xl border border-border bg-slate-950 p-4 text-xs text-slate-200">
          {JSON.stringify(data.departmentKpis, null, 2)}
        </pre>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-black/20 p-4">
      <div className="text-xs uppercase tracking-[0.18em] text-muted">{label}</div>
      <div className="mt-2 truncate text-2xl font-black text-white">{value}</div>
    </div>
  );
}

function DepartmentCard({
  title,
  href,
  colorClass,
  metrics,
}: {
  title: string;
  href: string;
  colorClass: string;
  metrics: Array<[string, any]>;
}) {
  return (
    <a href={href} className="rounded-3xl border border-border bg-panel/70 p-5 hover:bg-white/5">
      <div className={`text-xs uppercase tracking-[0.18em] ${colorClass}`}>
        Department
      </div>
      <h2 className="mt-3 text-2xl font-black text-white">{title}</h2>

      <div className="mt-4 space-y-2">
        {metrics.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between rounded-xl border border-border bg-black/20 px-3 py-2">
            <span className="text-xs text-muted">{label}</span>
            <span className="text-sm font-black text-white">{String(value)}</span>
          </div>
        ))}
      </div>
    </a>
  );
}
