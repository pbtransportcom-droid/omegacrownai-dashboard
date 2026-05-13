import { runDebate } from "@/lib/multi-agent-spine/multi-agent-spine";

const messages = runDebate({
  prompt: "Debate the safest and highest-leverage OmegaCrownAI execution path."
});

export default function SpineDebatePage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16 text-slate-900">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          OmegaCrownAI Phase 86
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Multi-Agent Debate Engine
        </h1>
        <p className="mt-5 max-w-4xl text-base leading-7 text-slate-700">
          The debate engine lets department agents produce signed perspectives
          before critique, consensus, execution, and memory arbitration.
        </p>
      </section>

      <section className="mt-8 grid gap-5">
        {messages.map((message) => (
          <article
            key={message.id}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold">{message.agentRole}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              {message.content}
            </p>
            <p className="mt-4 break-all text-xs leading-6 text-slate-500">
              Signature: {message.identitySignature}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}
