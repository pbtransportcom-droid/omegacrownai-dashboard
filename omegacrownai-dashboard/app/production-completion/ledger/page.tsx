import {
  buildProductionCompletionLedger,
  productionCompletionControls
} from "@/lib/production-completion/production-completion-ledger";

const ledger = buildProductionCompletionLedger();

export default function ProductionCompletionLedgerPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-16 text-slate-900">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          OmegaCrownAI Phase 100
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Production Completion Ledger
        </h1>
        <p className="mt-5 max-w-4xl text-base leading-7 text-slate-700">
          This ledger records OmegaCrownAI production completion status,
          completed production phases, public trust surfaces, payment-provider
          status, launch validation, release readiness, and final activation
          evidence.
        </p>
        <p className="mt-5 break-all text-xs leading-6 text-slate-500">
          Completion hash: {ledger.completionHash}
        </p>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Status
          </p>
          <p className="mt-2 text-2xl font-semibold">{ledger.productionStatus}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Phases
          </p>
          <p className="mt-2 text-3xl font-semibold">{ledger.completedPhases.length}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Surfaces
          </p>
          <p className="mt-2 text-3xl font-semibold">{ledger.productionSurfaces.length}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Activation
          </p>
          <p className="mt-2 text-2xl font-semibold">
            {ledger.finalActivation.activationMode}
          </p>
        </div>
      </section>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-semibold">Final activation summary</h2>
        <p className="mt-4 text-sm leading-6 text-slate-700">
          {ledger.finalActivation.summary}
        </p>
        <p className="mt-4 text-sm leading-6 text-slate-700">
          Payment path: {ledger.finalActivation.paymentPath}
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-700">
          Latest commit: {ledger.latestKnownCommit}
        </p>
      </section>

      <section className="mt-8 grid gap-5">
        {ledger.completedPhases.map((phase) => (
          <article
            key={phase.phase}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                  {phase.phase}
                </p>
                <h2 className="mt-2 text-xl font-semibold">{phase.title}</h2>
              </div>
              <span className="rounded-full border border-slate-300 px-3 py-1 text-xs font-bold uppercase tracking-wide">
                {phase.status}
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-700">
              {phase.evidence}
            </p>
            {phase.commit ? (
              <p className="mt-3 font-mono text-xs text-slate-500">
                Commit: {phase.commit}
              </p>
            ) : null}
          </article>
        ))}
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2">
        {productionCompletionControls.map((item) => (
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
