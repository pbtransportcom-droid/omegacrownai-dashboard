import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function BrowserTaskDetailPage({
  params,
}: {
  params: Promise<{ id: string; taskId: string }>;
}) {
  const { id, taskId } = await params;

  const task = await prisma.browserTask.findFirst({
    where: {
      id: taskId,
      projectId: id,
    },
  });

  if (!task) {
    return <main className="text-white">Browser task not found.</main>;
  }

  return (
    <main className="space-y-6">
      <section className="rounded-3xl border border-border bg-panel/70 p-6">
        <Link href={`/projects/${id}/browser`} className="text-sm text-cyan-300 hover:underline">
          ← Back to browser tasks
        </Link>

        <p className="mt-5 text-xs uppercase tracking-[0.25em] text-sky-300">
          Browser Automation Detail
        </p>

        <h1 className="mt-3 text-4xl font-black text-white">
          {task.title || "Browser Task"}
        </h1>

        <p className="mt-3 break-all text-sm leading-7 text-sky-200">
          {task.url}
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <Metric label="Status" value={task.status} />
        <Metric label="HTML" value={String(task.html?.length || 0)} />
        <Metric label="Text" value={String(task.text?.length || 0)} />
        <Metric label="Error" value={task.error ? "yes" : "none"} />
      </section>

      {task.error && (
        <section className="rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100">
          {task.error}
        </section>
      )}

      <section className="grid gap-4 xl:grid-cols-2">
        <Panel title="Result" value={task.result || {}} />
        <Panel title="Action Results" value={(task.result as any)?.actionResults || []} />
        <Panel title="Extracted" value={(task.result as any)?.extracted || {}} />
        <Panel title="Metrics" value={task.metrics || {}} />
        <Panel title="Policy" value={task.policy || {}} />
        <Panel title="Logs" value={task.logs || []} />
        <Panel title="Extracted Text" value={task.text || ""} raw />
        <Panel title="HTML" value={task.html || ""} raw />
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
      <div className="text-xs font-bold uppercase tracking-[0.16em] text-sky-300">
        {title}
      </div>
      <pre className="mt-3 max-h-96 overflow-auto text-xs text-slate-200">
        {raw ? String(value || "") : JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}
