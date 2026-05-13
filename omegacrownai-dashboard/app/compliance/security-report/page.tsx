import {
  complianceControlSummary,
  enterpriseSecurityReport
} from "@/lib/compliance/enterprise-compliance-evidence";

export default function SecurityReportPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16 text-slate-900">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          OmegaCrownAI Phase 83
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Enterprise Security Report
        </h1>
        <p className="mt-5 max-w-4xl text-base leading-7 text-slate-700">
          {enterpriseSecurityReport.executiveSummary}
        </p>

        <div className="mt-6 rounded-2xl border border-slate-200 p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Launch posture
          </p>
          <p className="mt-2 text-2xl font-semibold">
            {enterpriseSecurityReport.launchPosture}
          </p>
        </div>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2">
        {complianceControlSummary.map((item) => (
          <article
            key={item.control}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold">{item.control}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              {item.evidence}
            </p>
          </article>
        ))}
      </section>

      <section className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-amber-950">
          Conditional items
        </h2>
        <ul className="mt-5 list-disc space-y-3 pl-5 text-sm leading-6 text-amber-950">
          {enterpriseSecurityReport.conditionalItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
