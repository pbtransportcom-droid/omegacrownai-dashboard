import {
  createProject,
  createQueues
} from "@/lib/project-os/unified-project-os";

const project = createProject();
const queues = createQueues(project);

export default function ProjectOSQueuesPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-16 text-slate-900">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          OmegaCrownAI Phase 92
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Render and Publish Queues
        </h1>
        <p className="mt-5 max-w-4xl text-base leading-7 text-slate-700">
          Queues show render, publish, review, distribution, and executive work
          across the unified project operating system.
        </p>
      </section>

      <section className="mt-8 grid gap-5">
        {queues.map((item) => (
          <article
            key={item.id}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">{item.queue}</h2>
              <span className="rounded-full border border-slate-300 px-3 py-1 text-xs font-bold uppercase tracking-wide">
                {item.status}
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-700">
              Priority: {item.priority}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              {item.reason}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}
