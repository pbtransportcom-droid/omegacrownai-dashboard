const isolationRules = [
  {
    title: "Tenant and organization boundary",
    detail:
      "Every enterprise request must resolve a tenant and organization before reading, mutating, exporting, publishing, billing, or executing customer data."
  },
  {
    title: "Membership enforcement",
    detail:
      "Users must belong to the target organization and hold a sufficient role before accessing team, billing, provider, publishing, storage, or execution workflows."
  },
  {
    title: "Credential containment",
    detail:
      "Provider credentials, OAuth tokens, API keys, payment references, and storage secrets must never cross tenant boundaries or appear in unauthorized responses."
  },
  {
    title: "Scoped execution",
    detail:
      "Runtime jobs, publishing jobs, provider calls, exports, and automation runs must carry organization scope and reject cross-organization targets."
  },
  {
    title: "Auditability",
    detail:
      "Security-sensitive actions must record tenant, organization, actor, target, action, result, and timestamp for incident response."
  },
  {
    title: "Enterprise launch gate",
    detail:
      "Enterprise rollout must pause if cross-tenant access, missing authorization, credential exposure, or untraceable privileged actions are detected."
  }
];

const protectedAreas = [
  "Customer organization dashboard",
  "Billing and subscriptions",
  "Provider credentials",
  "Publishing accounts and jobs",
  "Storage assets and exports",
  "Team invitations and roles",
  "Runtime execution",
  "Project memory and history",
  "Marketplace installations",
  "Support and audit records"
];

export default function TenantIsolationPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16 text-slate-900">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          OmegaCrownAI Phase 81
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Enterprise Tenant Isolation
        </h1>
        <p className="mt-5 max-w-4xl text-base leading-7 text-slate-700">
          Phase 81 defines the enterprise security boundary for OmegaCrownAI.
          Customer data, provider credentials, billing controls, publishing
          execution, storage, teams, and project history must remain isolated by
          tenant and organization before enterprise rollout.
        </p>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2">
        {isolationRules.map((rule) => (
          <article
            key={rule.title}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold">{rule.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">{rule.detail}</p>
          </article>
        ))}
      </section>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-semibold">Protected enterprise areas</h2>
        <ul className="mt-5 grid gap-3 md:grid-cols-2">
          {protectedAreas.map((area) => (
            <li
              key={area}
              className="rounded-2xl border border-slate-200 p-4 text-sm leading-6 text-slate-700"
            >
              {area}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
