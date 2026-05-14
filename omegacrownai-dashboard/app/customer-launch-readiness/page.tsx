import Link from "next/link";
import {
  buildCustomerLaunchReadiness,
  customerLaunchReadinessControls
} from "@/lib/customer-launch-readiness/customer-launch-readiness";

const readiness = buildCustomerLaunchReadiness();
const groups = Array.from(new Set(readiness.primaryLinks.map((link) => link.group)));

export default function CustomerLaunchReadinessPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-16 text-slate-900">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          OmegaCrownAI Phase 102
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Final Customer Launch Readiness
        </h1>
        <p className="mt-5 max-w-4xl text-base leading-7 text-slate-700">
          {readiness.summary}
        </p>
        <p className="mt-5 break-all text-xs leading-6 text-slate-500">
          Readiness hash: {readiness.readinessHash}
        </p>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Launch status
          </p>
          <p className="mt-2 text-2xl font-semibold">{readiness.launchStatus}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Payment
          </p>
          <p className="mt-2 text-2xl font-semibold">{readiness.signals.paymentStatus}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Stripe
          </p>
          <p className="mt-2 text-2xl font-semibold">{readiness.signals.stripeStatus}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Audit routes
          </p>
          <p className="mt-2 text-3xl font-semibold">{readiness.signals.routeCount}</p>
        </div>
      </section>

      {groups.map((group) => (
        <section key={group} className="mt-8">
          <h2 className="text-2xl font-semibold capitalize">{group}</h2>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {readiness.primaryLinks
              .filter((link) => link.group === group)
              .map((link) => (
                <article
                  key={link.id}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <h3 className="text-xl font-semibold">{link.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-700">
                    {link.customerDescription}
                  </p>
                  <Link
                    href={link.route as any}
                    className="mt-5 inline-flex rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                  >
                    Open {link.title}
                  </Link>
                </article>
              ))}
          </div>
        </section>
      ))}

      <section className="mt-8 grid gap-5 md:grid-cols-2">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Customer checklist</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
            {readiness.customerChecklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Operational checklist</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
            {readiness.operationalChecklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2">
        {customerLaunchReadinessControls.map((item) => (
          <article
            key={item.area}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold">{item.area}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">{item.control}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
