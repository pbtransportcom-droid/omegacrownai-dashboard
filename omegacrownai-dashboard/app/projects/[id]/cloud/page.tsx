import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function ProjectCloudPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [project, jobs, schedules] = await Promise.all([
    prisma.project.findUnique({ where: { id } }),
    prisma.cloudJob.findMany({
      where: { projectId: id },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.cloudSchedule.findMany({
      where: { projectId: id },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  const providers = ["local", "aws", "gcp", "azure", "vercel", "fly"];

  const providerStats = providers.map((provider) => {
    const list = jobs.filter((job) => (job.payload as any)?.provider === provider);
    return {
      provider,
      total: list.length,
      queued: list.filter((job) => job.status === "queued").length,
      success: list.filter((job) => job.status === "success").length,
      error: list.filter((job) => job.status === "error").length,
    };
  });

  return (
    <main className="space-y-6">
      <section className="rounded-3xl border border-border bg-panel/70 p-6">
        <Link href={`/projects/${id}`} className="text-sm text-cyan-300 hover:underline">
          ← Back to project
        </Link>

        <p className="mt-5 text-xs uppercase tracking-[0.25em] text-violet-300">
          Sugent OS v1.3
        </p>

        <h1 className="mt-3 text-4xl font-black text-white">
          Multi-Cloud Execution · {project?.name || "Project"}
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
          Inspect provider usage, queued jobs, processed jobs, payloads, outputs, and runtime cloud execution status.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <form action="/api/cloud/jobs" method="POST">
            <input type="hidden" name="action" value="run_one" />
            <button className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-black text-white hover:bg-violet-500">
              Process Next Cloud Job
            </button>
          </form>

          <a
            href="/api/cloud/jobs"
            className="rounded-xl border border-violet-400/30 bg-violet-500/10 px-5 py-3 text-sm font-black text-violet-100 hover:bg-violet-500/20"
          >
            Open Cloud API
          </a>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <Metric label="Jobs" value={String(jobs.length)} />
        <Metric label="Queued" value={String(jobs.filter((job) => job.status === "queued").length)} />
        <Metric label="Success" value={String(jobs.filter((job) => job.status === "success").length)} />
        <Metric label="Errors" value={String(jobs.filter((job) => job.status === "error").length)} />
      </section>

      <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        {providerStats.map((item) => (
          <div key={item.provider} className="rounded-2xl border border-border bg-black/20 p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-violet-300">
              {item.provider}
            </div>
            <div className="mt-2 text-2xl font-black text-white">{item.total}</div>
            <div className="mt-2 text-xs text-muted">
              queued {item.queued} · success {item.success} · error {item.error}
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-border bg-panel/70 p-5">
        <h2 className="text-xl font-black text-white">Recurring Cloud Schedules</h2>

        <form action="/api/cloud/schedules" method="POST" className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          <input type="hidden" name="projectId" value={id} />

          <input
            name="name"
            placeholder="Schedule name"
            className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none"
          />

          <input
            name="provider"
            defaultValue="local"
            placeholder="Provider"
            className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none"
          />

          <input
            name="type"
            defaultValue="generic"
            placeholder="Job type"
            className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none"
          />

          <input
            name="intervalMinutes"
            defaultValue="60"
            placeholder="Interval minutes"
            className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none"
          />

          <input
            name="payload"
            defaultValue='{"message":"scheduled cloud job"}'
            placeholder="Payload JSON"
            className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none"
          />

          <button className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-black text-white hover:bg-violet-500">
            Create Schedule
          </button>
        </form>

        <div className="mt-4 flex flex-wrap gap-3">
          <form action="/api/cloud/schedules/run-due" method="POST">
            <button className="rounded-xl border border-violet-400/30 bg-violet-500/10 px-5 py-3 text-sm font-black text-violet-100 hover:bg-violet-500/20">
              Run Due Schedules
            </button>
          </form>

          <a
            href={`/api/cloud/schedules?projectId=${id}`}
            className="rounded-xl border border-violet-400/30 bg-violet-500/10 px-5 py-3 text-sm font-black text-violet-100 hover:bg-violet-500/20"
          >
            Open Schedules API
          </a>
        </div>

        <div className="mt-4 space-y-3">
          {schedules.length ? (
            schedules.map((schedule) => (
              <div key={schedule.id} className="rounded-2xl border border-border bg-black/20 p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="text-sm font-bold text-white">
                      {schedule.provider} · {schedule.type} · {schedule.enabled ? "enabled" : "disabled"}
                    </div>
                    <div className="mt-1 text-sm text-violet-100">{schedule.name}</div>
                    <div className="mt-1 font-mono text-xs text-muted">{schedule.id}</div>
                    <div className="mt-1 text-xs text-muted">
                      Every {schedule.intervalMinutes} min · runs {schedule.runCount}
                    </div>
                  </div>

                  <div className="text-xs text-muted">
                    Next: {new Date(schedule.nextRunAt).toLocaleString()}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-3">
                  <form action={`/api/cloud/schedules/${schedule.id}/toggle`} method="POST">
                    <input
                      type="hidden"
                      name="enabled"
                      value={schedule.enabled ? "false" : "true"}
                    />
                    <button className="rounded-lg border border-violet-400/30 bg-violet-500/10 px-3 py-2 text-xs font-bold text-violet-100 hover:bg-violet-500/20">
                      {schedule.enabled ? "Disable" : "Enable"}
                    </button>
                  </form>

                  {schedule.lastJobId && (
                    <Link
                      href={`/projects/${id}/cloud/${schedule.lastJobId}`}
                      className="rounded-lg border border-violet-400/30 bg-violet-500/10 px-3 py-2 text-xs font-bold text-violet-100 hover:bg-violet-500/20"
                    >
                      Last Job
                    </Link>
                  )}
                </div>

                <div className="mt-3">
                  <Panel title="Payload" value={schedule.payload || {}} />
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-border bg-black/20 p-4 text-sm text-muted">
              No cloud schedules yet.
            </div>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-panel/70 p-5">
        <h2 className="text-xl font-black text-white">Recent Cloud Jobs</h2>

        <div className="mt-4 space-y-3">
          {jobs.length ? (
            jobs.map((job) => (
              <Link key={job.id} href={`/projects/${id}/cloud/${job.id}`} className="block rounded-2xl border border-border bg-black/20 p-4 hover:bg-white/5">
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="text-sm font-bold text-white">
                      {(job.payload as any)?.provider || "local"} · {job.type} · {job.status}
                    </div>
                    <div className="mt-1 font-mono text-xs text-muted">
                      {job.id}
                    </div>
                    <div className="mt-1 text-xs text-violet-200">
                      Build: {job.buildId || "none"}
                    </div>
                  </div>

                  <div className="text-xs text-muted">
                    {new Date(job.createdAt).toLocaleString()}
                  </div>
                </div>

                <div className="mt-3 grid gap-3 xl:grid-cols-2">
                  <Panel title="Payload" value={job.payload || {}} />
                  <Panel title="Result" value={job.result || {}} />
                </div>
              </Link>
            ))
          ) : (
            <div className="rounded-xl border border-border bg-black/20 p-4 text-sm text-muted">
              No cloud jobs yet.
            </div>
          )}
        </div>
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
      <div className="text-xs font-bold uppercase tracking-[0.16em] text-violet-300">
        {title}
      </div>
      <pre className="mt-2 max-h-72 overflow-auto text-xs text-slate-200">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}
