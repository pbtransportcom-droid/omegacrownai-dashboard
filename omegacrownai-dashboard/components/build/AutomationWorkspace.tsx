"use client";

import { useState } from "react";
import Link from "next/link";

export default function AutomationWorkspace({
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
          kind: "automation_flow_v1",
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

  function updateField(field: string, value: string) {
    saveDraft({
      ...currentDraft,
      [field]: value,
    });
  }

  function updateNodeTitle(nodeId: string, title: string) {
    saveDraft({
      ...currentDraft,
      nodes: (currentDraft.nodes || []).map((node: any) =>
        node.id === nodeId ? { ...node, title } : node
      ),
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
          No automation flow draft found.
        </div>
      </div>
    );
  }

  const nodes = Array.isArray(currentDraft.nodes) ? currentDraft.nodes : [];
  const edges = Array.isArray(currentDraft.edges) ? currentDraft.edges : [];

  return (
    <div className="grid min-h-[calc(100vh-120px)] gap-5 xl:grid-cols-[280px_1fr]">
      <aside className="rounded-2xl border border-border bg-panel/70 p-4">
        <Link href="/projects" className="text-xs text-cyan-300 hover:underline">
          ← Projects
        </Link>

        <h1 className="mt-4 text-lg font-bold text-white">{project.name}</h1>
        <p className="mt-1 text-xs text-muted">Sugent Automation Builder</p>

        <div className="mt-5 space-y-2">
          {builds.map((build) => (
            <Link
              key={build.id}
              href={`/build/automation/${project.id}?buildId=${build.id}`}
              className={`block rounded-xl border px-3 py-2 text-xs ${
                build.id === activeBuild.id
                  ? "border-violet-400/40 bg-violet-500/10 text-violet-100"
                  : "border-border bg-black/20 text-muted"
              }`}
            >
              <div className="font-semibold">{build.label}</div>
              <div className="mt-1">
                {build.status} · {build.domain || "automation"}
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
          <p className="text-xs uppercase tracking-[0.2em] text-violet-300">
            Automation Flow Draft
          </p>

          <input
            className="mt-3 w-full rounded-xl border border-border bg-slate-950 px-3 py-3 text-2xl font-black text-white outline-none focus:border-violet-400"
            value={currentDraft.name || ""}
            onChange={(event) => updateField("name", event.target.value)}
          />

          <p className="mt-3 text-sm text-muted">
            {currentDraft.description}
          </p>

          <p className="mt-3 text-xs text-amber-200">
            {currentDraft.safety?.notes || "Review before enabling automation."}
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          <Metric label="Version" value={currentDraft.version || "automation_flow_v1"} />
          <Metric label="Status" value={currentDraft.status || "draft"} />
          <Metric label="Trigger" value={currentDraft.trigger || "manual"} />
          <Metric label="Nodes" value={String(nodes.length)} />
        </section>

        <section className="rounded-2xl border border-border bg-panel/70 p-5">
          <h3 className="text-lg font-bold text-white">Automation Nodes</h3>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {nodes.map((node: any, index: number) => (
              <div key={node.id} className="rounded-xl border border-border bg-black/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="rounded-full bg-violet-500/15 px-3 py-1 text-xs font-bold text-violet-200">
                    {index + 1}. {node.type}
                  </div>
                  <div className="text-xs text-muted">{node.id}</div>
                </div>

                <input
                  className="mt-3 w-full rounded-xl border border-border bg-slate-950 px-3 py-2 text-sm font-bold text-white outline-none focus:border-violet-400"
                  value={node.title || ""}
                  onChange={(event) => updateNodeTitle(node.id, event.target.value)}
                />

                <pre className="mt-3 max-h-48 overflow-auto rounded-xl border border-border bg-slate-950 p-3 text-xs text-slate-200">
                  {JSON.stringify(node.config || {}, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-panel/70 p-5">
          <h3 className="text-lg font-bold text-white">Flow Connections</h3>

          <div className="mt-4 space-y-3">
            {edges.map((edge: any) => (
              <div key={edge.id} className="rounded-xl border border-border bg-black/20 p-4 text-sm text-white">
                <span className="font-bold text-violet-200">{edge.from}</span>
                <span className="mx-3 text-muted">→</span>
                <span className="font-bold text-violet-200">{edge.to}</span>
              </div>
            ))}
          </div>
        </section>
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
