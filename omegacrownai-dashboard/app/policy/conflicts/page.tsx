import {
  detectPolicyConflicts,
  samplePolicies
} from "@/lib/global-policy-engine/global-policy-engine";

const conflicts = detectPolicyConflicts(samplePolicies);

export default function PolicyConflictsPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16 text-slate-900">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          OmegaCrownAI Phase 85
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Policy Conflict Resolution
        </h1>
        <p className="mt-5 max-w-4xl text-base leading-7 text-slate-700">
          Conflict resolution keeps OmegaCrownAI fail-safe when legal, regional,
          organization, project, and agent policies overlap. Higher priority wins;
          if tied, more specific scope wins; if still tied, deny wins.
        </p>
      </section>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-semibold">Detected conflicts</h2>
        {conflicts.length === 0 ? (
          <p className="mt-4 text-sm leading-6 text-slate-700">
            No conflicts detected in the foundation policy registry.
          </p>
        ) : (
          <div className="mt-5 grid gap-5">
            {conflicts.map((conflict) => (
              <article
                key={conflict.id}
                className="rounded-2xl border border-slate-200 p-5"
              >
                <h3 className="font-semibold">{conflict.id}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {conflict.reason}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {conflict.resolution}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
