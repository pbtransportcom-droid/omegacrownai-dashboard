"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const COMPANY_ID = "cmoyy1gl700004mkqn7or7hxr";
const PROJECT_ID = "cmoyekpqe00022dkq7s4jrokk";
const HOURS = Array.from({ length: 24 }, (_, index) => index);

export default function ObservabilityPage() {
  const [summary, setSummary] = useState<any>(null);
  const [heatmap, setHeatmap] = useState<any>(null);
  const [dlq, setDlq] = useState<any>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  async function load() {
    const [summaryRes, heatmapRes, dlqRes] = await Promise.all([
      fetch(`/api/observability/summary?companyId=${COMPANY_ID}`, { cache: "no-store" }),
      fetch(`/api/observability/heatmap?companyId=${COMPANY_ID}`, { cache: "no-store" }),
      fetch(`/api/observability/dlq?companyId=${COMPANY_ID}`, { cache: "no-store" }),
    ]);

    setSummary(await summaryRes.json());
    setHeatmap(await heatmapRes.json());
    setDlq(await dlqRes.json());
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!summary || !heatmap || !dlq) {
    return (
      <main className="min-h-screen bg-slate-950 p-6 text-white">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
          Loading observability...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen space-y-6 bg-slate-950 p-6 text-white">
      <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
        <Link
          href={`/projects/${PROJECT_ID}/company/executive`}
          className="text-sm text-cyan-300 hover:underline"
        >
          ← Back to Executive Command Center
        </Link>

        <p className="mt-5 text-xs uppercase tracking-[0.25em] text-emerald-300">
          Full Observability Dashboard · Phase 31
        </p>

        <h1 className="mt-3 text-4xl font-black">Observability Cockpit</h1>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
          Monitor jobs, dead-letter queues, metrics, traces, error kinds, and hourly system heat.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-4 xl:grid-cols-7">
        <Metric label="Jobs" value={String(summary.summary.totalJobs)} />
        <Metric label="Pending" value={String(summary.summary.pending)} />
        <Metric label="Running" value={String(summary.summary.running)} />
        <Metric label="Succeeded" value={String(summary.summary.succeeded)} />
        <Metric label="Failed" value={String(summary.summary.failed)} />
        <Metric label="Dead" value={String(summary.summary.dead)} />
        <Metric label="DLQ" value={String(summary.summary.deadLetters)} />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <JobsOverview summary={summary} onSelectJob={setSelectedJobId} />
        <HeatmapPanel heatmap={heatmap} />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <DLQPanel dlq={dlq} onSelectJob={setSelectedJobId} />
        <LogsPanel logs={summary.recentLogs || []} onSelectJob={setSelectedJobId} />
      </section>

      {selectedJobId && (
        <JobDetailDrawer
          jobId={selectedJobId}
          onClose={() => {
            setSelectedJobId(null);
            load();
          }}
        />
      )}
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
      <div className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</div>
      <div className="mt-2 truncate text-xl font-black text-white">{value}</div>
    </div>
  );
}

function JobsOverview({
  summary,
  onSelectJob,
}: {
  summary: any;
  onSelectJob: (id: string) => void;
}) {
  const types = Object.keys(summary.countsByTypeStatus || {});

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
      <h2 className="text-xl font-black">Jobs Overview</h2>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {types.length ? (
          types.map((type) => (
            <div key={type} className="rounded-2xl border border-slate-800 bg-black/20 p-4">
              <div className="text-sm font-black text-white">{type}</div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {["pending", "running", "succeeded", "failed", "dead"].map((status) => (
                  <span key={status} className="rounded-full bg-slate-800 px-2 py-1 text-slate-200">
                    {status}: {summary.countsByTypeStatus[type]?.[status] || 0}
                  </span>
                ))}
                {summary.deadByType?.[type] ? (
                  <span className="rounded-full bg-red-600 px-2 py-1 text-white">
                    DLQ: {summary.deadByType[type]}
                  </span>
                ) : null}
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-slate-800 bg-black/20 p-4 text-sm text-slate-400">
            No jobs yet.
          </div>
        )}
      </div>

      <h3 className="mt-5 text-sm font-black text-slate-200">Recent Jobs</h3>
      <div className="mt-3 max-h-80 space-y-2 overflow-auto">
        {(summary.recentJobs || []).map((job: any) => (
          <button
            key={job.id}
            onClick={() => onSelectJob(job.id)}
            className="w-full rounded-xl border border-slate-800 bg-black/20 p-3 text-left hover:bg-black/40"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="truncate text-sm font-bold text-white">{job.type}</span>
              <span className="rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-200">
                {job.status}
              </span>
            </div>
            <div className="mt-1 font-mono text-[11px] text-slate-500">{job.id}</div>
            {job.errorKind && (
              <div className="mt-2 rounded-lg bg-red-500/10 px-2 py-1 text-xs text-red-200">
                {job.errorKind}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function HeatmapPanel({ heatmap }: { heatmap: any }) {
  const types = Object.keys(heatmap.buckets || {});

  const max = useMemo(() => {
    const values = types.flatMap((type) =>
      Object.values(heatmap.buckets[type] || {}).map((value) => Number(value))
    );
    return Math.max(1, ...values);
  }, [heatmap, types]);

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
      <h2 className="text-xl font-black">Job Heatmap</h2>
      <p className="mt-1 text-sm text-slate-400">Last 24 hours by job type and hour.</p>

      <div className="mt-4 overflow-auto">
        <table className="min-w-full border-collapse text-xs">
          <thead>
            <tr>
              <th className="p-2 text-left text-slate-400">Type</th>
              {HOURS.map((hour) => (
                <th key={hour} className="p-1 text-center text-[10px] text-slate-500">
                  {hour}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {types.length ? (
              types.map((type) => (
                <tr key={type}>
                  <td className="max-w-[160px] truncate p-2 text-slate-200">{type}</td>
                  {HOURS.map((hour) => {
                    const count = Number(heatmap.buckets[type]?.[hour] || 0);
                    const opacity = count ? Math.max(0.2, count / max) : 0;

                    return (
                      <td key={hour} className="p-1">
                        <div
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-800 text-[10px]"
                          style={{
                            backgroundColor: count
                              ? `rgba(16, 185, 129, ${opacity})`
                              : "rgba(15, 23, 42, 0.8)",
                          }}
                        >
                          {count || ""}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td className="p-4 text-slate-400" colSpan={25}>
                  No jobs in the last 24 hours.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DLQPanel({
  dlq,
  onSelectJob,
}: {
  dlq: any;
  onSelectJob: (id: string) => void;
}) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
      <h2 className="text-xl font-black">Dead-Letter Queue</h2>

      <div className="mt-4 max-h-96 space-y-2 overflow-auto">
        {(dlq.deadLetters || []).length ? (
          dlq.deadLetters.map((job: any) => (
            <button
              key={job.id}
              onClick={() => onSelectJob(job.id)}
              className="w-full rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-left hover:bg-red-500/20"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="truncate text-sm font-bold text-white">{job.type}</span>
                <span className="rounded-full bg-red-600 px-2 py-1 text-xs text-white">
                  {job.errorKind || "UNKNOWN"}
                </span>
              </div>
              <div className="mt-1 font-mono text-[11px] text-slate-500">{job.id}</div>
              <p className="mt-2 line-clamp-2 text-xs text-red-100">{job.lastError}</p>
            </button>
          ))
        ) : (
          <div className="rounded-xl border border-slate-800 bg-black/20 p-4 text-sm text-slate-400">
            No dead-letter jobs.
          </div>
        )}
      </div>
    </div>
  );
}

function LogsPanel({
  logs,
  onSelectJob,
}: {
  logs: any[];
  onSelectJob: (id: string) => void;
}) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
      <h2 className="text-xl font-black">Recent Logs / Traces</h2>

      <div className="mt-4 max-h-96 space-y-2 overflow-auto">
        {logs.length ? (
          logs.map((log) => (
            <button
              key={log.id}
              onClick={() => onSelectJob(log.jobId)}
              className="w-full rounded-xl border border-slate-800 bg-black/20 p-3 text-left hover:bg-black/40"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-black uppercase text-slate-300">{log.type}</span>
                <span
                  className={`rounded-full px-2 py-1 text-xs ${
                    log.level === "error"
                      ? "bg-red-600 text-white"
                      : log.level === "warn"
                        ? "bg-yellow-600 text-white"
                        : "bg-slate-700 text-white"
                  }`}
                >
                  {log.level}
                </span>
              </div>
              <p className="mt-2 line-clamp-2 text-xs text-slate-300">{log.message}</p>
              <div className="mt-1 font-mono text-[11px] text-slate-500">{log.jobId}</div>
            </button>
          ))
        ) : (
          <div className="rounded-xl border border-slate-800 bg-black/20 p-4 text-sm text-slate-400">
            No logs yet.
          </div>
        )}
      </div>
    </div>
  );
}

function JobDetailDrawer({
  jobId,
  onClose,
}: {
  jobId: string;
  onClose: () => void;
}) {
  const [data, setData] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    const res = await fetch(`/api/observability/job/${jobId}`, { cache: "no-store" });
    setData(await res.json());
  }

  useEffect(() => {
    load();
  }, [jobId]);

  async function action(name: "requeue" | "resolve") {
    setBusy(true);
    await fetch(`/api/observability/job/${jobId}/${name}`, {
      method: "POST",
    });
    await load();
    setBusy(false);
  }

  const job = data?.job;
  const dead = data?.deadLetter;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50">
      <div className="h-full w-full max-w-xl overflow-auto border-l border-slate-800 bg-slate-950 p-5 text-white shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-black">Job Detail</h2>
            <p className="mt-1 font-mono text-xs text-slate-500">{jobId}</p>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl border border-slate-700 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-slate-800"
          >
            Close
          </button>
        </div>

        {!data ? (
          <div className="mt-6 text-sm text-slate-400">Loading...</div>
        ) : (
          <div className="mt-6 space-y-5">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
              <h3 className="text-sm font-black uppercase tracking-[0.16em] text-emerald-300">
                Metadata
              </h3>

              <div className="mt-3 space-y-2 text-xs">
                <Row label="Type" value={job?.type || dead?.type || "unknown"} />
                <Row label="Status" value={job?.status || "dead-letter"} />
                <Row label="Attempt" value={`${job?.attempt ?? dead?.attempt ?? 0}/${job?.maxAttempts ?? dead?.maxAttempts ?? 0}`} />
                <Row label="Error Kind" value={job?.errorKind || dead?.errorKind || "none"} />
                <Row label="Last Error" value={job?.lastError || dead?.lastError || "none"} />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
              <h3 className="text-sm font-black uppercase tracking-[0.16em] text-emerald-300">
                Payload
              </h3>
              <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap rounded-xl bg-black/30 p-3 text-xs text-slate-200">
                {JSON.stringify(job?.payload || dead?.payload || {}, null, 2)}
              </pre>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
              <h3 className="text-sm font-black uppercase tracking-[0.16em] text-emerald-300">
                Logs
              </h3>

              <div className="mt-3 space-y-2">
                {(job?.logs || []).length ? (
                  job.logs.map((log: any) => (
                    <div key={log.id} className="rounded-xl border border-slate-800 bg-black/20 p-3">
                      <div className="flex justify-between gap-3">
                        <span className="text-xs font-black uppercase text-white">{log.level}</span>
                        <span className="text-[11px] text-slate-500">
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-slate-300">{log.message}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-slate-400">No logs for this job.</div>
                )}
              </div>
            </div>

            <div className="grid gap-2 md:grid-cols-2">
              <button
                disabled={busy}
                onClick={() => action("requeue")}
                className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-black text-white hover:bg-blue-500 disabled:opacity-60"
              >
                Requeue
              </button>

              <button
                disabled={busy}
                onClick={() => action("resolve")}
                className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black text-white hover:bg-emerald-500 disabled:opacity-60"
              >
                Mark Resolved
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-800 pb-2">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-mono text-slate-200">{value}</span>
    </div>
  );
}
