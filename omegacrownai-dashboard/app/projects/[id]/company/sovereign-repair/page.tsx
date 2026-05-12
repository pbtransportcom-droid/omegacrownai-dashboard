import Link from "next/link";
import { prisma } from "@/lib/db";
import { OmegaLogo } from "@/components/brand/OmegaLogo";
import { getSovereignRepairDashboard } from "@/lib/sugent/sovereign-repair/sovereignRepairEngine";

export default async function SovereignRepairPage({
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
      take: 1,
    }),
  ]);

  const company = companies[0] || null;
  const data = company ? await getSovereignRepairDashboard(company.id) : null;

  const videoProjects = company
    ? await prisma.videoProject.findMany({
        where: { companyId: company.id },
        orderBy: { createdAt: "desc" },
        take: 25,
      })
    : [];

  return (
    <main className="space-y-6">
      <div className="flex justify-center">
        <OmegaLogo className="h-16 w-auto object-contain" />
      </div>

      <section className="rounded-3xl border border-border bg-panel/70 p-6">
        <Link href={`/projects/${id}/company/executive`} className="text-sm text-cyan-300 hover:underline">
          ← Back to Executive Command Center
        </Link>

        <p className="mt-5 text-xs uppercase tracking-[0.25em] text-amber-300">
          Sovereign Policy Repair + Auto-Remediation · Phase 40
        </p>

        <h1 className="mt-3 text-4xl font-black text-white">
          Sovereign Repair · {project?.name || "Project"}
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
          Automatically repairs missing QA, passport, identity, audit, deployment, and governance blockers when runtime policy blocks unsafe actions.
        </p>
      </section>

      {company && data ? (
        <>
          <section className="grid gap-4 md:grid-cols-6">
            <Metric label="Runs" value={String(data.summary.runs)} />
            <Metric label="Repaired" value={String(data.summary.repaired)} />
            <Metric label="Partial" value={String(data.summary.partial)} />
            <Metric label="Blocked" value={String(data.summary.blocked)} />
            <Metric label="Running" value={String(data.summary.running)} />
            <Metric label="Failed Actions" value={String(data.summary.failedActions)} />
          </section>

          <section className="rounded-3xl border border-border bg-panel/70 p-5">
            <h2 className="text-xl font-black text-white">Run Auto-Repair</h2>

            <form
              action={`/api/company/${company.id}/sovereign-repair/run`}
              method="POST"
              className="mt-4 grid gap-3"
            >
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  name="actorId"
                  defaultValue="system-owner"
                  className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none"
                />

                <select
                  name="projectId"
                  defaultValue=""
                  className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none"
                >
                  <option value="">No project</option>
                  {videoProjects.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <input
                  name="resource"
                  defaultValue="runtime"
                  className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none"
                />

                <select
                  name="action"
                  defaultValue="publish"
                  className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none"
                >
                  <option value="render">render</option>
                  <option value="publish">publish</option>
                  <option value="deploy">deploy</option>
                  <option value="rollback">rollback</option>
                  <option value="issue">issue</option>
                </select>

                <select
                  name="projectType"
                  defaultValue="video"
                  className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none"
                >
                  <option value="video">video</option>
                  <option value="podcast">podcast</option>
                </select>
              </div>

              <button className="rounded-xl bg-amber-600 px-5 py-3 text-sm font-black text-white hover:bg-amber-500">
                Auto-Repair Runtime Blockers
              </button>
            </form>
          </section>

          <section className="rounded-3xl border border-border bg-panel/70 p-5">
            <h2 className="text-xl font-black text-white">Repair Runs</h2>

            <div className="mt-4 space-y-3">
              {data.runs.length ? (
                data.runs.map((run: any) => (
                  <div key={run.id} className="rounded-2xl border border-border bg-black/20 p-4">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                      <div>
                        <div className="text-sm font-black text-white">
                          {run.resource || "runtime"} repair run
                        </div>
                        <div className="mt-1 text-xs text-amber-300">
                          {run.status} · {run.triggerType} · {run.actorType}
                        </div>
                        <div className="mt-1 font-mono text-[11px] text-muted">{run.id}</div>
                      </div>

                      <span className={`rounded-full px-3 py-1 text-xs font-black ${
                        run.status === "repaired"
                          ? "bg-emerald-600 text-white"
                          : run.status === "partial"
                            ? "bg-yellow-600 text-white"
                            : run.status === "blocked"
                              ? "bg-red-600 text-white"
                              : "bg-slate-700 text-white"
                      }`}>
                        {run.status}
                      </span>
                    </div>

                    <pre className="mt-3 max-h-40 overflow-auto rounded-xl border border-border bg-slate-950 p-3 text-xs text-slate-200">
                      {JSON.stringify(run.failedChecks || [], null, 2)}
                    </pre>

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      {run.actions.map((action: any) => (
                        <div key={action.id} className="rounded-xl border border-border bg-slate-950 p-3">
                          <div className="text-xs font-black uppercase tracking-[0.14em] text-amber-300">
                            {action.checkName}
                          </div>
                          <div className="mt-1 text-sm font-bold text-white">{action.actionType}</div>
                          <div className="mt-1 text-xs text-muted">{action.status}</div>
                          {action.error && <p className="mt-2 text-xs text-red-200">{action.error}</p>}
                        </div>
                      ))}
                    </div>

                    <pre className="mt-3 max-h-72 overflow-auto rounded-xl border border-border bg-slate-950 p-3 text-xs text-slate-200">
                      {JSON.stringify(run.resultJson || {}, null, 2)}
                    </pre>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-border bg-black/20 p-4 text-sm text-muted">
                  No repair runs yet.
                </div>
              )}
            </div>
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
