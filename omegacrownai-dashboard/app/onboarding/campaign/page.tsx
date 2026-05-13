const campaignSteps = [
  {
    title: "Welcome and account setup",
    timing: "Day 0",
    message:
      "Welcome the customer, confirm their workspace, explain the first success milestone, and guide them to complete account setup."
  },
  {
    title: "Organization configuration",
    timing: "Day 0-1",
    message:
      "Prompt the customer to set up organization details, invite team members, confirm billing status, and review access permissions."
  },
  {
    title: "Provider activation",
    timing: "Day 1",
    message:
      "Guide the customer through connected providers, publishing accounts, premium provider keys, storage settings, and disclosure expectations."
  },
  {
    title: "First project launch",
    timing: "Day 1-2",
    message:
      "Help the customer create the first project, generate the first asset, review output quality, and prepare the first publish-ready workflow."
  },
  {
    title: "Success review",
    timing: "Day 3-5",
    message:
      "Review customer progress, collect friction points, confirm value delivered, and identify expansion opportunities."
  },
  {
    title: "Expansion path",
    timing: "Day 7+",
    message:
      "Recommend next workflows, additional users, higher-value automations, and provider upgrades based on the customer's use case."
  }
];

const emails = [
  {
    subject: "Welcome to OmegaCrownAI",
    purpose: "Account activation and first-login guidance.",
    body:
      "Your OmegaCrownAI workspace is ready. Start by completing your organization profile, confirming billing access, and choosing the first workflow you want to launch."
  },
  {
    subject: "Connect your providers",
    purpose: "Provider activation and publishing readiness.",
    body:
      "Connect the accounts and providers you want OmegaCrownAI to use for generation, publishing, storage, and execution. Review provider permissions before activating workflows."
  },
  {
    subject: "Create your first production workflow",
    purpose: "Move customer from setup to value.",
    body:
      "Choose your first project, generate an asset, review the output, and prepare the workflow for approval or publishing."
  },
  {
    subject: "Your OmegaCrownAI success check",
    purpose: "Retention, support, and expansion discovery.",
    body:
      "We are checking in to confirm your first workflow is live, review any blockers, and help you expand into the next high-value use case."
  }
];

export default function OnboardingCampaignPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16 text-slate-900">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          OmegaCrownAI Phase 79
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Customer Onboarding Campaign
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-slate-700">
          This campaign guides customers from signup to first successful
          OmegaCrownAI workflow. It prioritizes account setup, provider
          activation, first project completion, support visibility, and
          expansion into higher-value workflows.
        </p>
      </section>

      <section className="mt-8 grid gap-5">
        {campaignSteps.map((step) => (
          <article
            key={step.title}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">{step.title}</h2>
              <span className="rounded-full border border-slate-300 px-3 py-1 text-xs font-bold uppercase tracking-wide">
                {step.timing}
              </span>
            </div>
            <p className="mt-4 text-base leading-7 text-slate-700">{step.message}</p>
          </article>
        ))}
      </section>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-semibold">Campaign email sequence</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {emails.map((email) => (
            <article
              key={email.subject}
              className="rounded-2xl border border-slate-200 p-5"
            >
              <h3 className="text-lg font-semibold">{email.subject}</h3>
              <p className="mt-2 text-sm font-semibold text-slate-500">
                {email.purpose}
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-700">{email.body}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
