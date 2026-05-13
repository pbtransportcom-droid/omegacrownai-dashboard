import { replayExecution } from "@/lib/identity-kernel/sovereign-identity-kernel";

const matchReplay = replayExecution({
  executionId: "exec_match",
  agentId: "omega_agent_foundation",
  originalOutput: {
    result: "stable"
  },
  replayOutput: {
    result: "stable"
  }
});

const mismatchReplay = replayExecution({
  executionId: "exec_mismatch",
  agentId: "omega_agent_foundation",
  originalOutput: {
    result: "stable"
  },
  replayOutput: {
    result: "changed"
  }
});

export default function IdentityReplayPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16 text-slate-900">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          OmegaCrownAI Phase 84
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Identity-Anchored Replay
        </h1>
        <p className="mt-5 max-w-4xl text-base leading-7 text-slate-700">
          Replay verification compares original and replay output hashes. A
          mismatch is treated as drift, non-determinism, or reliability evidence
          for future RCA workflows.
        </p>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2">
        {[matchReplay, mismatchReplay].map((item) => (
          <article
            key={item.executionId}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold">{item.executionId}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              Deterministic match: {String(item.deterministicMatch)}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-700">{item.detail}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
