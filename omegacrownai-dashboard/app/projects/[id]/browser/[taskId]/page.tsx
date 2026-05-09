import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function BrowserTaskDetailPage({
  params,
}: {
  params: Promise<{ id: string; taskId: string }>;
}) {
  const { id, taskId } = await params;

  const [task, artifacts] = await Promise.all([
    prisma.browserTask.findFirst({
      where: {
        id: taskId,
        projectId: id,
      },
    }),
    prisma.browserArtifact.findMany({
      where: {
        taskId,
        projectId: id,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

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

      {artifacts.length > 0 && (
        <section className="rounded-3xl border border-border bg-panel/70 p-5">
          <h2 className="text-xl font-black text-white">Artifacts</h2>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {artifacts.map((artifact) => (
              <div key={artifact.id} className="rounded-2xl border border-border bg-black/20 p-4">
                <div className="text-sm font-bold text-white">
                  {artifact.kind} · {artifact.name || artifact.id}
                </div>

                <div className="mt-1 text-xs text-muted">
                  {artifact.mimeType || "artifact"} · {artifact.sizeBytes || 0} bytes
                </div>

                {artifact.url && artifact.mimeType?.startsWith("image/") && (
                  <a href={artifact.url} target="_blank" rel="noreferrer">
                    <img
                      src={artifact.url}
                      alt={artifact.name || "Browser artifact"}
                      className="mt-3 max-h-96 w-full rounded-xl border border-border object-contain"
                    />
                  </a>
                )}

                {artifact.url && (
                  <a
                    href={artifact.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-block text-xs font-bold text-sky-300 hover:underline"
                  >
                    Open artifact
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="grid gap-4 xl:grid-cols-2">
        <Panel title="Result" value={task.result || {}} />
        <Panel title="Action Results" value={(task.result as any)?.actionResults || []} />
        <Panel title="Extracted" value={(task.result as any)?.extracted || {}} />
        <Panel title="Detected Forms" value={(task.result as any)?.extracted?.forms || []} />
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
