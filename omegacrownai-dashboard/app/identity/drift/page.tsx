import {
  checkDrift,
  sampleAgentProfile,
  signAgentIdentity
} from "@/lib/identity-kernel/sovereign-identity-kernel";

const signature = signAgentIdentity(sampleAgentProfile);
const cleanCheck = checkDrift({
  agentId: sampleAgentProfile.agentId,
  baselineFingerprint: signature.behavioralFingerprint,
  currentFingerprint: signature.behavioralFingerprint
});
const driftCheck = checkDrift({
  agentId: sampleAgentProfile.agentId,
  baselineFingerprint: signature.behavioralFingerprint,
  currentFingerprint: `${signature.behavioralFingerprint}_changed`
});

export default function IdentityDriftPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16 text-slate-900">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          OmegaCrownAI Phase 84
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Identity Drift Detection
        </h1>
        <p className="mt-5 max-w-4xl text-base leading-7 text-slate-700">
          Drift detection compares a baseline behavioral fingerprint against the
          current fingerprint. Any mismatch becomes a high-priority identity
          review event before enterprise-sensitive execution.
        </p>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2">
        {[cleanCheck, driftCheck].map((item) => (
          <article
            key={`${item.agentId}-${item.currentFingerprint}`}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold">
              {item.driftDetected ? "Drift detected" : "No drift"}
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              Severity: {item.severity}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              {item.recommendedAction}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}
