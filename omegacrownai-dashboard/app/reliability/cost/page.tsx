import {
  reliabilityControls,
  sampleTrace,
  summarizeCost
} from "@/lib/reliability/reliability-engine";

const cost = summarizeCost(sampleTrace);

export default function ReliabilityCostPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16 text-slate-900">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">OmegaCrownAI Phase 87</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">Cost Observability</h1>
        <p className="mt-5 max-w-4xl text-base leading-7 text-slate-700">
          Cost observability tracks model, tool, infrastructure, and latency costs per execution.
        </p>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Total USD</p>
          <p className="mt-2 text-3xl font-semibold">{cost.totalUsd}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Model</p>
          <p className="mt-2 text-3xl font-semibold">{cost.modelUsd}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Tools</p>
          <p className="mt-2 text-3xl font-semibold">{cost.toolUsd}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Risk</p>
          <p className="mt-2 text-3xl font-semibold">{cost.costRisk}</p>
        </div>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2">
        {reliabilityControls.map((item) => (
          <article key={item.area} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">{item.area}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">{item.control}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
