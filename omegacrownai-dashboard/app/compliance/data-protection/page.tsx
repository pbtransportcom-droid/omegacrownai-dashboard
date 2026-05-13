const dataProtectionEvidence = [
  {
    area: "Data processing terms",
    evidence:
      "DPA page defines customer/controller and OmegaCrownAI/processor expectations for customer personal data."
  },
  {
    area: "Privacy notice",
    evidence:
      "Privacy Policy describes account data, organization data, prompts, uploads, outputs, logs, provider metadata, and retention."
  },
  {
    area: "Tenant isolation",
    evidence:
      "Tenant and organization boundaries are defined for customer data, provider credentials, billing, storage, publishing, and execution."
  },
  {
    area: "Provider disclosure",
    evidence:
      "Provider Disclosure explains that AI providers, payment processors, storage vendors, publishing platforms, and infrastructure vendors may process customer data."
  },
  {
    area: "Audit evidence",
    evidence:
      "Audit policy covers authentication, billing, providers, publishing, storage, tenant isolation, admin activity, and incidents."
  },
  {
    area: "Incident response",
    evidence:
      "Incident response process defines SEV1 escalation for suspected data exposure, credential leakage, or cross-tenant access."
  }
];

const enterpriseDataRisks = [
  "Cross-tenant access must block enterprise rollout.",
  "Provider credentials must not be exposed in unauthorized responses.",
  "Customer data exports must be tenant-scoped and audit logged.",
  "Billing and provider actions must require authorized organization roles.",
  "Security incidents involving customer data must escalate as SEV1."
];

export default function DataProtectionEvidencePage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16 text-slate-900">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          OmegaCrownAI Phase 83
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Data Protection Evidence
        </h1>
        <p className="mt-5 max-w-4xl text-base leading-7 text-slate-700">
          This page consolidates evidence that OmegaCrownAI has defined privacy,
          data processing, tenant isolation, provider disclosure, audit, and
          incident response controls for enterprise customers.
        </p>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2">
        {dataProtectionEvidence.map((item) => (
          <article
            key={item.area}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold">{item.area}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              {item.evidence}
            </p>
          </article>
        ))}
      </section>

      <section className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-red-950">
          Enterprise data protection blockers
        </h2>
        <ul className="mt-5 list-disc space-y-3 pl-5 text-sm leading-6 text-red-900">
          {enterpriseDataRisks.map((risk) => (
            <li key={risk}>{risk}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
