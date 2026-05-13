import {
  calculateKPIs,
  createVariants,
  generateFeedback,
  sampleCampaign
} from "@/lib/distribution/distribution-super-pipeline";

const variants = createVariants(sampleCampaign);
const kpis = calculateKPIs({
  campaign: sampleCampaign,
  variants
});
const feedback = generateFeedback(kpis);

export default function DistributionKPIsPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-16 text-slate-900">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          OmegaCrownAI Phase 88
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Distribution KPI Feedback
        </h1>
        <p className="mt-5 max-w-4xl text-base leading-7 text-slate-700">
          KPI feedback converts channel performance into optimization signals for
          creative production, executive planning, and future campaign budgets.
        </p>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2">
        {kpis.map((kpi) => (
          <article
            key={kpi.channel}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold">{kpi.channel}</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <p className="rounded-2xl border border-slate-200 p-4 text-sm">
                Impressions: {kpi.impressions}
              </p>
              <p className="rounded-2xl border border-slate-200 p-4 text-sm">
                Clicks: {kpi.clicks}
              </p>
              <p className="rounded-2xl border border-slate-200 p-4 text-sm">
                Conversions: {kpi.conversions}
              </p>
              <p className="rounded-2xl border border-slate-200 p-4 text-sm">
                Score: {kpi.score}
              </p>
            </div>
          </article>
        ))}
      </section>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-semibold">Feedback loop</h2>
        <ul className="mt-5 list-disc space-y-3 pl-5 text-sm leading-6 text-slate-700">
          {feedback.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
