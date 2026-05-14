import {
  buildCustomerFacingCopyPackage,
  customerFacingCopyControls
} from "@/lib/customer-facing-polish/customer-facing-copy";

const copy = buildCustomerFacingCopyPackage();

export default function CustomerFacingPolishPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-16 text-slate-900">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          OmegaCrownAI Phase 104
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Customer-Facing Copy Alignment
        </h1>
        <p className="mt-5 max-w-4xl text-base leading-7 text-slate-700">
          {copy.primaryPublicMessage}
        </p>
        <p className="mt-5 break-all text-xs leading-6 text-slate-500">
          Copy hash: {copy.copyHash}
        </p>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Status
          </p>
          <p className="mt-2 text-2xl font-semibold">{copy.status}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Launch
          </p>
          <p className="mt-2 text-2xl font-semibold">{copy.signals.launchStatus}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Payment
          </p>
          <p className="mt-2 text-2xl font-semibold">{copy.signals.paymentStatus}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Stripe
          </p>
          <p className="mt-2 text-2xl font-semibold">{copy.signals.stripeStatus}</p>
        </div>
      </section>

      <section className="mt-8 grid gap-5">
        {copy.customerCopy.map((item) => (
          <article
            key={item.id}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
              {item.surface} · {item.requiredTone}
            </p>
            <h2 className="mt-2 text-xl font-semibold">{item.headline}</h2>
            <p className="mt-4 text-sm leading-6 text-slate-700">{item.message}</p>
          </article>
        ))}
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Required disclosures</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
            {copy.requiredDisclosures.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Navigation priorities</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
            {copy.navigationPriorities.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2">
        {customerFacingCopyControls.map((item) => (
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
