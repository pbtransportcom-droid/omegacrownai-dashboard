import Link from "next/link";
import { prisma } from "@/lib/db";
import { OmegaLogo } from "@/components/brand/OmegaLogo";
import { getQAImprovementDashboard } from "@/lib/sugent/quality/qaImprovementEngine";

export default async function QAImprovementPage({
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
  const data = company ? await getQAImprovementDashboard(company.id) : null;

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

        <p className="mt-5 text-xs uppercase tracking-[0.25em] text-teal-300">
          QA Improvement Loop + Auto-Quality Repair · Phase 42
        </p>

        <h1 className="mt-3 text-4xl font-black text-white">
          QA Improvement Loop · {project?.name || "Project"}
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
          Automatically improves blocked QA scorecards by applying prompt accuracy, factual/legendary consistency, and production-quality repair patches until publish policy can pass.
        </p>
      </section>

      {company && data ? (
        <>
          <section className="grid gap-4 md:grid-cols-6">
            <Metric label="Runs" value={String(data.summary.runs)} />
            <Metric label="Repaired" value={String(data.summary.repaired)} />
            <Metric label="QA Blocked" value={String(data.summary.qaBlocked)} />
            <Metric label="Policy Blocked" value={String(data.summary.qualityPassedPolicyBlocked)} />
            <Metric label="Running" value={String(data.summary.running)} />
            <Metric label="Best Score" value={String(data.summary.bestScore)} />
          </section>

          <section className="rounded-3xl border border-border bg-panel/70 p-5">
            <h2 className="text-xl font-black text-white">Run QA Improvement</h2>

            <form
              action={`/api/company/${company.id}/qa-improvement/run`}
              method="POST"
              className="mt-4 grid gap-3"
            >
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  name="actorId"
                  defaultValue="qa-improvement"
                  className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none"
                />

                <select
                  name="projectId"
                  defaultValue=""
                  required
                  className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none"
                >
                  <option value="">Select project</option>
                  {videoProjects.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <input
                  name="targetScore"
                  defaultValue="80"
                  className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none"
                />

                <input
                  name="maxAttempts"
                  defaultValue="3"
                  className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none"
                />

                <select
                  name="projectType"
                  defaultValue="video"
                  className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none"
                >
                  <option value="video">video</option>
                  <option value="podcast">podcast</option>
                </select>
              </div>

              <button className="rounded-xl bg-teal-600 px-5 py-3 text-sm font-black text-white hover:bg-teal-500">
                Improve QA Until Publish Can Pass
              </button>
            </form>
          </section>

          <section className="rounded-3xl border border-border bg-panel/70 p-5">
            <h2 className="text-xl font-black text-white">Improvement Runs</h2>

            <div className="mt-4 space-y-3">
              {data.runs.length ? (
                data.runs.map((run: any) => (
                  <div key={run.id} className="rounded-2xl border border-border bg-black/20 p-4">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                      <div>
                        <div className="text-sm font-black text-white">
                          QA Improvement · {run.projectType}
                        </div>
                        <div className="mt-1 text-xs text-teal-300">
                          {run.status} · score {run.initialScore ?? "none"} → {run.finalScore ?? "none"} · target {run.targetScore}
                        </div>
                        <div className="mt-1 font-mono text-[11px] text-muted">{run.id}</div>
                      </div>

                      <span className={`rounded-full px-3 py-1 text-xs font-black ${
                        run.status === "repaired"
                          ? "bg-emerald-600 text-white"
                          : run.status === "qa_blocked"
                            ? "bg-red-600 text-white"
                            : "bg-slate-700 text-white"
                      }`}>
                        {run.status}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      {run.actions.map((action: any) => (
                        <div key={action.id} className="rounded-xl border border-border bg-slate-950 p-3">
                          <div className="text-xs font-black uppercase tracking-[0.14em] text-teal-300">
                            {action.actionType}
                          </div>
                          <div className="mt-1 text-sm text-white">{action.priority}</div>
                          <div className="mt-1 text-xs text-muted">{action.status}</div>
                          {action.reason && <p className="mt-2 text-xs text-slate-300">{action.reason}</p>}
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
                  No QA improvement runs yet.
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
