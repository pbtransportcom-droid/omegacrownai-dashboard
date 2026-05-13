import {
  multiAgentSpineControls,
  runOrchestration
} from "@/lib/multi-agent-spine/multi-agent-spine";

const result = runOrchestration({
  prompt: "Coordinate the next OmegaCrownAI enterprise subsystem."
});

export default function SpineOrchestrationPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-16 text-slate-900">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          OmegaCrownAI Phase 86
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Multi-Agent Orchestration Spine
        </h1>
        <p className="mt-5 max-w-4xl text-base leading-7 text-slate-700">
          The orchestration spine coordinates department agents through debate,
          critique, deterministic consensus, governed execution planning, and
          memory arbitration. Every debate message is identity-signed and every
          execution plan is policy-aware.
        </p>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Debate messages
          </p>
          <p className="mt-2 text-3xl font-semibold">
            {result.debateMessages.length}
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Critiques
          </p>
          <p className="mt-2 text-3xl font-semibold">{result.critiques.length}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Policy
          </p>
          <p className="mt-2 text-3xl font-semibold">
            {result.executionPlan.policyDecision}
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Memory writes
          </p>
          <p className="mt-2 text-3xl font-semibold">
            {result.memoryWrites.length}
          </p>
        </div>
      </section>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-semibold">Consensus winner</h2>
        <p className="mt-4 text-sm leading-6 text-slate-700">
          {result.consensus.winnerAgentId}
        </p>
        <p className="mt-3 text-sm leading-6 text-slate-700">
          {result.consensus.reasoning}
        </p>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2">
        {multiAgentSpineControls.map((item) => (
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
