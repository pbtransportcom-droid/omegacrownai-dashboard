const hardeningControls = [
  {
    area: "Authentication",
    control:
      "Require authenticated session context before customer organization, provider, billing, publishing, storage, or execution access."
  },
  {
    area: "Authorization",
    control:
      "Apply role checks for owner, admin, billing, operator, support, and member actions."
  },
  {
    area: "Data isolation",
    control:
      "Filter customer-owned records by tenantId and organizationId before database reads, writes, exports, and response serialization."
  },
  {
    area: "Provider security",
    control:
      "Store provider secrets securely, redact sensitive fields, and require organization membership before connect, run, revoke, or publish actions."
  },
  {
    area: "Billing protection",
    control:
      "Restrict billing portal, checkout, subscription, invoice, and entitlement actions to authorized organization roles."
  },
  {
    area: "Publishing safety",
    control:
      "Require organization-scoped publishing accounts, approval checks, retry controls, and audit events for publishing execution."
  },
  {
    area: "Audit trail",
    control:
      "Log privileged actions with actor, organization, tenant, target, action, result, IP context where available, and timestamp."
  },
  {
    area: "Security incident escalation",
    control:
      "Treat cross-tenant exposure, credential leakage, billing abuse, or unauthorized publishing as SEV1 security incidents."
  }
];

const rolloutBlocks = [
  "Any confirmed cross-tenant data access.",
  "Any provider credential exposure to unauthorized users.",
  "Billing administration available without role enforcement.",
  "Publishing execution possible without organization membership.",
  "Enterprise customer data export without audit trace.",
  "Privileged action cannot identify actor and organization."
];

export default function SecurityHardeningPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16 text-slate-900">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          OmegaCrownAI Phase 81
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Enterprise Security Hardening
        </h1>
        <p className="mt-5 max-w-4xl text-base leading-7 text-slate-700">
          This security hardening plan prepares OmegaCrownAI for enterprise
          customers by protecting authentication, authorization, tenant
          isolation, billing, provider credentials, publishing execution,
          storage, auditability, and incident escalation.
        </p>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2">
        {hardeningControls.map((item) => (
          <article
            key={item.area}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold">{item.area}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">{item.control}</p>
          </article>
        ))}
      </section>

      <section className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-red-950">
          Enterprise rollout blockers
        </h2>
        <ul className="mt-5 list-disc space-y-3 pl-5 text-sm leading-6 text-red-900">
          {rolloutBlocks.map((blocker) => (
            <li key={blocker}>{blocker}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
