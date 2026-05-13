import {
  buildProjectOSDashboard,
  projectOSControls
} from "@/lib/project-os/unified-project-os";

const dashboard = buildProjectOSDashboard();

export default function ProjectOSDashboardPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-16 text-slate-900">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          OmegaCrownAI Phase 92
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Unified Project OS
        </h1>
        <p className="mt-5 max-w-4xl text-base leading-7 text-slate-700">
          Project OS finalizes OmegaCrownAI into one unified operating surface
          for projects, builds, assets, queues, publishing, observability,
          executive planning, creative production, distribution, and marketplace
          operations.
        </p>
        <p className="mt-5 break-all text-xs leading-6 text-slate-500">
          System hash: {dashboard.systemHash}
        </p>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-5">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Builds
          </p>
          <p className="mt-2 text-3xl font-semibold">{dashboard.builds.length}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Assets
          </p>
          <p className="mt-2 text-3xl font-semibold">{dashboard.assets.length}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Queues
          </p>
          <p className="mt-2 text-3xl font-semibold">{dashboard.queues.length}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Creative
          </p>
          <p className="mt-2 text-2xl font-semibold">
            {dashboard.observability.creativeReadiness}
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Marketplace
          </p>
          <p className="mt-2 text-2xl font-semibold">
            {dashboard.observability.marketplaceReadiness}
          </p>
        </div>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2">
        {projectOSControls.map((item) => (
          <article
            key={item.area}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold">{item.area}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">{item.control}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
