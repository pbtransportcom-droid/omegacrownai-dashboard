const alertRules = [
  {
    name: "Application availability",
    severity: "SEV1",
    trigger: "Health endpoint unavailable or returning degraded status for production.",
    action: "Confirm deployment status, check runtime logs, validate environment variables, and prepare rollback if customer access is affected."
  },
  {
    name: "Authentication failure",
    severity: "SEV1",
    trigger: "Login, signup, session validation, or customer organization access fails across multiple users.",
    action: "Validate auth secrets, OAuth configuration, database access, and recent deployment changes."
  },
  {
    name: "Billing/payment failure",
    severity: "SEV1",
    trigger: "Stripe checkout, billing portal, webhook processing, or plan enforcement fails in production.",
    action: "Check Stripe keys, webhook secret, event delivery, payment logs, and entitlement synchronization."
  },
  {
    name: "Publishing execution failure",
    severity: "SEV2",
    trigger: "Publishing jobs fail or queue repeatedly across connected providers.",
    action: "Review provider credentials, OAuth token status, rate limits, job retries, and provider error payloads."
  },
  {
    name: "Premium provider degradation",
    severity: "SEV2",
    trigger: "AI model provider, rendering provider, or premium execution provider returns elevated failures.",
    action: "Switch provider where available, disable affected workflows, notify impacted customers, and monitor recovery."
  },
  {
    name: "Storage/export failure",
    severity: "SEV2",
    trigger: "Customer assets, exports, or generated files fail to register, sync, or download.",
    action: "Inspect storage configuration, asset status routes, export jobs, and customer organization storage logs."
  },
  {
    name: "Slow jobs or queue backlog",
    severity: "SEV3",
    trigger: "Jobs complete slowly but core platform remains available.",
    action: "Review queue depth, worker routes, retry behavior, and scheduled execution pressure."
  }
];

export default function AlertsPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16 text-slate-900">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          OmegaCrownAI Operations
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Monitoring and Alert Rules
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-slate-700">
          Phase 78 defines production monitoring coverage for availability,
          authentication, billing, provider integrations, publishing execution,
          storage, exports, and runtime jobs.
        </p>
      </section>

      <section className="mt-8 grid gap-5">
        {alertRules.map((rule) => (
          <article
            key={rule.name}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">{rule.name}</h2>
              <span className="rounded-full border border-slate-300 px-3 py-1 text-xs font-bold uppercase tracking-wide">
                {rule.severity}
              </span>
            </div>
            <p className="mt-4 text-sm font-semibold text-slate-600">Trigger</p>
            <p className="mt-1 text-base leading-7 text-slate-700">{rule.trigger}</p>
            <p className="mt-4 text-sm font-semibold text-slate-600">Response</p>
            <p className="mt-1 text-base leading-7 text-slate-700">{rule.action}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
