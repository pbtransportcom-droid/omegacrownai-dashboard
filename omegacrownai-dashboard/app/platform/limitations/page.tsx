import {
  buildPlatformLimitationPackage,
  platformLimitationControls
} from "@/lib/platform-limitations/platform-limitation-controls";

const limitationPackage = buildPlatformLimitationPackage();

export default function PlatformLimitationsPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-16 text-slate-900">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          OmegaCrownAI Phase 96
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Platform Limitation Disclosure
        </h1>
        <p className="mt-5 max-w-4xl text-base leading-7 text-slate-700">
          {limitationPackage.customerFacingSummary}
        </p>
        <p className="mt-5 break-all text-xs leading-6 text-slate-500">
          Limitation package hash: {limitationPackage.packageHash}
        </p>
      </section>

      <section className="mt-8 grid gap-5">
        {limitationPackage.limitations.map((item) => (
          <article
            key={item.id}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">{item.title}</h2>
              <span className="rounded-full border border-slate-300 px-3 py-1 text-xs font-bold uppercase tracking-wide">
                {item.severity}
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-700">
              {item.disclosure}
            </p>
            <p className="mt-4 text-sm font-semibold leading-6 text-slate-700">
              Company protective action: {item.companyProtectiveAction}
            </p>
          </article>
        ))}
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2">
        {platformLimitationControls.map((item) => (
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
