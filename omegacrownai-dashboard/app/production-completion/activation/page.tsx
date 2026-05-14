import { buildProductionCompletionLedger } from "@/lib/production-completion/production-completion-ledger";

const ledger = buildProductionCompletionLedger();

export default function ProductionActivationPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16 text-slate-900">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          OmegaCrownAI Phase 100
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Final Production Activation Record
        </h1>
        <p className="mt-5 max-w-4xl text-base leading-7 text-slate-700">
          This record marks OmegaCrownAI production completion and activation
          status after Trust Center launch, release readiness, payment-provider
          cleanup, legal/compliance finalization, and production validation.
        </p>
      </section>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
          Production status
        </p>
        <h2 className="mt-3 text-4xl font-bold">{ledger.productionStatus}</h2>
        <p className="mt-5 break-all text-xs leading-6 text-slate-500">
          {ledger.completionHash}
        </p>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Activation mode</h2>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            {ledger.finalActivation.activationMode}
          </p>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Activated</h2>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            {ledger.finalActivation.activated ? "yes" : "no"}
          </p>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Trust Center</h2>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            {ledger.finalActivation.trustCenterStatus}
          </p>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Launch decision</h2>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            {ledger.finalActivation.launchDecision}
          </p>
        </article>
      </section>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-semibold">Operational notes</h2>
        <ul className="mt-5 list-disc space-y-3 pl-5 text-sm leading-6 text-slate-700">
          {ledger.openOperationalNotes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
