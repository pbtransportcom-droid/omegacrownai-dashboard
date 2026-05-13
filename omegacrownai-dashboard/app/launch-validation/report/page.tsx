import { buildLaunchValidationReport } from "@/lib/launch-validation/production-launch-validation";

const report = buildLaunchValidationReport();

export default function LaunchValidationReportPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-16 text-slate-900">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          OmegaCrownAI Phase 95
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Launch Validation Report
        </h1>
        <p className="mt-5 max-w-4xl text-base leading-7 text-slate-700">
          The launch validation report packages smoke checks, go/no-go decision,
          release hash, validation hash, and post-launch watchlist for production
          deployment validation.
        </p>
        <p className="mt-5 break-all text-xs leading-6 text-slate-500">
          Validation hash: {report.validationHash}
        </p>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Decision
          </p>
          <p className="mt-2 text-2xl font-semibold">{report.goNoGo.decision}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Checks
          </p>
          <p className="mt-2 text-3xl font-semibold">{report.smokeChecks.length}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Blockers
          </p>
          <p className="mt-2 text-3xl font-semibold">{report.goNoGo.blockers.length}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Warnings
          </p>
          <p className="mt-2 text-3xl font-semibold">{report.goNoGo.warnings.length}</p>
        </div>
      </section>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-semibold">Post-launch watchlist</h2>
        <ul className="mt-5 list-disc space-y-3 pl-5 text-sm leading-6 text-slate-700">
          {report.postLaunchWatchlist.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
