import {
  buildCreativeProductionPackage,
  creativePackageHash,
  creativeSuperDepartmentControls
} from "@/lib/creative-super-department/creative-super-department";

const production = buildCreativeProductionPackage();

export default function CreativeDirectorsRoomPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-16 text-slate-900">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          OmegaCrownAI Phase 89
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Creative Super-Department
        </h1>
        <p className="mt-5 max-w-4xl text-base leading-7 text-slate-700">
          The Creative Super-Department coordinates the director room, scene
          planning, critique, asset generation, licensing review, and production
          readiness for premium OmegaCrownAI campaigns.
        </p>
        <p className="mt-5 break-all text-xs leading-6 text-slate-500">
          Creative package hash: {creativePackageHash}
        </p>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Agents
          </p>
          <p className="mt-2 text-3xl font-semibold">
            {production.creativeAgents.length}
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Scenes
          </p>
          <p className="mt-2 text-3xl font-semibold">{production.scenes.length}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Asset jobs
          </p>
          <p className="mt-2 text-3xl font-semibold">
            {production.assetJobs.length}
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Readiness
          </p>
          <p className="mt-2 text-3xl font-semibold">
            {production.productionReadiness}
          </p>
        </div>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2">
        {creativeSuperDepartmentControls.map((item) => (
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
