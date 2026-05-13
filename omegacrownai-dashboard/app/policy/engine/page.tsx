import {
  evaluatePolicies,
  policyEngineControls,
  sampleEvaluationContext,
  samplePolicies
} from "@/lib/global-policy-engine/global-policy-engine";

const sampleEvaluation = evaluatePolicies({
  policies: samplePolicies,
  context: sampleEvaluationContext,
  payload: {
    prompt: "Run governed execution."
  }
});

export default function PolicyEnginePage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16 text-slate-900">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          OmegaCrownAI Phase 85
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Global Policy Engine
        </h1>
        <p className="mt-5 max-w-4xl text-base leading-7 text-slate-700">
          The Global Policy Engine is OmegaCrownAI&apos;s runtime governance layer.
          It evaluates region-aware, organization-aware, project-aware, and
          agent-aware policies before governed actions such as execution,
          publishing, provider usage, billing, exports, and marketplace activity.
        </p>
      </section>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-semibold">Sample policy decision</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Decision
            </p>
            <p className="mt-2 text-2xl font-semibold">
              {sampleEvaluation.decision}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Applied
            </p>
            <p className="mt-2 text-2xl font-semibold">
              {sampleEvaluation.appliedPolicies.length}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Violations
            </p>
            <p className="mt-2 text-2xl font-semibold">
              {sampleEvaluation.violatedPolicies.length}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2">
        {policyEngineControls.map((item) => (
          <article
            key={item.area}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold">{item.area}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">{item.control}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
