const rolloutStages = [
  {
    stage: "Stage 1",
    title: "Founder-controlled pilot",
    audience: "Internal operators, trusted testers, and first qualified customers.",
    goal: "Validate production readiness, onboarding clarity, billing flows, provider connections, and support response before broad rollout.",
    actions: [
      "Invite a small group of early customers manually.",
      "Confirm account creation, organization setup, billing, and provider activation.",
      "Review first project creation and publishing workflow.",
      "Collect friction notes and classify blockers before expansion."
    ]
  },
  {
    stage: "Stage 2",
    title: "Guided customer onboarding",
    audience: "Selected customers with high-fit use cases.",
    goal: "Provide a structured activation path that gets customers to first successful output quickly.",
    actions: [
      "Send welcome email and onboarding checklist.",
      "Guide customers through organization profile, team setup, billing plan, and provider connections.",
      "Confirm first project, first generated asset, and first publish-ready workflow.",
      "Track support issues and product gaps."
    ]
  },
  {
    stage: "Stage 3",
    title: "Public launch expansion",
    audience: "Broader customer acquisition channels.",
    goal: "Open the platform with monitoring, legal, billing, support, and incident response in place.",
    actions: [
      "Enable public campaign traffic.",
      "Monitor signups, onboarding completion, checkout success, provider activation, and support load.",
      "Pause or slow rollout if SEV1/SEV2 production risk appears.",
      "Prepare launch control room review for Phase 80."
    ]
  }
];

const readinessChecks = [
  "Production legal pages are live.",
  "Monitoring and incident response pages are live.",
  "Billing and checkout paths are validated.",
  "Provider disclosure and premium provider dependencies are visible.",
  "Customer organization onboarding path is clear.",
  "Support escalation and rollout pause criteria are defined.",
  "First customer success path is documented."
];

export default function CustomerRolloutPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16 text-slate-900">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          OmegaCrownAI Phase 79
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Customer Rollout Plan
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-slate-700">
          This rollout plan moves OmegaCrownAI from production readiness into
          controlled customer activation. The objective is to onboard customers
          in stages, protect platform reliability, validate billing and provider
          workflows, and prepare for the Phase 80 launch control room.
        </p>
      </section>

      <section className="mt-8 grid gap-6">
        {rolloutStages.map((stage) => (
          <article
            key={stage.stage}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">
              {stage.stage}
            </p>
            <h2 className="mt-2 text-2xl font-semibold">{stage.title}</h2>
            <p className="mt-4 text-sm font-semibold text-slate-600">Audience</p>
            <p className="mt-1 text-base leading-7 text-slate-700">
              {stage.audience}
            </p>
            <p className="mt-4 text-sm font-semibold text-slate-600">Goal</p>
            <p className="mt-1 text-base leading-7 text-slate-700">{stage.goal}</p>
            <p className="mt-4 text-sm font-semibold text-slate-600">Actions</p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-700">
              {stage.actions.map((action) => (
                <li key={action}>{action}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-semibold">Rollout readiness checklist</h2>
        <ul className="mt-5 grid gap-3 md:grid-cols-2">
          {readinessChecks.map((check) => (
            <li
              key={check}
              className="rounded-2xl border border-slate-200 p-4 text-sm leading-6 text-slate-700"
            >
              {check}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
