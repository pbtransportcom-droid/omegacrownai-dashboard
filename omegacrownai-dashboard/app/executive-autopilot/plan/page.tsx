import {
  buildExecutivePlan,
  executiveAutopilotControls
} from "@/lib/executive-autopilot/executive-autopilot";

const plan = buildExecutivePlan();

export default function ExecutiveAutopilotPlanPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-16 text-slate-900">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          OmegaCrownAI Phase 90
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Executive Autopilot Intelligence Layer
        </h1>
        <p className="mt-5 max-w-4xl text-base leading-7 text-slate-700">
          Executive Autopilot is the CEO brain of OmegaCrownAI. It sets goals,
          forecasts KPIs, monitors competitor signals, prioritizes initiatives,
          allocates budget, triggers creative and distribution cycles, and runs
          recurring executive reviews.
        </p>
        <p className="mt-5 break-all text-xs leading-6 text-slate-500">
          Plan hash: {plan.planHash}
        </p>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Goals
          </p>
          <p className="mt-2 text-3xl font-semibold">{plan.goals.length}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Forecasts
          </p>
          <p className="mt-2 text-3xl font-semibold">{plan.forecasts.length}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Initiatives
          </p>
          <p className="mt-2 text-3xl font-semibold">
            {plan.initiatives.length}
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Budget lines
          </p>
          <p className="mt-2 text-3xl font-semibold">{plan.budget.length}</p>
        </div>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2">
        {executiveAutopilotControls.map((item) => (
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
