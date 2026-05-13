const launchReadiness = [
  {
    area: "Legal and compliance",
    status: "Ready",
    evidence: "Terms, Privacy, DPA, refund policy, billing policy, cookie notice, and provider disclosure are live.",
    owner: "Operations"
  },
  {
    area: "Monitoring and incidents",
    status: "Ready",
    evidence: "Monitoring alerts, health checks, incident intake, and incident response runbook are live.",
    owner: "Operations"
  },
  {
    area: "Customer rollout",
    status: "Ready",
    evidence: "Customer rollout plan, onboarding campaign, and onboarding campaign API are live.",
    owner: "Customer success"
  },
  {
    area: "Billing",
    status: "Conditional",
    evidence: "Billing foundation exists. Final Stripe checkout validation still depends on real test/live keys.",
    owner: "Finance / Operations"
  },
  {
    area: "Provider activation",
    status: "Ready",
    evidence: "Premium provider activation, OAuth publishing activation, and provider disclosure flows are in place.",
    owner: "Platform"
  },
  {
    area: "Publishing execution",
    status: "Ready",
    evidence: "Real publishing execution phase is complete and covered by incident criteria.",
    owner: "Platform"
  },
  {
    area: "Rollback and pause controls",
    status: "Ready",
    evidence: "Go/no-go criteria, rollout pause rules, and rollback triggers are documented for launch operations.",
    owner: "Launch commander"
  }
];

const goNoGo = [
  "Production build succeeds.",
  "Authentication and customer organization access are working.",
  "Legal pages are visible and linked for customer review.",
  "Health endpoint reports expected status.",
  "Billing path is validated with available keys.",
  "Provider activation path is validated for the launch audience.",
  "Monitoring and incident response owner is assigned.",
  "Customer onboarding path is ready.",
  "Rollback and rollout pause criteria are understood.",
  "No unresolved SEV1 incident is active."
];

const pauseCriteria = [
  "SEV1 incident is declared.",
  "Authentication outage affects multiple users.",
  "Billing checkout or entitlement enforcement fails during launch.",
  "Customer data exposure concern appears.",
  "Provider-wide publishing failure affects launch customers.",
  "Critical onboarding blocker affects multiple customers.",
  "Production deployment instability or repeated runtime errors appear."
];

const rollbackCriteria = [
  "New deployment causes platform-wide outage.",
  "New launch feature blocks login, billing, onboarding, or customer organization access.",
  "New launch feature causes data integrity risk.",
  "Monitoring shows sustained critical error rate after deployment.",
  "Manual mitigation is slower or riskier than reverting."
];

export default function LaunchControlRoomPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-16 text-slate-900">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          OmegaCrownAI Phase 80
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Production Launch Control Room
        </h1>
        <p className="mt-5 max-w-4xl text-base leading-7 text-slate-700">
          The launch control room centralizes OmegaCrownAI production readiness,
          launch ownership, go/no-go criteria, pause triggers, rollback criteria,
          and customer rollout protection before advancing to enterprise hardening.
        </p>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {launchReadiness.map((item) => (
          <article
            key={item.area}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-xl font-semibold">{item.area}</h2>
              <span className="rounded-full border border-slate-300 px-3 py-1 text-xs font-bold uppercase tracking-wide">
                {item.status}
              </span>
            </div>
            <p className="mt-4 text-sm font-semibold text-slate-500">Evidence</p>
            <p className="mt-1 text-sm leading-6 text-slate-700">{item.evidence}</p>
            <p className="mt-4 text-sm font-semibold text-slate-500">Owner</p>
            <p className="mt-1 text-sm leading-6 text-slate-700">{item.owner}</p>
          </article>
        ))}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold">Go / no-go checklist</h2>
          <ul className="mt-5 list-disc space-y-3 pl-5 text-sm leading-6 text-slate-700">
            {goNoGo.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold">Pause criteria</h2>
          <ul className="mt-5 list-disc space-y-3 pl-5 text-sm leading-6 text-slate-700">
            {pauseCriteria.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold">Rollback criteria</h2>
          <ul className="mt-5 list-disc space-y-3 pl-5 text-sm leading-6 text-slate-700">
            {rollbackCriteria.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-semibold">Launch commander decision</h2>
        <p className="mt-4 text-base leading-7 text-slate-700">
          OmegaCrownAI should proceed to public production launch only when the
          launch commander confirms no active SEV1 incident, accepts any known
          conditional risks, verifies billing/provider readiness for the launch
          audience, and confirms support coverage for customer rollout.
        </p>
      </section>
    </main>
  );
}
