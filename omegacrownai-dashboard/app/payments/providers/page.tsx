import { getPaymentProviderSummary } from "@/lib/payment-provider-cleanup/payment-provider-policy";

const summary = getPaymentProviderSummary();

export default function PaymentProvidersPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16 text-slate-900">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          OmegaCrownAI Phase 99
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Payment Provider Status
        </h1>
        <p className="mt-5 max-w-4xl text-base leading-7 text-slate-700">
          {summary.customerMessage}
        </p>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2">
        {summary.allProviders.map((provider) => (
          <article
            key={provider.provider}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">{provider.label}</h2>
              <span className="rounded-full border border-slate-300 px-3 py-1 text-xs font-bold uppercase tracking-wide">
                {provider.status}
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-700">
              {provider.description}
            </p>
            <p className="mt-4 text-sm font-semibold leading-6 text-slate-700">
              Customer action: {provider.customerAction}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}
