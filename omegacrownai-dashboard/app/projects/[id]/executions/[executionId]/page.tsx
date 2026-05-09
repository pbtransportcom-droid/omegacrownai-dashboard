import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function ExecutionDetailPage({
  params,
}: {
  params: Promise<{ id: string; executionId: string }>;
}) {
  const { id, executionId } = await params;

  const execution = await prisma.executionRecord.findFirst({
    where: {
      id: executionId,
      projectId: id,
    },
  });

  if (!execution) {
    return (
      <main className="text-white">
        Execution not found.
      </main>
    );
  }

  return (
    <main className="space-y-6">
      <div className="rounded-3xl border border-border bg-panel/70 p-6">
        <Link href={`/projects/${id}/executions`} className="text-sm text-cyan-300 hover:underline">
          ← Back to executions
        </Link>

        <p className="mt-5 text-xs uppercase tracking-[0.25em] text-orange-300">
          Secure Execution Replay
        </p>

        <h1 className="mt-3 text-4xl font-black text-white">
          Execution Detail
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
          Inspect code, hashes, policy, logs, outputs, and replay endpoint for this sandboxed run.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <a
            href={`/api/execution/${execution.id}/replay`}
            className="rounded-xl bg-orange-600 px-5 py-3 text-sm font-black text-white hover:bg-orange-500"
          >
            Replay Execution API
          </a>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <Metric label="Status" value={execution.status} />
        <Metric label="Language" value={execution.language} />
        <Metric label="Logs" value={String(Array.isArray(execution.logs) ? execution.logs.length : 0)} />
        <Metric label="Output Hash" value={execution.outputHash ? "yes" : "none"} />
      </section>

      {execution.error && (
        <section className="rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-red-100">
          {execution.error}
        </section>
      )}

      <section className="grid gap-4 xl:grid-cols-2">
        <Panel title="Code" value={execution.code} raw />
        <Panel title="Input" value={execution.input} />
        <Panel title="Output" value={execution.output || {}} />
        <Panel title="Logs" value={execution.logs || []} />
        <Panel title="Metrics" value={execution.metrics || {}} />
        <Panel title="Policy" value={execution.policy || {}} />
      </section>

      <section className="rounded-3xl border border-border bg-panel/70 p-5">
        <h2 className="text-xl font-black text-white">Hashes</h2>
        <div className="mt-4 space-y-2 font-mono text-xs text-muted">
          <div>Code: {execution.codeHash}</div>
          <div>Input: {execution.inputHash}</div>
          <div>Output: {execution.outputHash || "none"}</div>
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

function Panel({ title, value, raw }: { title: string; value: any; raw?: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-slate-950 p-4">
      <div className="text-xs font-bold uppercase tracking-[0.16em] text-orange-300">
        {title}
      </div>
      <pre className="mt-3 max-h-96 overflow-auto text-xs text-slate-200">
        {raw ? String(value || "") : JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}
