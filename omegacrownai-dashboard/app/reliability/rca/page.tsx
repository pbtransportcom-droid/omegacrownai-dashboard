import { runRCA, sampleTrace } from "@/lib/reliability/reliability-engine";

const rca = runRCA(sampleTrace);

export default function ReliabilityRCAPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16 text-slate-900">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">OmegaCrownAI Phase 87</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">Root Cause Analysis</h1>
        <p className="mt-5 max-w-4xl text-base leading-7 text-slate-700">
          RCA classifies execution failures and recommends remediation for production incidents.
        </p>
      </section>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-semibold">{rca.rootCause}</h2>
        <p className="mt-4 text-sm leading-6 text-slate-700">Severity: {rca.severity}</p>
        <p className="mt-2 text-sm leading-6 text-slate-700">{rca.suggestedAction}</p>
      </section>
    </main>
  );
}
