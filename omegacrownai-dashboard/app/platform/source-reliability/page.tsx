import { sourceReliabilityTiers } from "@/lib/platform-limitations/platform-limitation-controls";

export default function SourceReliabilityPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-16 text-slate-900">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          OmegaCrownAI Phase 96
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Source Reliability Controls
        </h1>
        <p className="mt-5 max-w-4xl text-base leading-7 text-slate-700">
          Source reliability controls classify information by trust level so
          OmegaCrownAI can distinguish verified materials, connected customer
          sources, provider-supplied information, user-supplied context, and
          unverified claims.
        </p>
      </section>

      <section className="mt-8 grid gap-5">
        {sourceReliabilityTiers.map((tier) => (
          <article
            key={tier.id}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold">{tier.tier}</h2>
            <p className="mt-4 text-sm leading-6 text-slate-700">
              {tier.description}
            </p>
            <p className="mt-4 text-sm font-semibold text-slate-700">
              Allowed use
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              {tier.allowedUse}
            </p>
            <p className="mt-4 text-sm font-semibold text-slate-700">
              Required review
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              {tier.requiredReview}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}
