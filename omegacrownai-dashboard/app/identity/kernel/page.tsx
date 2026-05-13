import {
  identityKernelControls,
  sampleAgentProfile,
  signAgentIdentity
} from "@/lib/identity-kernel/sovereign-identity-kernel";

const signature = signAgentIdentity(sampleAgentProfile);

export default function IdentityKernelPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16 text-slate-900">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          OmegaCrownAI Phase 84
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Sovereign Identity Kernel
        </h1>
        <p className="mt-5 max-w-4xl text-base leading-7 text-slate-700">
          The Sovereign Identity Kernel gives OmegaCrownAI deterministic agent
          identity signatures, behavioral fingerprints, ledger-ready execution
          records, drift checks, replay verification, and constitutional hook
          foundations for future policy enforcement.
        </p>
      </section>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-semibold">Sample identity signature</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Agent
            </p>
            <p className="mt-2 break-all text-sm text-slate-700">
              {signature.agentId}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Constitution
            </p>
            <p className="mt-2 break-all text-sm text-slate-700">
              {signature.constitutionVersion}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-4 md:col-span-2">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Identity signature
            </p>
            <p className="mt-2 break-all text-xs leading-6 text-slate-700">
              {signature.identitySignature}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2">
        {identityKernelControls.map((item) => (
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
