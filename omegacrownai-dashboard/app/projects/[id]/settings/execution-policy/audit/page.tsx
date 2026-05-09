import Link from "next/link";
import { prisma } from "@/lib/db";
import { getProjectExecutionPolicy } from "@/lib/sugent/secureExecution/projectPolicy";

export default async function ExecutionPolicyAuditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [project, policy, recentExecutions] = await Promise.all([
    prisma.project.findUnique({
      where: { id },
    }),
    getProjectExecutionPolicy(id),
    prisma.executionRecord.findMany({
      where: {
        projectId: id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 30,
    }),
  ]);

  const successCount = recentExecutions.filter((item) => item.status === "success").length;
  const blockedCount = recentExecutions.filter((item) => item.status === "blocked").length;
  const errorCount = recentExecutions.filter((item) => item.status === "error").length;

  return (
    <main className="space-y-6">
      <section className="rounded-3xl border border-border bg-panel/70 p-6">
        <Link href={`/projects/${id}/settings/execution-policy`} className="text-sm text-cyan-300 hover:underline">
          ← Back to execution policy
        </Link>

        <p className="mt-5 text-xs uppercase tracking-[0.25em] text-orange-300">
          Sugent OS v1.1 Phase 4
        </p>

        <h1 className="mt-3 text-4xl font-black text-white">
          Policy Hardening Audit · {project?.name || "Project"}
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
          Run enforcement checks for safe execution, forbidden patterns, blocked languages,
          input/code limits, and timeout behavior.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={`/api/projects/${id}/execution-policy/audit`}
            className="rounded-xl bg-orange-600 px-5 py-3 text-sm font-black text-white hover:bg-orange-500"
          >
            Run Audit API
          </a>

          <a
            href={`/projects/${id}/executions`}
            className="rounded-xl border border-orange-400/30 bg-orange-500/10 px-5 py-3 text-sm font-black text-orange-100 hover:bg-orange-500/20"
          >
            View Execution Records
          </a>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <Metric label="Recent Runs" value={String(recentExecutions.length)} />
        <Metric label="Success" value={String(successCount)} />
        <Metric label="Blocked" value={String(blockedCount)} />
        <Metric label="Errors" value={String(errorCount)} />
      </section>

      <section className="rounded-3xl border border-border bg-panel/70 p-5">
        <h2 className="text-xl font-black text-white">Effective Policy</h2>
        <pre className="mt-4 max-h-[520px] overflow-auto rounded-xl border border-border bg-slate-950 p-4 text-xs text-slate-200">
          {JSON.stringify(policy, null, 2)}
        </pre>
      </section>

      <section className="rounded-3xl border border-border bg-panel/70 p-5">
        <h2 className="text-xl font-black text-white">Recent Execution Outcomes</h2>

        <div className="mt-4 space-y-3">
          {recentExecutions.length ? (
            recentExecutions.map((execution) => (
              <Link
                key={execution.id}
                href={`/projects/${id}/executions/${execution.id}`}
                className="block rounded-2xl border border-border bg-black/20 p-4 hover:bg-white/5"
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="text-sm font-bold text-white">
                      {execution.language} · {execution.status}
                    </div>
                    <div className="mt-1 font-mono text-xs text-muted">
                      {execution.codeHash}
                    </div>
                    {execution.error && (
                      <div className="mt-2 text-xs text-red-200">
                        {execution.error}
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-muted">
                    {new Date(execution.createdAt).toLocaleString()}
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="rounded-xl border border-border bg-black/20 p-4 text-sm text-muted">
              No execution records yet.
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
