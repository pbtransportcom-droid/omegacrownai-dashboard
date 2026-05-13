const readinessSections = [
  {
    phase: "Phase 77",
    title: "Legal readiness",
    result:
      "Production legal pages replaced placeholders and now cover terms, privacy, DPA, refund, billing, cookies, and providers."
  },
  {
    phase: "Phase 78",
    title: "Monitoring and incident response",
    result:
      "Monitoring alerts, health endpoint, incident intake, and response runbook support production operations."
  },
  {
    phase: "Phase 79",
    title: "Customer rollout",
    result:
      "Customer rollout and onboarding campaign define staged activation and success milestones."
  },
  {
    phase: "Phase 80",
    title: "Launch control",
    result:
      "Production launch control room defines go/no-go, pause, rollback, and launch commander decision criteria."
  },
  {
    phase: "Phase 81",
    title: "Tenant isolation and security hardening",
    result:
      "Enterprise tenant boundaries, protected areas, security controls, and rollout blockers are defined."
  },
  {
    phase: "Phase 82",
    title: "Audit logs and admin controls",
    result:
      "Audit categories, retention rules, admin controls, and access review surfaces are defined."
  },
  {
    phase: "Phase 83",
    title: "Compliance evidence and reports",
    result:
      "Enterprise evidence, security report, data protection evidence, and readiness summary are consolidated."
  }
];

const nextHardening = [
  "Connect compliance evidence APIs to persistent production records.",
  "Add real audit event ingestion from auth, billing, provider, publishing, storage, and admin routes.",
  "Add downloadable enterprise security report export.",
  "Add role-protected admin-only access for compliance pages.",
  "Complete final Stripe checkout validation with real keys.",
  "Schedule attorney review of public legal language."
];

export default function EnterpriseReadinessPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16 text-slate-900">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          OmegaCrownAI Phase 83
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Enterprise Readiness Report
        </h1>
        <p className="mt-5 max-w-4xl text-base leading-7 text-slate-700">
          OmegaCrownAI has completed the production legal, monitoring, rollout,
          launch control, tenant isolation, security hardening, audit, admin
          control, and compliance evidence layers required for controlled
          enterprise readiness.
        </p>
      </section>

      <section className="mt-8 grid gap-5">
        {readinessSections.map((section) => (
          <article
            key={section.phase}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">
              {section.phase}
            </p>
            <h2 className="mt-2 text-xl font-semibold">{section.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              {section.result}
            </p>
          </article>
        ))}
      </section>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-semibold">Recommended next hardening</h2>
        <ul className="mt-5 list-disc space-y-3 pl-5 text-sm leading-6 text-slate-700">
          {nextHardening.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
