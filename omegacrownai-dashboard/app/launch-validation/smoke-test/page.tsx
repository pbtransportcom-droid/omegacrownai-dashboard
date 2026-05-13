import {
  buildSmokeChecks,
  launchValidationControls
} from "@/lib/launch-validation/production-launch-validation";

const smokeChecks = buildSmokeChecks();

export default function LaunchValidationSmokeTestPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-16 text-slate-900">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          OmegaCrownAI Phase 95
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Production Deployment Smoke Test
        </h1>
        <p className="mt-5 max-w-4xl text-base leading-7 text-slate-700">
          Phase 95 validates the production release candidate with a smoke test
          matrix for release, Project OS, legal, observability, identity, policy,
          spine, reliability, distribution, creative, executive, and marketplace
          routes.
        </p>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Checks
          </p>
          <p className="mt-2 text-3xl font-semibold">{smokeChecks.length}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Pass
          </p>
          <p className="mt-2 text-3xl font-semibold">
            {smokeChecks.filter((check) => check.status === "pass").length}
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Warnings
          </p>
          <p className="mt-2 text-3xl font-semibold">
            {smokeChecks.filter((check) => check.status === "warning").length}
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Fail
          </p>
          <p className="mt-2 text-3xl font-semibold">
            {smokeChecks.filter((check) => check.status === "fail").length}
          </p>
        </div>
      </section>

      <section className="mt-8 grid gap-5">
        {smokeChecks.map((check) => (
          <article
            key={check.id}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">{check.area}</h2>
              <span className="rounded-full border border-slate-300 px-3 py-1 text-xs font-bold uppercase tracking-wide">
                {check.status}
              </span>
            </div>
            <p className="mt-3 font-mono text-xs text-slate-500">
              {check.routeOrCheck}
            </p>
            <p className="mt-4 text-sm leading-6 text-slate-700">
              {check.evidence}
            </p>
          </article>
        ))}
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2">
        {launchValidationControls.map((item) => (
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
