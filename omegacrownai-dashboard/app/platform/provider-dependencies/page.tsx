import { providerDependencies } from "@/lib/platform-limitations/platform-limitation-controls";

export default function ProviderDependenciesPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-16 text-slate-900">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          OmegaCrownAI Phase 96
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Provider Dependency Notice
        </h1>
        <p className="mt-5 max-w-4xl text-base leading-7 text-slate-700">
          OmegaCrownAI relies on configured providers, APIs, models, publishing
          platforms, payment processors, storage systems, and customer-connected
          data sources. These dependencies must be disclosed, monitored, and
          controlled.
        </p>
      </section>

      <section className="mt-8 grid gap-5">
        {providerDependencies.map((item) => (
          <article
            key={item.id}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold">{item.dependency}</h2>
            <p className="mt-4 text-sm font-semibold text-slate-700">Risk</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">{item.risk}</p>
            <p className="mt-4 text-sm font-semibold text-slate-700">
              Mitigation
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              {item.mitigation}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}
