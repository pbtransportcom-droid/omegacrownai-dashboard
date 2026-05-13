import { sampleCampaign } from "@/lib/distribution/distribution-super-pipeline";

export default function DistributionCampaignsPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16 text-slate-900">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          OmegaCrownAI Phase 88
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Campaign Pipeline
        </h1>
        <p className="mt-5 max-w-4xl text-base leading-7 text-slate-700">
          Campaigns define the goal, channels, schedule, KPI targets, ownership,
          and budget for distribution execution.
        </p>
      </section>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-semibold">{sampleCampaign.name}</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <p className="rounded-2xl border border-slate-200 p-4 text-sm">
            Goal: {sampleCampaign.goal}
          </p>
          <p className="rounded-2xl border border-slate-200 p-4 text-sm">
            Status: {sampleCampaign.status}
          </p>
          <p className="rounded-2xl border border-slate-200 p-4 text-sm">
            Owner: {sampleCampaign.owner}
          </p>
        </div>
        <p className="mt-5 text-sm leading-6 text-slate-700">
          Channels: {sampleCampaign.channels.join(", ")}
        </p>
      </section>
    </main>
  );
}
