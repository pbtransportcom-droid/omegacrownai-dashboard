const reviewAreas = [
  {
    area: "Owners",
    review:
      "Confirm every owner is still authorized to control billing, team access, provider credentials, exports, and organization settings."
  },
  {
    area: "Admins",
    review:
      "Confirm admins still require elevated access and have not accumulated unnecessary privileges."
  },
  {
    area: "Billing users",
    review:
      "Confirm billing users are authorized to manage checkout, subscription, invoices, payment methods, and entitlements."
  },
  {
    area: "Provider managers",
    review:
      "Confirm provider managers are allowed to connect, rotate, revoke, and run provider credentials."
  },
  {
    area: "Publishing operators",
    review:
      "Confirm publishing users are allowed to approve, schedule, retry, cancel, or execute publishing jobs."
  },
  {
    area: "Support access",
    review:
      "Confirm support access is scoped, temporary when possible, auditable, and limited to customer support needs."
  }
];

const reviewCadence = [
  "Run access review before enterprise launch.",
  "Run access review after owner or admin changes.",
  "Run access review after security incidents.",
  "Run access review before large customer data exports.",
  "Run access review at least quarterly for enterprise tenants."
];

export default function AccessReviewPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16 text-slate-900">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          OmegaCrownAI Phase 82
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Enterprise Tenant Access Review
        </h1>
        <p className="mt-5 max-w-4xl text-base leading-7 text-slate-700">
          Access reviews help ensure enterprise users keep only the permissions
          required for their role. Reviews should focus on owners, admins,
          billing users, provider managers, publishing operators, and support
          access.
        </p>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2">
        {reviewAreas.map((item) => (
          <article
            key={item.area}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold">{item.area}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">{item.review}</p>
          </article>
        ))}
      </section>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-semibold">Review cadence</h2>
        <ul className="mt-5 list-disc space-y-3 pl-5 text-sm leading-6 text-slate-700">
          {reviewCadence.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
