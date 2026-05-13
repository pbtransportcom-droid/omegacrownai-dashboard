import {
  createBuildHistory,
  createProject
} from "@/lib/project-os/unified-project-os";

const project = createProject();
const builds = createBuildHistory(project);

export default function ProjectOSBuildsPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-16 text-slate-900">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          OmegaCrownAI Phase 92
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Build History
        </h1>
        <p className="mt-5 max-w-4xl text-base leading-7 text-slate-700">
          Build history turns each subsystem output into a traceable record with
          status, summary, timestamps, and hash.
        </p>
      </section>

      <section className="mt-8 grid gap-5">
        {builds.map((build) => (
          <article
            key={build.id}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">{build.id}</h2>
              <span className="rounded-full border border-slate-300 px-3 py-1 text-xs font-bold uppercase tracking-wide">
                {build.status}
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-700">
              {build.summary}
            </p>
            <p className="mt-4 break-all text-xs leading-6 text-slate-500">
              Trace hash: {build.traceHash}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}
