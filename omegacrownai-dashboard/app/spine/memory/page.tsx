import {
  arbitrateMemory,
  computeConsensus,
  runCritique,
  runDebate
} from "@/lib/multi-agent-spine/multi-agent-spine";

const messages = runDebate({
  prompt: "Decide what should be stored as organizational memory."
});
const critiques = runCritique(messages);
const consensus = computeConsensus({
  messages,
  critiques
});
const memoryWrites = arbitrateMemory({
  messages,
  consensus
});

export default function SpineMemoryPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16 text-slate-900">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          OmegaCrownAI Phase 86
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Memory Arbitration
        </h1>
        <p className="mt-5 max-w-4xl text-base leading-7 text-slate-700">
          Memory arbitration decides which debate outputs become approved
          consensus memory and which become supporting lessons.
        </p>
      </section>

      <section className="mt-8 grid gap-5">
        {memoryWrites.map((memory) => (
          <article
            key={memory.id}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">{memory.memoryType}</h2>
              <span className="rounded-full border border-slate-300 px-3 py-1 text-xs font-bold uppercase tracking-wide">
                {memory.approved ? "approved" : "lesson"}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              {memory.content}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}
