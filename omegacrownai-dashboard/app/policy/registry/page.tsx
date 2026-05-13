import { samplePolicies } from "@/lib/global-policy-engine/global-policy-engine";

export default function PolicyRegistryPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-16 text-slate-900">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          OmegaCrownAI Phase 85
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Policy Registry
        </h1>
        <p className="mt-5 max-w-4xl text-base leading-7 text-slate-700">
          The policy registry stores enabled, versioned policy definitions across
          global, region, organization, project, and agent scopes. Later phases
          can replace this foundation registry with persistent policy storage.
        </p>
      </section>

      <section className="mt-8 grid gap-5">
        {samplePolicies.map((policy) => (
          <article
            key={policy.id}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">{policy.name}</h2>
                <p className="mt-2 text-xs text-slate-500">{policy.id}</p>
              </div>
              <span className="rounded-full border border-slate-300 px-3 py-1 text-xs font-bold uppercase tracking-wide">
                {policy.effect}
              </span>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-4">
              <p className="rounded-2xl border border-slate-200 p-4 text-sm">
                Scope: {policy.scope}
              </p>
              <p className="rounded-2xl border border-slate-200 p-4 text-sm">
                Action: {policy.actionType}
              </p>
              <p className="rounded-2xl border border-slate-200 p-4 text-sm">
                Priority: {policy.priority}
              </p>
              <p className="rounded-2xl border border-slate-200 p-4 text-sm">
                Version: {policy.version}
              </p>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-700">
              {policy.reason}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}
