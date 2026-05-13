import { replayTrace, sampleTrace } from "@/lib/reliability/reliability-engine";

const replay = replayTrace({ trace: sampleTrace });

export default function ReliabilityReplayPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16 text-slate-900">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">OmegaCrownAI Phase 87</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">Reliability Replay</h1>
        <p className="mt-5 max-w-4xl text-base leading-7 text-slate-700">
          Replay verifies deterministic behavior by comparing original and replay output hashes.
        </p>
      </section>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-semibold">Replay result</h2>
        <p className="mt-4 text-sm leading-6 text-slate-700">Execution: {replay.executionId}</p>
        <p className="mt-2 text-sm leading-6 text-slate-700">Match: {String(replay.match)}</p>
        <p className="mt-2 text-sm leading-6 text-slate-700">{replay.detail}</p>
      </section>
    </main>
  );
}
