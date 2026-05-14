import { buildFinalVerificationStatus } from "@/lib/final-route-audit/final-production-route-audit";

const status = buildFinalVerificationStatus();

export default function FinalVerificationStatusPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16 text-slate-900">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          OmegaCrownAI Phase 101
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Final Production Verification Status
        </h1>
        <p className="mt-5 max-w-4xl text-base leading-7 text-slate-700">
          This page records the final production verification status after
          completion ledger activation, payment-provider cleanup, public Trust
          Center deployment, and route audit preparation.
        </p>
        <p className="mt-5 break-all text-xs leading-6 text-slate-500">
          Verification hash: {status.verificationHash}
        </p>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Audit status</h2>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            {status.auditStatus}
          </p>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Production status</h2>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            {status.productionStatus}
          </p>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Payment status</h2>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            {status.paymentStatus}
          </p>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Stripe status</h2>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            {status.stripeStatus}
          </p>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Routes</h2>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            {status.routeCount}
          </p>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Latest commit</h2>
          <p className="mt-3 break-all font-mono text-xs leading-6 text-slate-700">
            {status.latestKnownCommit}
          </p>
        </article>
      </section>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-semibold">Final verification notes</h2>
        <ul className="mt-5 list-disc space-y-3 pl-5 text-sm leading-6 text-slate-700">
          {status.finalNotes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
