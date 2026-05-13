import { buildMarketplaceReport } from "@/lib/marketplace-ecosystem/marketplace-ecosystem";

const report = buildMarketplaceReport();

export default function MarketplaceVerificationPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-16 text-slate-900">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          OmegaCrownAI Phase 91
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Provider Verification Engine
        </h1>
        <p className="mt-5 max-w-4xl text-base leading-7 text-slate-700">
          Provider verification protects OmegaCrownAI by reviewing verified
          status, scopes, revenue share, risk level, and marketplace readiness
          before broad availability.
        </p>
      </section>

      <section className="mt-8 grid gap-5">
        {report.verifications.map((verification) => (
          <article
            key={verification.providerId}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">
                {verification.providerId}
              </h2>
              <span className="rounded-full border border-slate-300 px-3 py-1 text-xs font-bold uppercase tracking-wide">
                {verification.status}
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-700">
              {verification.recommendation}
            </p>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {verification.checks.map((check) => (
                <div
                  key={check.name}
                  className="rounded-2xl border border-slate-200 p-4"
                >
                  <p className="font-semibold">{check.name}</p>
                  <p className="mt-2 text-sm text-slate-700">
                    {check.passed ? "Passed" : "Needs review"}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {check.detail}
                  </p>
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
