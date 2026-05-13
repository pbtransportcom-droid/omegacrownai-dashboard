import {
  postLaunchValidation,
  rollbackChecklist
} from "@/lib/release-readiness/production-release-readiness";

export default function ReleaseRollbackPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16 text-slate-900">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          OmegaCrownAI Phase 94
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Rollback and Post-Launch Validation
        </h1>
        <p className="mt-5 max-w-4xl text-base leading-7 text-slate-700">
          Rollback readiness protects OmegaCrownAI from failed deployments,
          authentication or billing breakage, provider safety incidents, data
          exposure risk, publishing failures, and cost or latency instability.
        </p>
      </section>

      <section className="mt-8 grid gap-5">
        {rollbackChecklist.map((step) => (
          <article
            key={step.order}
            className="rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm"
          >
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-700">
              Trigger {step.order}
            </p>
            <h2 className="mt-2 text-xl font-semibold text-red-950">
              {step.trigger}
            </h2>
            <p className="mt-4 text-sm leading-6 text-red-900">
              Action: {step.action}
            </p>
            <p className="mt-2 text-sm leading-6 text-red-900">
              Validation: {step.validation}
            </p>
          </article>
        ))}
      </section>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-semibold">Post-launch validation</h2>
        <ul className="mt-5 list-disc space-y-3 pl-5 text-sm leading-6 text-slate-700">
          {postLaunchValidation.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
