import {
  distributionControls,
  runDistributionPipeline
} from "@/lib/distribution/distribution-super-pipeline";

const pipeline = runDistributionPipeline();

export default function DistributionPipelinePage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-16 text-slate-900">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          OmegaCrownAI Phase 88
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Distribution Super-Pipeline
        </h1>
        <p className="mt-5 max-w-4xl text-base leading-7 text-slate-700">
          The Distribution Super-Pipeline turns governed content into scheduled,
          channel-aware campaigns with variants, policy checks, KPI feedback, and
          optimization signals.
        </p>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Channels
          </p>
          <p className="mt-2 text-3xl font-semibold">
            {pipeline.campaign.channels.length}
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Variants
          </p>
          <p className="mt-2 text-3xl font-semibold">
            {pipeline.variants.length}
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Publish jobs
          </p>
          <p className="mt-2 text-3xl font-semibold">
            {pipeline.publishJobs.length}
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Budget
          </p>
          <p className="mt-2 text-3xl font-semibold">
            ${pipeline.campaign.budgetUsd}
          </p>
        </div>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2">
        {distributionControls.map((item) => (
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
