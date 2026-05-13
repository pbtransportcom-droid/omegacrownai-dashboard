import { deploymentRunbook } from "@/lib/release-readiness/production-release-readiness";

export default function ReleaseRunbookPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16 text-slate-900">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          OmegaCrownAI Phase 94
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Deployment Runbook
        </h1>
        <p className="mt-5 max-w-4xl text-base leading-7 text-slate-700">
          The deployment runbook defines the release process from clean repo
          validation through production build, environment validation, deploy,
          and post-launch smoke testing.
        </p>
      </section>

      <section className="mt-8 grid gap-5">
        {deploymentRunbook.map((step) => (
          <article
            key={step.order}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">
              Step {step.order}
            </p>
            <h2 className="mt-2 text-xl font-semibold">{step.title}</h2>
            <p className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 font-mono text-xs leading-6 text-slate-700">
              {step.commandOrAction}
            </p>
            <p className="mt-4 text-sm leading-6 text-slate-700">
              Success: {step.successCriteria}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}
