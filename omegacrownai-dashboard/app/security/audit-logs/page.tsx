const auditCategories = [
  {
    category: "Authentication",
    events: "Login success, login failure, logout, session revocation, password reset."
  },
  {
    category: "Team and roles",
    events: "Invites, removals, role grants, role removals, admin promotion, owner transfer."
  },
  {
    category: "Billing",
    events: "Checkout, billing portal access, payment failures, subscription changes, entitlement updates."
  },
  {
    category: "Providers",
    events: "Provider connect, credential rotation, provider revoke, provider execution, provider failure."
  },
  {
    category: "Publishing",
    events: "Publishing account connection, job creation, approval, cancellation, failure, retry."
  },
  {
    category: "Storage and exports",
    events: "Asset upload, export, download, storage sync, customer data export."
  },
  {
    category: "Tenant isolation",
    events: "Missing tenant context, missing organization scope, cross-tenant access blocked."
  },
  {
    category: "Incidents",
    events: "Security incident declaration, severity changes, mitigation, post-incident review."
  }
];

const retentionRules = [
  "Standard audit logs should be retained for at least 365 days.",
  "Enterprise audit logs should support extended retention where contracted.",
  "Critical security, billing, credential, and incident events should be retained as needed for legal and compliance obligations.",
  "Audit exports must be scoped to tenant and organization and must create their own audit event.",
  "Audit records should not expose provider secrets, API keys, payment secrets, raw tokens, or private credentials."
];

export default function AuditLogsPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16 text-slate-900">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          OmegaCrownAI Phase 82
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Enterprise Audit Logs
        </h1>
        <p className="mt-5 max-w-4xl text-base leading-7 text-slate-700">
          Phase 82 turns the Phase 81 security boundary into enterprise evidence.
          Audit logs must show who did what, when, where, in which tenant and
          organization, and whether the action succeeded, failed, or was blocked.
        </p>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2">
        {auditCategories.map((item) => (
          <article
            key={item.category}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold">{item.category}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">{item.events}</p>
          </article>
        ))}
      </section>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-semibold">Retention and export policy</h2>
        <ul className="mt-5 list-disc space-y-3 pl-5 text-sm leading-6 text-slate-700">
          {retentionRules.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
