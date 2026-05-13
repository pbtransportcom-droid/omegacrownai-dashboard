import { buildMarketplaceReport } from "@/lib/marketplace-ecosystem/marketplace-ecosystem";

const report = buildMarketplaceReport();

export default function MarketplaceBillingPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-16 text-slate-900">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          OmegaCrownAI Phase 91
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Provider Billing Engine
        </h1>
        <p className="mt-5 max-w-4xl text-base leading-7 text-slate-700">
          Provider billing tracks usage, platform fees, provider payouts,
          revenue share, and settlement status for marketplace monetization.
        </p>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2">
        {report.billing.map((billing) => (
          <article
            key={billing.providerId}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">{billing.providerId}</h2>
              <span className="rounded-full border border-slate-300 px-3 py-1 text-xs font-bold uppercase tracking-wide">
                {billing.settlementStatus}
              </span>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <p className="rounded-2xl border border-slate-200 p-4 text-sm">
                Usage: ${billing.usageUsd}
              </p>
              <p className="rounded-2xl border border-slate-200 p-4 text-sm">
                Platform fee: ${billing.platformFeeUsd}
              </p>
              <p className="rounded-2xl border border-slate-200 p-4 text-sm">
                Provider payout: ${billing.providerPayoutUsd}
              </p>
              <p className="rounded-2xl border border-slate-200 p-4 text-sm">
                Share: {billing.revenueSharePercent}%
              </p>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
