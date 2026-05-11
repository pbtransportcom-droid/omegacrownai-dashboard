import Link from "next/link";
import { prisma } from "@/lib/db";
import { OmegaLogo } from "@/components/brand/OmegaLogo";
import { getReliabilityDashboard } from "@/lib/sugent/reliability/jobRunner";

export default async function ReliabilityPage({
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
  const data = company ? await getReliabilityDashboard(company.id) : null;

  return (
    <main className="space-y-6">
      <div className="flex justify-center">
        <OmegaLogo className="h-16 w-auto object-contain" />
      </div>

      <section className="rounded-3xl border border-border bg-panel/70 p-6">
        <Link href={`/projects/${id}/company/executive`} className="text-sm text-cyan-300 hover:underline">
          ← Back to Executive Command Center
        </Link>

        <p className="mt-5 text-xs uppercase tracking-[0.25em] text-red-300">
          SLA + Reliability · Phase 29
        </p>

        <h1 className="mt-3 text-4xl font-black text-white">
          Reliability Layer · {project?.name || "Project"}
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
          Monitor job retries, backoff, dead-letter queues, typed errors, and execution logs.
        </p>
      </section>

      {company && data ? (
        <>
          <section className="grid gap-4 md:grid-cols-4 xl:grid-cols-7">
            <Metric label="Jobs" value={String(data.summary.jobs)} />
            <Metric label="Pending" value={String(data.summary.pending)} />
            <Metric label="Running" value={String(data.summary.running)} />
            <Metric label="Succeeded" value={String(data.summary.succeeded)} />
            <Metric label="Failed" value={String(data.summary.failed)} />
            <Metric label="Dead" value={String(data.summary.dead)} />
            <Metric label="DLQ" value={String(data.summary.deadLetters)} />
          </section>

          <section className="rounded-3xl border border-border bg-panel/70 p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-black text-white">Job Runner</h2>
                <p className="mt-1 text-sm text-muted">Run one reliability tick to process pending/failed jobs.</p>
              </div>

              <form action="/api/reliability/tick" method="POST">
                <button className="rounded-xl bg-red-600 px-5 py-3 text-sm font-black text-white hover:bg-red-500">
                  Run Job Tick
                </button>
              </form>
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-panel/70 p-5">
            <h2 className="text-xl font-black text-white">Recent Jobs</h2>

            <div className="mt-4 space-y-3">
              {data.jobs.length ? (
                data.jobs.map((job: any) => (
                  <div key={job.id} className="rounded-2xl border border-border bg-black/20 p-4">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                      <div>
                        <div className="text-sm font-black text-white">{job.type}</div>
                        <div className="mt-1 text-xs text-red-300">{job.status} · attempt {job.attempt}/{job.maxAttempts}</div>
                        <div className="mt-1 font-mono text-[11px] text-muted">{job.id}</div>
                        {job.errorKind && (
                          <div className="mt-2 rounded-lg border border-red-400/20 bg-red-500/10 px-2 py-1 text-xs text-red-100">
                            {job.errorKind}: {job.lastError}
                          </div>
                        )}
                      </div>

                      <a
                        href={`/api/reliability/jobs/${job.id}`}
                        className="rounded-xl border border-border bg-black/20 px-3 py-2 text-xs font-black text-white hover:bg-black/40"
                      >
                        Open JSON
                      </a>
                    </div>

                    <pre className="mt-3 max-h-44 overflow-auto rounded-xl border border-border bg-slate-950 p-3 text-xs text-slate-200">
                      {JSON.stringify(job.payload, null, 2)}
                    </pre>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-border bg-black/20 p-4 text-sm text-muted">
                  No jobs yet.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-panel/70 p-5">
            <h2 className="text-xl font-black text-white">Dead Letter Queue</h2>

            <div className="mt-4 space-y-3">
              {data.deadLetters.length ? (
                data.deadLetters.map((job: any) => (
                  <div key={job.id} className="rounded-2xl border border-red-400/20 bg-red-500/10 p-4">
                    <div className="text-sm font-black text-white">{job.type}</div>
                    <div className="mt-1 text-xs text-red-200">{job.errorKind}: {job.lastError}</div>
                    <div className="mt-1 font-mono text-[11px] text-muted">{job.id}</div>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-border bg-black/20 p-4 text-sm text-muted">
                  No dead-lettered jobs.
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
