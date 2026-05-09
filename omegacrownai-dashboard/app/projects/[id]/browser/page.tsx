import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function ProjectBrowserTasksPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [project, tasks] = await Promise.all([
    prisma.project.findUnique({
      where: { id },
    }),
    prisma.browserTask.findMany({
      where: { projectId: id },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  return (
    <main className="space-y-6">
      <section className="rounded-3xl border border-border bg-panel/70 p-6">
        <Link href={`/projects/${id}`} className="text-sm text-cyan-300 hover:underline">
          ← Back to project
        </Link>

        <p className="mt-5 text-xs uppercase tracking-[0.25em] text-sky-300">
          Sugent OS v1.2
        </p>

        <h1 className="mt-3 text-4xl font-black text-white">
          Browser Automation · {project?.name || "Project"}
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
          Inspect browser tasks, navigation results, extracted text, policy decisions, logs, and errors.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <Metric label="Tasks" value={String(tasks.length)} />
        <Metric label="Success" value={String(tasks.filter((x) => x.status === "success").length)} />
        <Metric label="Blocked" value={String(tasks.filter((x) => x.status === "blocked").length)} />
        <Metric label="Errors" value={String(tasks.filter((x) => x.status === "error").length)} />
      </section>

      <section className="rounded-3xl border border-border bg-panel/70 p-5">
        <h2 className="text-xl font-black text-white">Browser Tasks</h2>

        <div className="mt-4 space-y-3">
          {tasks.length ? (
            tasks.map((task) => (
              <div key={task.id} className="rounded-2xl border border-border bg-black/20 p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="text-sm font-bold text-white">
                      {task.status} · {task.title || "Untitled"}
                    </div>
                    <div className="mt-1 break-all text-xs text-sky-200">
                      {task.url}
                    </div>
                    <div className="mt-1 font-mono text-xs text-muted">
                      Task ID: {task.id}
                    </div>
                  </div>

                  <div className="text-xs text-muted">
                    {new Date(task.createdAt).toLocaleString()}
                  </div>
                </div>

                {task.error && (
                  <div className="mt-3 rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100">
                    {task.error}
                  </div>
                )}

                <div className="mt-3 grid gap-3 xl:grid-cols-2">
                  <Panel title="Result" value={task.result || {}} />
                  <Panel title="Metrics" value={task.metrics || {}} />
                  <Panel title="Logs" value={task.logs || []} />
                  <Panel title="Text Preview" value={String(task.text || "").slice(0, 4000)} raw />
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-border bg-black/20 p-4 text-sm text-muted">
              No browser tasks yet.
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

function Panel({ title, value, raw }: { title: string; value: any; raw?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-slate-950 p-3">
      <div className="text-xs font-bold uppercase tracking-[0.16em] text-sky-300">
        {title}
      </div>
      <pre className="mt-2 max-h-72 overflow-auto text-xs text-slate-200">
        {raw ? String(value || "") : JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}
