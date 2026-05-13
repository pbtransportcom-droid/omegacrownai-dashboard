import {
  computeConsensus,
  runCritique,
  runDebate
} from "@/lib/multi-agent-spine/multi-agent-spine";

const messages = runDebate({
  prompt: "Choose the final governed execution path."
});
const critiques = runCritique(messages);
const consensus = computeConsensus({
  messages,
  critiques
});

export default function SpineConsensusPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16 text-slate-900">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          OmegaCrownAI Phase 86
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Consensus Engine
        </h1>
        <p className="mt-5 max-w-4xl text-base leading-7 text-slate-700">
          Consensus ranks agent contributions using deterministic debate scoring
          and critique scores, then selects the winning agent for execution
          planning.
        </p>
      </section>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-semibold">Winner</h2>
        <p className="mt-3 text-sm leading-6 text-slate-700">
          {consensus.winnerAgentId}
        </p>
        <p className="mt-3 text-sm leading-6 text-slate-700">
          Combined score: {consensus.combinedScore}
        </p>
      </section>

      <section className="mt-8 grid gap-5">
        {consensus.rankedAgents.map((agent) => (
          <article
            key={agent.agentId}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold">{agent.agentId}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              Score: {agent.score}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}
