import Link from "next/link";
import { OmegaLogo } from "@/components/brand/OmegaLogo";
import { getExecutiveHistory } from "@/lib/sugent/executive/scheduler";

export default async function ExecutiveHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getExecutiveHistory(id);

  return (
    <main className="space-y-6">
      <div className="flex justify-center">
        <OmegaLogo className="h-16 w-auto object-contain" />
      </div>

      <section className="rounded-3xl border border-border bg-panel/70 p-6">
        <Link href={`/projects/${id}/company/executive`} className="text-sm text-cyan-300 hover:underline">
          ← Back to Executive Command Center
        </Link>

        <p className="mt-5 text-xs uppercase tracking-[0.25em] text-yellow-300">
          Executive Automation History
        </p>

        <h1 className="mt-3 text-4xl font-black text-white">
          Daily Reports + Executive Loop History
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
          Review scheduled executive health reports, CEO loop runs, schedule status, and saved executive decisions.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <Metric label="Schedules" value={String(data.summary.schedules)} />
        <Metric label="Active" value={String(data.summary.activeSchedules)} />
        <Metric label="Logs" value={String(data.summary.logs)} />
        <Metric label="Success" value={String(data.summary.successfulRuns)} />
        <Metric label="Reports" value={String(data.summary.dailyReports)} />
        <Metric label="Loops" value={String(data.summary.executiveLoops)} />
      </section>

      <section className="rounded-3xl border border-border bg-panel/70 p-5">
        <h2 className="text-xl font-black text-white">Schedules</h2>
        <pre className="mt-4 max-h-80 overflow-auto rounded-xl border border-border bg-slate-950 p-4 text-xs text-slate-200">
          {JSON.stringify(data.schedules, null, 2)}
        </pre>
      </section>

      <section className="rounded-3xl border border-border bg-panel/70 p-5">
        <h2 className="text-xl font-black text-white">Run Logs</h2>

        <div className="mt-4 space-y-3">
          {data.logs.length ? (
            data.logs.map((log: any) => (
              <div key={log.id} className="rounded-2xl border border-border bg-black/20 p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="text-sm font-bold text-white">
                      {log.type} · {log.status}
                    </div>
                    <div className="mt-1 text-xs text-muted">
                      {new Date(log.createdAt).toLocaleString()}
                    </div>
                    {log.error && (
                      <div className="mt-2 text-xs text-rose-300">
                        {log.error}
                      </div>
                    )}
                  </div>

                  <div className="font-mono text-xs text-muted">{log.id}</div>
                </div>

                <pre className="mt-3 max-h-80 overflow-auto rounded-xl border border-border bg-slate-950 p-3 text-xs text-slate-200">
                  {JSON.stringify(log.report || log.summary || {}, null, 2)}
                </pre>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-border bg-black/20 p-4 text-sm text-muted">
              No executive run logs yet.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-black/20 p-4">
      <div className="text-xs uppercase tracking-[0.18em] text-muted">{label}</div>
      <div className="mt-2 truncate text-xl font-black text-white">{value}</div>
    </div>
  );
}
