import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function ProjectMemoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { id } = await params;
  const { q } = await searchParams;

  const project = await prisma.project.findUnique({
    where: { id },
  });

  const memories = await prisma.memoryRecord.findMany({
    where: {
      projectId: id,
      ...(q
        ? {
            content: {
              contains: q,
              mode: "insensitive",
            },
          }
        : {}),
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 100,
  });

  return (
    <main className="space-y-6">
      <div className="rounded-3xl border border-border bg-panel/70 p-6">
        <Link href={`/projects/${id}`} className="text-sm text-cyan-300 hover:underline">
          ← Back to project
        </Link>

        <p className="mt-5 text-xs uppercase tracking-[0.25em] text-emerald-300">
          Sugent Memory Engine v2
        </p>

        <h1 className="mt-3 text-4xl font-black text-white">
          Memory · {project?.name || "Project"}
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
          Inspect long-term memories written by agents, builders, cloud jobs, users, and system events.
        </p>
      </div>

      <form className="rounded-3xl border border-border bg-panel/70 p-5">
        <label className="text-xs uppercase tracking-[0.18em] text-muted">
          Search memory
        </label>
        <div className="mt-3 flex flex-col gap-3 md:flex-row">
          <input
            name="q"
            defaultValue={q || ""}
            placeholder="Search project memory..."
            className="w-full rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
          />
          <button className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-black text-white hover:bg-emerald-500">
            Search
          </button>
        </div>
      </form>

      <section className="grid gap-4 md:grid-cols-4">
        <Metric label="Memories" value={String(memories.length)} />
        <Metric label="Project" value={id.slice(0, 10)} />
        <Metric label="Query" value={q || "none"} />
        <Metric label="Engine" value="v2" />
      </section>

      <section className="rounded-3xl border border-border bg-panel/70 p-5">
        <h2 className="text-xl font-black text-white">Memory Records</h2>

        <div className="mt-4 space-y-3">
          {memories.length ? (
            memories.map((memory) => (
              <div key={memory.id} className="rounded-2xl border border-border bg-black/20 p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="text-sm font-bold text-white">{memory.type}</div>
                    <div className="mt-1 text-xs text-muted">
                      Score: {Number(memory.score || 0).toFixed(3)}
                    </div>
                  </div>

                  <div className="text-xs text-muted">
                    {new Date(memory.createdAt).toLocaleString()}
                  </div>
                </div>

                <p className="mt-3 text-sm leading-7 text-slate-200">
                  {memory.content}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {memory.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-100"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-border bg-black/20 p-4 text-sm text-muted">
              No memories found for this project yet.
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
