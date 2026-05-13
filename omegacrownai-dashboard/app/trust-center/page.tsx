import {
  buildTrustCenterPackage,
  trustCenterControls
} from "@/lib/trust-center/final-production-trust-center";

const trustCenter = buildTrustCenterPackage();

export default function TrustCenterPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-16 text-slate-900">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          OmegaCrownAI Phase 97
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Production Public Trust Center
        </h1>
        <p className="mt-5 max-w-4xl text-base leading-7 text-slate-700">
          {trustCenter.summary}
        </p>
        <p className="mt-5 break-all text-xs leading-6 text-slate-500">
          Trust hash: {trustCenter.trustHash}
        </p>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-5">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Status
          </p>
          <p className="mt-2 text-2xl font-semibold">
            {trustCenter.publicStatus}
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Resources
          </p>
          <p className="mt-2 text-3xl font-semibold">
            {trustCenter.resources.length}
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Compliance
          </p>
          <p className="mt-2 text-2xl font-semibold">
            {trustCenter.signals.complianceStatus}
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Release
          </p>
          <p className="mt-2 text-2xl font-semibold">
            {trustCenter.signals.releaseStatus}
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Launch
          </p>
          <p className="mt-2 text-2xl font-semibold">
            {trustCenter.signals.launchDecision}
          </p>
        </div>
      </section>

      <section className="mt-8 grid gap-5">
        {trustCenter.resources.map((resource) => (
          <article
            key={resource.id}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                  {resource.category}
                </p>
                <h2 className="mt-2 text-xl font-semibold">{resource.title}</h2>
                <p className="mt-2 font-mono text-xs text-slate-500">
                  {resource.route}
                </p>
              </div>
              <span className="rounded-full border border-slate-300 px-3 py-1 text-xs font-bold uppercase tracking-wide">
                {resource.status}
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-700">
              {resource.summary}
            </p>
            <p className="mt-4 text-sm font-semibold text-slate-700">
              Owner: {resource.owner}
            </p>
          </article>
        ))}
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2">
        {trustCenterControls.map((item) => (
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
