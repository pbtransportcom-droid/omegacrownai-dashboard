import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function CloudJobDetailPage({
  params,
}: {
  params: Promise<{ id: string; jobId: string }>;
}) {
  const { id, jobId } = await params;

  const job = await prisma.cloudJob.findFirst({
    where: {
      id: jobId,
      projectId: id,
    },
  });

  if (!job) {
    return <main className="text-white">Cloud job not found.</main>;
  }

  const payload: any = job.payload || {};
  const provider = payload.provider || "local";

  return (
    <main className="space-y-6">
      <section className="rounded-3xl border border-border bg-panel/70 p-6">
        <Link href={`/projects/${id}/cloud`} className="text-sm text-cyan-300 hover:underline">
          ← Back to cloud jobs
        </Link>

        <p className="mt-5 text-xs uppercase tracking-[0.25em] text-violet-300">
          Cloud Job Detail
        </p>

        <h1 className="mt-3 text-4xl font-black text-white">
          {provider} · {job.type} · {job.status}
        </h1>

        <p className="mt-3 font-mono text-xs text-muted">
          {job.id}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <form action={`/api/cloud/jobs/${job.id}/retry`} method="POST">
            <button className="rounded-xl border border-violet-400/30 bg-violet-500/10 px-5 py-3 text-sm font-black text-violet-100 hover:bg-violet-500/20">
              Retry Job
            </button>
          </form>

          <form action="/api/cloud/jobs" method="POST">
            <input type="hidden" name="action" value="run_one" />
            <button className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-black text-white hover:bg-violet-500">
              Process Next Job
            </button>
          </form>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <Metric label="Provider" value={provider} />
        <Metric label="Status" value={job.status} />
        <Metric label="Type" value={job.type} />
        <Metric label="Build" value={job.buildId || "none"} />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Panel title="Payload" value={job.payload || {}} />
        <Panel title="Result" value={job.result || {}} />
        <Panel title="Timestamps" value={{
          createdAt: job.createdAt,
          updatedAt: job.updatedAt,
        }} />
        <Panel title="Runtime" value={{
          runtimeSessionId: payload.runtimeSessionId || null,
          sessionId: payload.sessionId || null,
          jobType: payload.jobType || job.type,
          source: payload.source || null,
        }} />
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
    <div className="rounded-2xl border border-border bg-slate-950 p-4">
      <div className="text-xs font-bold uppercase tracking-[0.16em] text-violet-300">
        {title}
      </div>
      <pre className="mt-3 max-h-96 overflow-auto text-xs text-slate-200">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}
