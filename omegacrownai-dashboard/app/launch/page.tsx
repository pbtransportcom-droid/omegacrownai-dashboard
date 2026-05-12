import { getLaunchReadinessDashboard } from "@/lib/sugent/launch-readiness/launchReadinessEngine";
import { OmegaLogo } from "@/components/brand/OmegaLogo";

export default async function LaunchReadinessPage() {
  const data = await getLaunchReadinessDashboard();
  const safeData = data as any;
  const checklist = safeData.checklist;

  return (
    <main className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex justify-center">
        <OmegaLogo className="h-16 w-auto object-contain" />
      </div>

      <section className="rounded-3xl border border-cyan-400/30 bg-cyan-500/10 p-6 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">
          v4.9 Production Launch Readiness
        </p>

        <h1 className="mt-3 text-4xl font-black text-white">
          OmegaCrownAI Launch Readiness
        </h1>

        <p className="mx-auto mt-3 max-w-3xl text-sm leading-7 text-slate-200">
          Final v4 commercialization checklist, smoke tests, legal placeholders, monitoring summary, and completion report.
        </p>

        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <a href="/api/launch/smoke" className="rounded-xl bg-cyan-600 px-5 py-3 text-sm font-black text-white hover:bg-cyan-500">
            Run Smoke API
          </a>
          <a href="/api/launch/report" className="rounded-xl bg-yellow-500 px-5 py-3 text-sm font-black text-black hover:bg-yellow-400">
            View v4 Report
          </a>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-6">
        <Metric label="Items" value={String(safeData.summary.items)} />
        <Metric label="Required" value={String(safeData.summary.required)} />
        <Metric label="Passed" value={String(safeData.summary.passed)} />
        <Metric label="Pending" value={String(safeData.summary.pending)} />
        <Metric label="Smoke" value={safeData.summary.smokeStatus} />
        <Metric label="Ready" value={String(safeData.summary.launchReady)} />
      </section>

      <section className="rounded-3xl border border-border bg-panel/70 p-5">
        <h2 className="text-xl font-black text-white">Production Smoke Summary</h2>
        <pre className="mt-4 max-h-96 overflow-auto rounded-xl border border-border bg-slate-950 p-4 text-xs text-slate-200">
          {JSON.stringify(safeData.smoke, null, 2)}
        </pre>
      </section>

      <section className="rounded-3xl border border-border bg-panel/70 p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-xl font-black text-white">{checklist?.name || "Launch Checklist"}</h2>

          {checklist?.id && (
            <form action={`/api/launch/checklist/${checklist.id}/sign`} method="POST">
              <button className="rounded-xl bg-yellow-500 px-4 py-2 text-xs font-black text-black hover:bg-yellow-400">
                Sign Checklist
              </button>
            </form>
          )}
        </div>

        <div className="mt-4 space-y-3">
          {(checklist?.items || []).map((item: any) => (
            <div key={item.id} className="rounded-2xl border border-border bg-black/20 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="text-sm font-black text-white">{item.title}</div>
                  <div className="mt-1 text-xs text-cyan-300">
                    {item.category} · {item.severity} · {item.status}
                  </div>
                  <div className="mt-1 font-mono text-[11px] text-muted">{item.id}</div>
                </div>

                <form action={`/api/launch/checklist/items/${item.id}`} method="POST" className="flex flex-wrap gap-2">
                  <select name="status" defaultValue={item.status} className="rounded-xl border border-border bg-slate-950 px-3 py-2 text-xs text-white outline-none">
                    <option value="pending">Pending</option>
                    <option value="passed">Passed</option>
                    <option value="failed">Failed</option>
                    <option value="waived">Waived</option>
                  </select>

                  <button className="rounded-xl bg-cyan-600 px-3 py-2 text-xs font-black text-white hover:bg-cyan-500">
                    Update
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-yellow-400/30 bg-yellow-500/10 p-5">
        <h2 className="text-xl font-black text-white">v4 Completion</h2>
        <pre className="mt-4 overflow-auto rounded-xl border border-yellow-400/20 bg-black/30 p-4 text-xs text-yellow-50">
          {JSON.stringify(safeData.v4Completion, null, 2)}
        </pre>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-panel/70 p-4">
      <div className="text-xs uppercase tracking-[0.18em] text-muted">{label}</div>
      <div className="mt-2 truncate text-2xl font-black text-white">{value}</div>
    </div>
  );
}
