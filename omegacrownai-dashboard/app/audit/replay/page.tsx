import { getCorrelationReplayUiPage } from "@/lib/sovereign/correlation-replay-ui-page";

export default function CorrelationReplayPage() {
  const page = getCorrelationReplayUiPage();
  const replay = page.sampleReplay;

  const riskStyles: Record<string, string> = {
    low: "border-emerald-400/30 bg-emerald-500/10 text-emerald-100",
    medium: "border-yellow-400/30 bg-yellow-500/10 text-yellow-100",
    high: "border-orange-400/30 bg-orange-500/10 text-orange-100",
    blocked_by_default: "border-red-400/30 bg-red-500/10 text-red-100",
  };

  const decisionStyles: Record<string, string> = {
    allow: "border-emerald-400/30 bg-emerald-500/10 text-emerald-100",
    approved: "border-emerald-400/30 bg-emerald-500/10 text-emerald-100",
    require_approval: "border-yellow-400/30 bg-yellow-500/10 text-yellow-100",
    block: "border-red-400/30 bg-red-500/10 text-red-100",
    denied: "border-red-400/30 bg-red-500/10 text-red-100",
  };

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <section className="mx-auto max-w-7xl">
        <div className="rounded-3xl border border-purple-400/20 bg-gradient-to-br from-purple-500/15 via-slate-950 to-cyan-500/10 p-8 shadow-2xl shadow-purple-950/20">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-purple-300">
            Correlation Replay
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">
            Workflow Replay Center
          </h1>
          <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-300">
            Trace one workflow by correlation ID. Review the event sequence, safe evidence chain,
            approval markers, recovery context, and redacted export path.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-700 bg-black/30 p-5">
              <p className="text-xs font-black uppercase text-slate-400">Correlation ID</p>
              <p className="mt-2 break-all text-sm font-black text-purple-100">
                {replay.correlationId}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-black/30 p-5">
              <p className="text-xs font-black uppercase text-slate-400">Status</p>
              <p className="mt-2 text-xl font-black text-white">{replay.status}</p>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-black/30 p-5">
              <p className="text-xs font-black uppercase text-slate-400">Events</p>
              <p className="mt-2 text-xl font-black text-white">{replay.events.length}</p>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-black/30 p-5">
              <p className="text-xs font-black uppercase text-slate-400">Redaction</p>
              <p className="mt-2 text-xl font-black text-emerald-100">Required</p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[340px_1fr]">
          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-700 bg-slate-900/70 p-6">
              <h2 className="text-xl font-black">Workflow summary</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                {replay.workflowName}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-black ${
                    riskStyles[replay.riskLevel] || "border-slate-600 bg-slate-800 text-slate-100"
                  }`}
                >
                  {replay.riskLevel}
                </span>
                <span className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-black text-cyan-100">
                  redacted replay
                </span>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-700 bg-slate-900/70 p-6">
              <h2 className="text-xl font-black">Replay controls</h2>
              <div className="mt-4 space-y-2">
                {page.apiLinks.map((href) => (
                  <a
                    key={href}
                    href={href}
                    className="block rounded-xl border border-slate-700 bg-black/30 px-4 py-3 text-xs font-black text-slate-200 hover:border-purple-400/40 hover:text-purple-100"
                  >
                    {href}
                  </a>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-emerald-400/20 bg-emerald-500/10 p-6">
              <h2 className="text-xl font-black text-emerald-100">No-secret replay</h2>
              <ul className="mt-4 space-y-2 text-xs leading-5 text-emerald-50">
                {page.noSecretReplayRules.slice(0, 6).map((rule) => (
                  <li key={rule}>• {rule}</li>
                ))}
              </ul>
            </div>
          </aside>

          <section className="space-y-5">
            {replay.events.map((event) => (
              <article
                key={event.auditId}
                className="rounded-3xl border border-slate-700 bg-slate-900/70 p-6 shadow-xl shadow-black/20"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">
                      Step {event.sequence} · {event.eventType}
                    </p>
                    <h2 className="mt-2 text-2xl font-black">{event.source}</h2>
                    <p className="mt-2 text-sm text-slate-400">
                      {event.actor} · {event.role} · {event.createdAt}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-black ${
                        riskStyles[event.riskLevel] || "border-slate-600 bg-slate-800 text-slate-100"
                      }`}
                    >
                      {event.riskLevel}
                    </span>
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-black ${
                        decisionStyles[event.decision] || "border-slate-600 bg-slate-800 text-slate-100"
                      }`}
                    >
                      {event.decision}
                    </span>
                    <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-black text-emerald-100">
                      redacted
                    </span>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  <div className="rounded-2xl border border-slate-700 bg-black/30 p-4">
                    <p className="text-xs font-black uppercase text-slate-500">Status</p>
                    <p className="mt-1 text-sm font-bold text-white">{event.status}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-700 bg-black/30 p-4">
                    <p className="text-xs font-black uppercase text-slate-500">Metadata ref</p>
                    <p className="mt-1 break-all text-sm font-bold text-white">{event.metadataRef}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-700 bg-black/30 p-4">
                    <p className="text-xs font-black uppercase text-slate-500">Audit ID</p>
                    <p className="mt-1 break-all text-sm font-bold text-white">{event.auditId}</p>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-4">
                  <p className="text-xs font-black uppercase text-cyan-200">Evidence chain</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {event.evidence.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-50"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}

            <div className="rounded-3xl border border-yellow-400/20 bg-yellow-500/10 p-6">
              <h2 className="text-2xl font-black text-yellow-100">Recovery / export path</h2>
              <p className="mt-3 text-sm leading-7 text-yellow-50">
                This replay package is redacted and export-ready. Future implementation will attach
                database-backed correlation results, rollback references, reviewer notes, and download packages.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {page.uiBadges.map((badge) => (
                  <span
                    key={badge}
                    className="rounded-full border border-yellow-400/20 bg-black/20 px-3 py-1 text-xs font-black text-yellow-50"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
