import {
  humanReviewRules,
  researchDisclosure
} from "@/lib/platform-limitations/platform-limitation-controls";

export default function ResearchDisclosurePage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-16 text-slate-900">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          OmegaCrownAI Phase 96
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Research Disclosure and Human Review
        </h1>
        <p className="mt-5 max-w-4xl text-base leading-7 text-slate-700">
          {researchDisclosure}
        </p>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2">
        {humanReviewRules.map((rule) => (
          <article
            key={rule.id}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold">{rule.area}</h2>
            <p className="mt-4 text-sm font-semibold text-slate-700">
              Required when
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              {rule.requiredWhen}
            </p>
            <p className="mt-4 text-sm font-semibold text-slate-700">
              Reviewer
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              {rule.reviewer}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}
