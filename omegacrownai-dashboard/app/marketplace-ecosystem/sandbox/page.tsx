import { buildMarketplaceReport } from "@/lib/marketplace-ecosystem/marketplace-ecosystem";

const report = buildMarketplaceReport();

export default function MarketplaceSandboxPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-16 text-slate-900">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          OmegaCrownAI Phase 91
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Provider Sandbox Runtime
        </h1>
        <p className="mt-5 max-w-4xl text-base leading-7 text-slate-700">
          Sandbox runtime controls provider module execution with provider status,
          requested scopes, policy decisions, execution hashes, and company-safe
          blocking rules.
        </p>
      </section>

      <section className="mt-8 grid gap-5">
        {report.sandboxRuns.map((run) => (
          <article
            key={run.moduleId}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">{run.moduleId}</h2>
              <span className="rounded-full border border-slate-300 px-3 py-1 text-xs font-bold uppercase tracking-wide">
                {run.allowed ? "allowed" : "blocked"}
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-700">
              Provider: {run.providerId}
            </p>
            <p className="mt-4 break-all text-xs leading-6 text-slate-500">
              Execution hash: {run.executionHash}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}
