"use client";

import { useState } from "react";
import Link from "next/link";

export default function TradingWorkspace({
  project,
  builds,
  activeBuild,
  draft,
}: {
  project: any;
  builds: any[];
  activeBuild: any;
  draft: any;
}) {
  const [currentDraft, setCurrentDraft] = useState(draft);
  const [saving, setSaving] = useState("");

  async function saveDraft(updated: any) {
    setCurrentDraft(updated);
    setSaving("Saving...");

    try {
      const res = await fetch(`/api/projects/${project.id}/builder`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          buildId: activeBuild.id,
          kind: "strategy_draft_v1",
          draft: updated,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Save failed.");
      }

      setSaving("Saved");
      setTimeout(() => setSaving(""), 1500);
    } catch (error: any) {
      setSaving(error?.message || "Save failed.");
    }
  }

  function updateSummary(field: string, value: string) {
    saveDraft({
      ...currentDraft,
      summary: {
        ...(currentDraft.summary || {}),
        [field]: field === "confidence" ? Number(value) : value,
      },
    });
  }

  if (!project) {
    return <div className="p-6 text-red-300">Project not found.</div>;
  }

  if (!currentDraft || !activeBuild) {
    return (
      <div className="space-y-4 p-6">
        <Link href="/projects" className="text-cyan-300 hover:underline">
          Back to projects
        </Link>
        <div className="rounded-xl border border-yellow-500/30 bg-yellow-950/30 p-6 text-yellow-100">
          No trading strategy draft found.
        </div>
      </div>
    );
  }

  const ranked = Array.isArray(currentDraft.ranked) ? currentDraft.ranked : [];
  const plan = currentDraft.tradePlan || {};
  const power = currentDraft.power || {};
  const summary = currentDraft.summary || {};

  return (
    <div className="grid min-h-[calc(100vh-120px)] gap-5 xl:grid-cols-[280px_1fr]">
      <aside className="rounded-2xl border border-border bg-panel/70 p-4">
        <Link href="/projects" className="text-xs text-cyan-300 hover:underline">
          ← Projects
        </Link>

        <h1 className="mt-4 text-lg font-bold text-white">{project.name}</h1>
        <p className="mt-1 text-xs text-muted">Sugent Trading Builder</p>

        <div className="mt-5 space-y-2">
          {builds.map((build) => (
            <Link
              key={build.id}
              href={`/build/trading/${project.id}?buildId=${build.id}`}
              className={`block rounded-xl border px-3 py-2 text-xs ${
                build.id === activeBuild.id
                  ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-100"
                  : "border-border bg-black/20 text-muted"
              }`}
            >
              <div className="font-semibold">{build.label}</div>
              <div className="mt-1">
                {build.status} · {build.domain || "trading"}
              </div>
            </Link>
          ))}
        </div>

        {saving && (
          <div className="mt-4 rounded-lg border border-border bg-black/20 px-3 py-2 text-xs text-muted">
            {saving}
          </div>
        )}
      </aside>

      <main className="space-y-5">
        <section className="rounded-2xl border border-border bg-panel/70 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">
            Strategy Draft
          </p>
          <h2 className="mt-2 text-3xl font-black text-white">
            {currentDraft.name}
          </h2>
          <p className="mt-2 text-sm text-muted">
            {currentDraft.marketType} · {currentDraft.timeframe} · {currentDraft.symbol}
          </p>
          <p className="mt-3 text-xs text-amber-200">
            {currentDraft.disclaimer}
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          <Metric label="Signal" value={summary.signal || "WATCH"} />
          <Metric label="Confidence" value={`${summary.confidence || 0}%`} />
          <Metric label="Risk" value={summary.risk || "medium"} />
          <Metric label="Pressure" value={power.pressure || "BALANCED"} />
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Metric label="Buy Power" value={`${power.buyPower || 0}%`} />
          <Metric label="Sell Power" value={`${power.sellPower || 0}%`} />
          <Metric label="Net Power" value={String(power.netPower ?? 0)} />
        </section>

        <section className="rounded-2xl border border-border bg-panel/70 p-5">
          <h3 className="text-lg font-bold text-white">Editable Summary</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <Field
              label="Signal"
              value={summary.signal || ""}
              onChange={(v: string) => updateSummary("signal", v)}
            />
            <Field
              label="Confidence"
              value={String(summary.confidence || 0)}
              onChange={(v: string) => updateSummary("confidence", v)}
            />
            <Field
              label="Risk"
              value={summary.risk || ""}
              onChange={(v: string) => updateSummary("risk", v)}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-panel/70 p-5">
          <h3 className="text-lg font-bold text-white">Trade Plan</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-5">
            <Metric label="Entry" value={(plan.entryZone || []).join(" - ") || "N/A"} />
            <Metric label="Stop" value={String(plan.stopLoss ?? "N/A")} />
            <Metric label="TP" value={(plan.takeProfit || []).join(" / ") || "N/A"} />
            <Metric label="Support" value={String(plan.support ?? "N/A")} />
            <Metric label="Resistance" value={String(plan.resistance ?? "N/A")} />
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-panel/70 p-5">
          <h3 className="text-lg font-bold text-white">Strategy Rules</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {(currentDraft.rules || []).map((rule: any) => (
              <div key={rule.id} className="rounded-xl border border-border bg-black/20 p-4">
                <div className="font-bold text-white">{rule.title}</div>
                <div className="mt-2 text-sm text-muted">{rule.condition}</div>
                <div className="mt-3 text-xs uppercase tracking-[0.18em] text-cyan-300">
                  {rule.action}
                </div>
              </div>
            ))}
          </div>
        </section>

        {ranked.length > 0 && (
          <section className="rounded-2xl border border-border bg-panel/70 p-5">
            <h3 className="text-lg font-bold text-white">Ranked Market Results</h3>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-[0.18em] text-muted">
                  <tr>
                    <th className="p-3">Rank</th>
                    <th className="p-3">Symbol</th>
                    <th className="p-3">Signal</th>
                    <th className="p-3">Confidence</th>
                    <th className="p-3">Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {ranked.slice(0, 20).map((item: any, index: number) => (
                    <tr key={`${item.symbol}-${index}`} className="border-t border-border">
                      <td className="p-3">{item.rank || index + 1}</td>
                      <td className="p-3 font-bold text-white">{item.symbol}</td>
                      <td className="p-3">{item.signal}</td>
                      <td className="p-3">{item.confidence}%</td>
                      <td className="p-3">{item.risk}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-black/20 p-4">
      <div className="text-xs uppercase tracking-[0.18em] text-muted">{label}</div>
      <div className="mt-2 text-xl font-black text-white">{value}</div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: any }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-muted">{label}</span>
      <input
        className="mt-1 w-full rounded-xl border border-border bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
