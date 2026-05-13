import {
  createVariants,
  sampleCampaign
} from "@/lib/distribution/distribution-super-pipeline";

const variants = createVariants(sampleCampaign);

export default function DistributionVariantsPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-16 text-slate-900">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          OmegaCrownAI Phase 88
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Distribution Variants
        </h1>
        <p className="mt-5 max-w-4xl text-base leading-7 text-slate-700">
          A/B variants allow OmegaCrownAI to test titles, hooks, calls to action,
          and channel-specific payloads.
        </p>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2">
        {variants.map((variant) => (
          <article
            key={variant.id}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold">{variant.title}</h2>
            <p className="mt-2 text-xs uppercase tracking-wide text-slate-500">
              {variant.channel}
            </p>
            <p className="mt-4 text-sm leading-6 text-slate-700">
              {variant.hook}
            </p>
            <p className="mt-4 text-sm font-semibold text-slate-700">
              CTA: {variant.callToAction}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}
