import {
  buildMarketplaceReport,
  marketplaceEcosystemControls
} from "@/lib/marketplace-ecosystem/marketplace-ecosystem";

const report = buildMarketplaceReport();

export default function MarketplaceProvidersPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-16 text-slate-900">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          OmegaCrownAI Phase 91
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Marketplace + Provider Ecosystem
        </h1>
        <p className="mt-5 max-w-4xl text-base leading-7 text-slate-700">
          Phase 91 expands OmegaCrownAI from product into platform: verified
          providers, installable modules, controlled scopes, sandbox execution,
          revenue sharing, and provider billing foundations.
        </p>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Providers
          </p>
          <p className="mt-2 text-3xl font-semibold">{report.providers.length}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Modules
          </p>
          <p className="mt-2 text-3xl font-semibold">{report.modules.length}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Sandbox runs
          </p>
          <p className="mt-2 text-3xl font-semibold">{report.sandboxRuns.length}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Readiness
          </p>
          <p className="mt-2 text-2xl font-semibold">
            {report.marketplaceReadiness}
          </p>
        </div>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2">
        {marketplaceEcosystemControls.map((item) => (
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
