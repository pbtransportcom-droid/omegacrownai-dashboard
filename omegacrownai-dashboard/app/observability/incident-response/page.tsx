const severities = [
  {
    level: "SEV1",
    title: "Critical production incident",
    examples: [
      "Platform-wide outage",
      "Authentication outage",
      "Billing or checkout outage",
      "Suspected data exposure",
      "Provider-wide publishing or execution failure"
    ],
    response: [
      "Declare incident immediately",
      "Freeze risky deployments",
      "Identify owner and incident commander",
      "Assess rollback or mitigation",
      "Post customer-facing update when impact is confirmed",
      "Prepare post-incident review"
    ]
  },
  {
    level: "SEV2",
    title: "Major degradation",
    examples: [
      "High failed job rate",
      "Major provider integration degradation",
      "Customer organization feature unavailable",
      "Storage, export, or rendering disruption"
    ],
    response: [
      "Assign owner",
      "Confirm affected customers and features",
      "Disable affected workflows if needed",
      "Track mitigation steps",
      "Escalate to SEV1 if scope expands"
    ]
  },
  {
    level: "SEV3",
    title: "Minor degradation or isolated issue",
    examples: [
      "Single-customer configuration issue",
      "Non-critical alert",
      "Delayed queue with no data loss",
      "Recoverable provider warning"
    ],
    response: [
      "Create ticket or operational note",
      "Monitor for recurrence",
      "Schedule fix",
      "Document customer impact if any"
    ]
  }
];

export default function IncidentResponsePage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16 text-slate-900">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          OmegaCrownAI Operations
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Incident Response Runbook
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-slate-700">
          This runbook defines how OmegaCrownAI classifies, triages, mitigates,
          communicates, and reviews production incidents across the dashboard,
          billing, publishing, provider activation, storage, runtime execution,
          and customer organization systems.
        </p>
      </section>

      <section className="mt-8 grid gap-6">
        {severities.map((severity) => (
          <article
            key={severity.level}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">
                  {severity.level}
                </p>
                <h2 className="mt-2 text-2xl font-semibold">{severity.title}</h2>
              </div>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="font-semibold">Examples</h3>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-700">
                  {severity.examples.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold">Required response</h3>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-700">
                  {severity.response.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-semibold">Post-incident review</h2>
        <p className="mt-4 text-base leading-7 text-slate-700">
          Every SEV1 and material SEV2 incident should produce a short review
          covering customer impact, timeline, root cause, mitigation, owner,
          preventive actions, and follow-up date.
        </p>
      </section>
    </main>
  );
}
