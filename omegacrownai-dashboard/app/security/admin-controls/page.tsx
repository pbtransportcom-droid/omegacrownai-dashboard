const controls = [
  {
    title: "Admin role review",
    detail:
      "Enterprise tenants must regularly review owners, admins, billing users, operators, support users, and provider managers."
  },
  {
    title: "Billing access control",
    detail:
      "Checkout, billing portal, subscription, invoice, entitlement, and payment settings must be limited to authorized roles."
  },
  {
    title: "Provider credential governance",
    detail:
      "Provider credentials must be redacted, revocable, auditable, and manageable only by authorized organization roles."
  },
  {
    title: "Publishing approval control",
    detail:
      "Publishing execution should enforce organization membership, approval state, provider authorization, and audit logging."
  },
  {
    title: "Export and download control",
    detail:
      "Customer data exports and asset downloads must be tenant-scoped, role-protected, and audit logged."
  },
  {
    title: "Security escalation",
    detail:
      "Cross-tenant attempts, credential exposure, unauthorized publishing, and billing abuse must escalate as SEV1 security incidents."
  }
];

const approvalRequired = [
  "Owner transfer",
  "Admin promotion",
  "Billing administrator change",
  "Provider credential revocation",
  "Provider credential rotation",
  "Publishing account disconnect",
  "Large customer data export",
  "Tenant deletion or suspension",
  "Security policy change"
];

export default function AdminControlsPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16 text-slate-900">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          OmegaCrownAI Phase 82
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Admin Security Controls
        </h1>
        <p className="mt-5 max-w-4xl text-base leading-7 text-slate-700">
          Enterprise administrators need tenant-safe controls for roles, billing,
          providers, publishing, exports, and security escalation. These controls
          protect OmegaCrownAI and customer organizations from unauthorized use,
          credential exposure, billing abuse, and cross-tenant access.
        </p>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2">
        {controls.map((control) => (
          <article
            key={control.title}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold">{control.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">{control.detail}</p>
          </article>
        ))}
      </section>

      <section className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-amber-950">
          Sensitive actions requiring elevated approval
        </h2>
        <ul className="mt-5 grid gap-3 md:grid-cols-2">
          {approvalRequired.map((item) => (
            <li
              key={item}
              className="rounded-2xl border border-amber-200 bg-white/60 p-4 text-sm leading-6 text-amber-950"
            >
              {item}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
