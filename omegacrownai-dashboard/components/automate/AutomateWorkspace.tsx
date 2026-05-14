"use client";

import { useEffect, useState } from "react";

type AutomationWorkflowNode = {
  id: string;
  type: "trigger" | "action" | "condition" | "output";
  label: string;
  description: string;
};

type AutomationWorkflowView = {
  id: string;
  name: string;
  status: "live_data" | "demo_fallback" | "empty" | "error";
  source: "database" | "demo";
  nodes: AutomationWorkflowNode[];
  notes: string[];
};

export function AutomateWorkspace() {
  const [workflow, setWorkflow] = useState<AutomationWorkflowView | null>(null);
  const [loading, setLoading] = useState(true);
  const [demoAllowed, setDemoAllowed] = useState(true);

  async function loadWorkflow(nextDemoAllowed = demoAllowed) {
    setLoading(true);

    try {
      const response = await fetch(
        `/api/automation/workflows?demo=${nextDemoAllowed ? "true" : "false"}`,
        {
          cache: "no-store"
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to load automation workflow.");
      }

      setWorkflow(data.workflow);
    } catch (error: any) {
      setWorkflow({
        id: "automation_client_error",
        name: "Automation workflow unavailable",
        status: "error",
        source: "database",
        nodes: [],
        notes: [error?.message || "Failed to load automation workflow."]
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWorkflow(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statusLabel =
    workflow?.status === "live_data"
      ? "Live database workflow"
      : workflow?.status === "demo_fallback"
        ? "Demo fallback"
        : workflow?.status === "empty"
          ? "No workflow found"
          : workflow?.status === "error"
            ? "Error"
            : "Loading";

  return (
    <section className="mx-auto max-w-6xl space-y-6 p-6 text-white">
      <div className="rounded-3xl border border-cyan-400/30 bg-cyan-500/10 p-6">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
          v8.6 Phase 106
        </p>
        <h1 className="mt-3 text-4xl font-black">Automation Workflow Builder</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-200">
          Automation now loads from the backend workflow API. If no saved
          workflow exists, demo fallback is clearly labeled and should not be
          treated as production execution proof.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            onClick={() => loadWorkflow(demoAllowed)}
            disabled={loading}
            className="rounded-xl bg-cyan-600 px-5 py-3 text-sm font-black text-white hover:bg-cyan-500 disabled:opacity-60"
          >
            {loading ? "Loading..." : "Reload Workflow"}
          </button>

          <button
            onClick={() => {
              const next = !demoAllowed;
              setDemoAllowed(next);
              loadWorkflow(next);
            }}
            disabled={loading}
            className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-5 py-3 text-sm font-black text-cyan-100 hover:bg-cyan-500/20 disabled:opacity-60"
          >
            Demo fallback: {demoAllowed ? "on" : "off"}
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-panel/70 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-muted">
              {workflow?.source || "loading"} · {workflow?.status || "loading"}
            </p>
            <h2 className="mt-2 text-2xl font-black text-white">
              {workflow?.name || "Loading automation workflow"}
            </h2>
          </div>
          <span className="rounded-full border border-cyan-400/30 px-3 py-1 text-xs font-black uppercase tracking-wide text-cyan-100">
            {statusLabel}
          </span>
        </div>

        {workflow?.status === "demo_fallback" ? (
          <div className="mt-5 rounded-2xl border border-yellow-400/30 bg-yellow-500/10 p-4 text-sm leading-6 text-yellow-100">
            Demo fallback is active. This is sample workflow data only.
          </div>
        ) : null}

        {workflow?.status === "empty" ? (
          <div className="mt-5 rounded-2xl border border-slate-400/30 bg-slate-500/10 p-4 text-sm leading-6 text-slate-200">
            No saved automation workflow found. Create a project automation build
            before claiming this feature is fully live.
          </div>
        ) : null}

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {(workflow?.nodes || []).map((node) => (
            <article
              key={node.id}
              className="rounded-2xl border border-border bg-black/20 p-5"
            >
              <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">
                {node.type}
              </p>
              <h3 className="mt-2 text-lg font-black text-white">{node.label}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                {node.description}
              </p>
            </article>
          ))}
        </div>

        {!workflow?.nodes?.length ? (
          <p className="mt-6 rounded-2xl border border-border bg-black/20 p-4 text-sm text-muted">
            No workflow nodes available.
          </p>
        ) : null}

        <div className="mt-6 rounded-2xl border border-border bg-slate-950 p-4">
          <h3 className="text-sm font-black text-white">Workflow notes</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-300">
            {(workflow?.notes || []).map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
