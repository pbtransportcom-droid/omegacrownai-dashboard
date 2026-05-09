import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function ProjectCloudPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [project, jobs] = await Promise.all([
    prisma.project.findUnique({ where: { id } }),
    prisma.cloudJob.findMany({
      where: { projectId: id },
      orderBy: { createdAt: "desc" },
      take: 100,
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
        <h2 className="text-xl font-black text-white">Recent Cloud Jobs</h2>

        <div className="mt-4 space-y-3">
          {jobs.length ? (
            jobs.map((job) => (
              <div key={job.id} className="rounded-2xl border border-border bg-black/20 p-4">
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
              </div>
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
