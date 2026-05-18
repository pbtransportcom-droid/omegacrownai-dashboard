import { getAuditReviewUiPage } from "@/lib/sovereign/audit-review-ui-page";

export default function AuditReviewPage() {
  const page = getAuditReviewUiPage();

  const riskStyles: Record<string, string> = {
    low: "border-emerald-400/30 bg-emerald-500/10 text-emerald-100",
    medium: "border-yellow-400/30 bg-yellow-500/10 text-yellow-100",
    high: "border-orange-400/30 bg-orange-500/10 text-orange-100",
    blocked_by_default: "border-red-400/30 bg-red-500/10 text-red-100",
  };

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <section className="mx-auto max-w-7xl">
        <div className="rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/15 via-slate-950 to-purple-500/10 p-8 shadow-2xl shadow-cyan-950/20">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-300">
            Sovereign Audit Review
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">
            OmegaCrownAI Audit Review Center
          </h1>
          <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-300">
            Review redacted audit events, filter by risk and status, inspect safe evidence,
            follow correlation replay links, and prepare enterprise-ready audit exports.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-700 bg-black/30 p-5">
              <p className="text-xs font-black uppercase text-slate-400">Page status</p>
              <p className="mt-2 text-xl font-black text-cyan-100">{page.status}</p>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-black/30 p-5">
              <p className="text-xs font-black uppercase text-slate-400">Filters</p>
              <p className="mt-2 text-xl font-black text-white">{page.filters.length}</p>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-black/30 p-5">
              <p className="text-xs font-black uppercase text-slate-400">Sample cards</p>
              <p className="mt-2 text-xl font-black text-white">{page.sampleCards.length}</p>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-black/30 p-5">
              <p className="text-xs font-black uppercase text-slate-400">Redaction</p>
              <p className="mt-2 text-xl font-black text-emerald-100">Required</p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="rounded-3xl border border-slate-700 bg-slate-900/70 p-6">
            <h2 className="text-xl font-black">Filter audit events</h2>
            <p className="mt-2 text-xs leading-6 text-slate-400">
              Blueprint filters for the persistent audit query API.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {page.filters.map((filter) => (
                <span
                  key={filter}
                  className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-100"
                >
                  {filter}
                </span>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4">
              <p className="text-sm font-black text-emerald-100">No-secret display</p>
              <ul className="mt-3 space-y-2 text-xs leading-5 text-emerald-50">
                {page.noSecretDisplayRules.slice(0, 6).map((rule) => (
                  <li key={rule}>• {rule}</li>
                ))}
              </ul>
            </div>

            <div className="mt-6 space-y-2">
              {page.apiLinks.map((href) => (
                <a
                  key={href}
                  href={href}
                  className="block rounded-xl border border-slate-700 bg-black/30 px-4 py-3 text-xs font-black text-slate-200 hover:border-cyan-400/40 hover:text-cyan-100"
                >
                  {href}
                </a>
              ))}
            </div>
          </aside>

          <section className="space-y-5">
            {page.sampleCards.map((card) => (
              <article
                key={card.auditId}
                className="rounded-3xl border border-slate-700 bg-slate-900/70 p-6 shadow-xl shadow-black/20"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">
                      {card.eventType}
                    </p>
                    <h2 className="mt-2 text-2xl font-black">{card.title}</h2>
                    <p className="mt-2 text-sm text-slate-400">
                      {card.actor} · {card.role} · {card.source}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-black ${
                        riskStyles[card.riskLevel] || "border-slate-600 bg-slate-800 text-slate-100"
                      }`}
                    >
                      {card.riskLevel}
                    </span>
                    <span className="rounded-full border border-purple-400/30 bg-purple-500/10 px-3 py-1 text-xs font-black text-purple-100">
                      {card.decision}
                    </span>
                    <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-black text-emerald-100">
                      redacted
                    </span>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  <div className="rounded-2xl border border-slate-700 bg-black/30 p-4">
                    <p className="text-xs font-black uppercase text-slate-500">Status</p>
                    <p className="mt-1 text-sm font-bold text-white">{card.status}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-700 bg-black/30 p-4">
                    <p className="text-xs font-black uppercase text-slate-500">Evidence</p>
                    <p className="mt-1 text-sm font-bold text-white">{card.evidenceCount} safe items</p>
                  </div>
                  <div className="rounded-2xl border border-slate-700 bg-black/30 p-4">
                    <p className="text-xs font-black uppercase text-slate-500">Created</p>
                    <p className="mt-1 text-sm font-bold text-white">{card.createdAt}</p>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-4">
                  <p className="text-xs font-black uppercase text-cyan-200">Correlation replay</p>
                  <p className="mt-2 text-sm font-bold text-cyan-50">{card.correlationId}</p>
                  <p className="mt-2 text-xs leading-5 text-cyan-100/80">
                    Future implementation links this card into the correlation replay page.
                  </p>
                </div>
              </article>
            ))}
          </section>
        </div>
      </section>
    </main>
  );
}
