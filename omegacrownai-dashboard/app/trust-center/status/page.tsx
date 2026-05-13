import { buildTrustCenterPackage } from "@/lib/trust-center/final-production-trust-center";

const trustCenter = buildTrustCenterPackage();

export default function TrustCenterStatusPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16 text-slate-900">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          OmegaCrownAI Phase 97
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Trust Center Status
        </h1>
        <p className="mt-5 max-w-4xl text-base leading-7 text-slate-700">
          Trust Center status summarizes the public readiness of compliance,
          release, launch validation, platform limitation, and security signals.
        </p>
      </section>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
          Public status
        </p>
        <h2 className="mt-3 text-4xl font-bold">{trustCenter.publicStatus}</h2>
        <p className="mt-5 break-all text-xs leading-6 text-slate-500">
          {trustCenter.trustHash}
        </p>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2">
        {Object.entries(trustCenter.signals).map(([key, value]) => (
          <article
            key={key}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold">{key}</h2>
            <p className="mt-3 break-all text-sm leading-6 text-slate-700">
              {value}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}
