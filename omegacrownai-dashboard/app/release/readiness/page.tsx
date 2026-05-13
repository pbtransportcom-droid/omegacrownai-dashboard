import {
  buildProductionReleasePackage,
  releaseReadinessControls
} from "@/lib/release-readiness/production-release-readiness";

const release = buildProductionReleasePackage();

export default function ReleaseReadinessPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-16 text-slate-900">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          OmegaCrownAI Phase 94
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Production Release Readiness
        </h1>
        <p className="mt-5 max-w-4xl text-base leading-7 text-slate-700">
          Phase 94 packages the completed OmegaCrownAI v6.3 through v7.1
          implementation arc into a production release candidate with release
          gates, release notes, deployment runbook, rollback checklist, and
          post-launch validation.
        </p>
        <p className="mt-5 break-all text-xs leading-6 text-slate-500">
          Release hash: {release.releaseHash}
        </p>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Status
          </p>
          <p className="mt-2 text-2xl font-semibold">{release.releaseStatus}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Gates
          </p>
          <p className="mt-2 text-3xl font-semibold">{release.gates.length}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Release notes
          </p>
          <p className="mt-2 text-3xl font-semibold">
            {release.releaseNotes.length}
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Runbook steps
          </p>
          <p className="mt-2 text-3xl font-semibold">
            {release.deploymentRunbook.length}
          </p>
        </div>
      </section>

      <section className="mt-8 grid gap-5">
        {release.gates.map((gate) => (
          <article
            key={gate.id}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">{gate.area}</h2>
              <span className="rounded-full border border-slate-300 px-3 py-1 text-xs font-bold uppercase tracking-wide">
                {gate.status}
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-700">
              {gate.evidence}
            </p>
            <p className="mt-4 text-sm font-semibold text-slate-700">
              Owner: {gate.owner}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              Action: {gate.actionRequired}
            </p>
          </article>
        ))}
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2">
        {releaseReadinessControls.map((item) => (
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
