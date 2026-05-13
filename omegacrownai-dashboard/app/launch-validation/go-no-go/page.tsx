import {
  buildSmokeChecks,
  evaluateGoNoGo
} from "@/lib/launch-validation/production-launch-validation";

const goNoGo = evaluateGoNoGo(buildSmokeChecks());

export default function LaunchValidationGoNoGoPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16 text-slate-900">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          OmegaCrownAI Phase 95
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Final Go / No-Go Validation
        </h1>
        <p className="mt-5 max-w-4xl text-base leading-7 text-slate-700">
          The launch decision is based on required smoke test failures,
          conditional warnings, billing readiness, provider controls, creative
          licensing, and post-launch monitoring coverage.
        </p>
      </section>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
          Decision
        </p>
        <h2 className="mt-3 text-4xl font-bold">{goNoGo.decision}</h2>
      </section>

      <section className="mt-8 grid gap-6 md:grid-cols-3">
        <article className="rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-red-950">Blockers</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-red-900">
            {(goNoGo.blockers.length ? goNoGo.blockers : ["No required blockers detected."]).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-amber-950">Warnings</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-amber-900">
            {(goNoGo.warnings.length ? goNoGo.warnings : ["No warnings detected."]).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Required actions</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
            {goNoGo.requiredActions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  );
}
