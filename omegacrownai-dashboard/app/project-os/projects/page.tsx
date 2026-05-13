import { createProject } from "@/lib/project-os/unified-project-os";

const project = createProject();

export default function ProjectOSProjectsPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16 text-slate-900">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          OmegaCrownAI Phase 92
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Project Manager
        </h1>
        <p className="mt-5 max-w-4xl text-base leading-7 text-slate-700">
          Project Manager provides the unified project identity, owner, agents,
          assets, builds, pipelines, and status for the OmegaCrownAI operating
          system.
        </p>
      </section>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-semibold">{project.name}</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <p className="rounded-2xl border border-slate-200 p-4 text-sm">
            Status: {project.status}
          </p>
          <p className="rounded-2xl border border-slate-200 p-4 text-sm">
            Owner: {project.owner}
          </p>
          <p className="rounded-2xl border border-slate-200 p-4 text-sm">
            Pipelines: {project.pipelines.length}
          </p>
        </div>
      </section>
    </main>
  );
}
