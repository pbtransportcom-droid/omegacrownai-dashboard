import {
  complianceEvidence,
  evaluateComplianceReadiness
} from "@/lib/compliance/enterprise-compliance-evidence";

const readiness = evaluateComplianceReadiness();

export default function ComplianceEvidencePage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-16 text-slate-900">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          OmegaCrownAI Phase 83
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Enterprise Compliance Evidence
        </h1>
        <p className="mt-5 max-w-4xl text-base leading-7 text-slate-700">
          This dashboard consolidates OmegaCrownAI enterprise compliance evidence
          across legal readiness, monitoring, launch governance, customer rollout,
          tenant isolation, security hardening, audit logs, admin controls, and
          access reviews.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Status
            </p>
            <p className="mt-2 text-2xl font-semibold">{readiness.status}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Ready
            </p>
            <p className="mt-2 text-2xl font-semibold">{readiness.readyCount}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Conditional
            </p>
            <p className="mt-2 text-2xl font-semibold">
              {readiness.conditionalCount}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Needs review
            </p>
            <p className="mt-2 text-2xl font-semibold">
              {readiness.needsReviewCount}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-5">
        {complianceEvidence.map((item) => (
          <article
            key={item.area}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">{item.area}</h2>
                <p className="mt-2 text-sm text-slate-500">{item.sourceRoute}</p>
              </div>
              <span className="rounded-full border border-slate-300 px-3 py-1 text-xs font-bold uppercase tracking-wide">
                {item.status}
              </span>
            </div>
            <p className="mt-4 text-sm font-semibold text-slate-600">Evidence</p>
            <p className="mt-1 text-sm leading-6 text-slate-700">{item.evidence}</p>
            <p className="mt-4 text-sm font-semibold text-slate-600">Owner</p>
            <p className="mt-1 text-sm leading-6 text-slate-700">{item.owner}</p>
            <p className="mt-4 text-sm font-semibold text-slate-600">
              Risk if missing
            </p>
            <p className="mt-1 text-sm leading-6 text-slate-700">
              {item.riskIfMissing}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}
