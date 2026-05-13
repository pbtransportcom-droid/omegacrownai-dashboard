import {
  buildExecutivePlan,
  reviewExecutivePlan
} from "@/lib/executive-autopilot/executive-autopilot";

const plan = buildExecutivePlan();
const review = reviewExecutivePlan(plan);

export default function ExecutiveReviewPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16 text-slate-900">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          OmegaCrownAI Phase 90
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Executive Review Loop
        </h1>
        <p className="mt-5 max-w-4xl text-base leading-7 text-slate-700">
          The executive review loop evaluates wins, risks, next actions, and
          forecast accuracy so OmegaCrownAI can adjust strategy each cycle.
        </p>
      </section>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-semibold">Status: {review.status}</h2>

        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <div>
            <h3 className="font-semibold">Wins</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
              {review.wins.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold">Risks</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
              {review.risks.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold">Next actions</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
              {review.nextActions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
