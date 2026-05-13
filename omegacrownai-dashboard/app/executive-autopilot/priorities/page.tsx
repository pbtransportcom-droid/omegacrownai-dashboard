import {
  allocateBudget,
  prioritizeInitiatives
} from "@/lib/executive-autopilot/executive-autopilot";

const initiatives = prioritizeInitiatives();
const budget = allocateBudget(initiatives);

export default function ExecutivePrioritiesPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-16 text-slate-900">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          OmegaCrownAI Phase 90
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Executive Priorities and Budget
        </h1>
        <p className="mt-5 max-w-4xl text-base leading-7 text-slate-700">
          Priority ranking scores initiatives by expected impact, cost, risk,
          and strategic dependency, then allocates budget to the highest-leverage
          actions.
        </p>
      </section>

      <section className="mt-8 grid gap-5">
        {initiatives.map((initiative) => (
          <article
            key={initiative.id}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">
                #{initiative.rank} {initiative.title}
              </h2>
              <span className="rounded-full border border-slate-300 px-3 py-1 text-xs font-bold uppercase tracking-wide">
                {initiative.priorityScore}
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-700">
              Dependency: {initiative.dependency}
            </p>
          </article>
        ))}
      </section>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-semibold">Budget allocation</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          {budget.map((allocation) => (
            <article
              key={allocation.category}
              className="rounded-2xl border border-slate-200 p-5"
            >
              <h3 className="font-semibold">{allocation.category}</h3>
              <p className="mt-2 text-2xl font-semibold">
                ${allocation.amountUsd}
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-700">
                {allocation.reason}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
