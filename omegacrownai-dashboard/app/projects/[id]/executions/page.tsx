import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function ProjectExecutionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [project, executions] = await Promise.all([
    prisma.project.findUnique({
      where: { id },
    }),
    prisma.executionRecord.findMany({
      where: {
        projectId: id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
    }),
  ]);

  return (
    <main className="space-y-6">
      <div className="rounded-3xl border border-border bg-panel/70 p-6">
        <Link href={`/projects/${id}`} className="text-sm text-cyan-300 hover:underline">
          ← Back to project
        </Link>

        <p className="mt-5 text-xs uppercase tracking-[0.25em] text-orange-300">
          Sugent OS v1.1
        </p>

        <h1 className="mt-3 text-4xl font-black text-white">
          Secure Executions · {project?.name || "Project"}
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
          Inspect sandboxed execution records, hashes, logs, outputs, errors, and policy results.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <Metric label="Executions" value={String(executions.length)} />
        <Metric label="Success" value={String(executions.filter((x) => x.status === "success").length)} />
        <Metric label="Blocked" value={String(executions.filter((x) => x.status === "blocked").length)} />
        <Metric label="Errors" value={String(executions.filter((x) => x.status === "error").length)} />
      </section>

      <section className="rounded-3xl border border-border bg-panel/70 p-5">
        <h2 className="text-xl font-black text-white">Execution Records</h2>

        <div className="mt-4 space-y-3">
          {executions.length ? (
            executions.map((execution) => (
              <div key={execution.id} className="rounded-2xl border border-border bg-black/20 p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="text-sm font-bold text-white">
                      {execution.language} · {execution.status}
                    </div>
                    <div className="mt-1 text-xs text-muted">
                      Execution ID: {execution.id}
                    </div>
                    <div className="mt-1 font-mono text-xs text-muted">
                      Code hash: {execution.codeHash}
                    </div>
                    <div className="mt-1 font-mono text-xs text-muted">
                      Input hash: {execution.inputHash}
                    </div>
                    {execution.outputHash && (
                      <div className="mt-1 font-mono text-xs text-muted">
                        Output hash: {execution.outputHash}
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-muted">
                    {new Date(execution.createdAt).toLocaleString()}
                  </div>
                </div>

                {execution.error && (
                  <div className="mt-3 rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100">
                    {execution.error}
                  </div>
                )}

                <div className="mt-3 grid gap-3 xl:grid-cols-2">
                  <CodePanel title="Input" value={execution.input} />
                  <CodePanel title="Output" value={execution.output || {}} />
                  <CodePanel title="Logs" value={execution.logs || []} />
                  <CodePanel title="Metrics" value={execution.metrics || {}} />
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-border bg-black/20 p-4 text-sm text-muted">
              No secure execution records yet.
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

function CodePanel({ title, value }: { title: string; value: any }) {
  return (
    <div className="rounded-xl border border-border bg-slate-950 p-3">
      <div className="text-xs font-bold uppercase tracking-[0.16em] text-orange-300">
        {title}
      </div>
      <pre className="mt-2 max-h-72 overflow-auto text-xs text-slate-200">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}
