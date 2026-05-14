import {
  finalProductionRouteAudit,
  finalVerificationControls
} from "@/lib/final-route-audit/final-production-route-audit";

const categories = Array.from(new Set(finalProductionRouteAudit.map((item) => item.category)));

export default function FinalVerificationRoutesPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-16 text-slate-900">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          OmegaCrownAI Phase 101
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Production Final Route Audit
        </h1>
        <p className="mt-5 max-w-4xl text-base leading-7 text-slate-700">
          This route audit lists the final public pages and APIs that should be
          checked after production activation, including Trust Center, completion
          ledger, payment providers, legal, platform limitations, launch
          validation, release readiness, compliance, and operations routes.
        </p>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Routes
          </p>
          <p className="mt-2 text-3xl font-semibold">{finalProductionRouteAudit.length}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Categories
          </p>
          <p className="mt-2 text-3xl font-semibold">{categories.length}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            APIs
          </p>
          <p className="mt-2 text-3xl font-semibold">
            {finalProductionRouteAudit.filter((route) => route.route.startsWith("/api/")).length}
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Pages
          </p>
          <p className="mt-2 text-3xl font-semibold">
            {finalProductionRouteAudit.filter((route) => !route.route.startsWith("/api/")).length}
          </p>
        </div>
      </section>

      {categories.map((category) => (
        <section key={category} className="mt-8">
          <h2 className="text-2xl font-semibold capitalize">{category}</h2>
          <div className="mt-5 grid gap-5">
            {finalProductionRouteAudit
              .filter((item) => item.category === category)
              .map((item) => (
                <article
                  key={item.id}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold">{item.id}</h3>
                      <p className="mt-2 font-mono text-xs text-slate-500">
                        {item.method} {item.route}
                      </p>
                    </div>
                    <span className="rounded-full border border-slate-300 px-3 py-1 text-xs font-bold uppercase tracking-wide">
                      {item.status}
                    </span>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-700">
                    {item.purpose}
                  </p>
                  <p className="mt-3 text-sm font-semibold text-slate-700">
                    Expected signal: {item.expectedSignal}
                  </p>
                </article>
              ))}
          </div>
        </section>
      ))}

      <section className="mt-8 grid gap-5 md:grid-cols-2">
        {finalVerificationControls.map((item) => (
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
