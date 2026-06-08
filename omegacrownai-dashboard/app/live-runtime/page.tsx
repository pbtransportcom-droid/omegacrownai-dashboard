"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

function LiveRuntimeInner() {
  const searchParams = useSearchParams();

  const projectId = searchParams.get("projectId") || "";
  const runtimeId = searchParams.get("runtimeId") || "";
  const intent = searchParams.get("intent") || "general";

  const [runtime, setRuntime] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!projectId) return;

    fetch(`/api/runtime-proxy/runs/${projectId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.ok) {
          setError(data.error || "Runtime not found.");
          return;
        }

        setRuntime(data);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load runtime data.");
      });
  }, [projectId]);

  const agents =
    runtime?.agentHandoffs ||
    runtime?.run?.agentHandoffs ||
    runtime?.run?.agents ||
    runtime?.agents ||
    [];
  const artifacts =
    runtime?.artifacts ||
    runtime?.run?.artifacts ||
    [];
  const events =
    runtime?.events ||
    runtime?.run?.events ||
    [];
  const transcript = runtime?.transcript || [];

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">
      <section className="mx-auto max-w-6xl">
        <p className="text-sm uppercase tracking-[0.3em] text-yellow-400">
          OmegaCrownAI Live Runtime
        </p>

        <h1 className="mt-4 text-4xl font-bold">
          Sovereign Runtime Execution
        </h1>

          {projectId && (
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={`/api/runtime-proxy/runs/${projectId}/download`}
                className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-black"
              >
                Download ZIP
              </a>

              <button
                onClick={() => deployRuntimeArtifact(projectId)}
                className="rounded-xl bg-red-400 px-5 py-3 text-sm font-bold text-black"
              >
                Deploy
              </button>

              <a
                href={`/deployed/${projectId}`}
                target="_blank"
                className="rounded-xl border border-emerald-500/60 bg-emerald-500/10 px-5 py-3 text-sm font-bold text-emerald-100"
              >
                Open Preview
              </a>

              <a
                href={`/runtime-deployments/${projectId}/index.html`}
                target="_blank"
                className="rounded-xl border border-cyan-500/60 bg-cyan-500/10 px-5 py-3 text-sm font-bold text-cyan-100"
              >
                Static HTML
              </a>

              <a
                href={`/projects/${projectId}/validation`}
                className="rounded-xl border border-yellow-500/60 bg-yellow-500/10 px-5 py-3 text-sm font-bold text-yellow-100"
              >
                View Validation
              </a>

              <a
                href={`/artifacts/${projectId}`}
                className="rounded-xl border border-purple-500/60 bg-purple-500/10 px-5 py-3 text-sm font-bold text-purple-100"
              >
                View Artifacts
              </a>
            </div>
          )}

        <p className="mt-3 text-white/70">
          Project: {projectId || "missing"} · Runtime: {runtimeId || "missing"} · Mode:{" "}
          {runtime?.mode || intent}
        </p>

        {runtime?.status === "completed" && (
          <div className="mt-8 rounded-3xl border border-emerald-400/30 bg-emerald-500/10 p-6 shadow-2xl shadow-emerald-500/10">
            <div className="text-xs font-black uppercase tracking-[0.3em] text-emerald-300">
              Delivery Ready
            </div>

            <h2 className="mt-3 text-3xl font-black text-white">
              Your {runtime?.mode || intent} project has been generated.
            </h2>

            <p className="mt-3 max-w-4xl text-sm leading-7 text-emerald-100/80">
              OmegaCrownAI completed the agent workflow, generated the project artifacts,
              prepared validation, deployed the preview, and packaged the export files.
              Use the buttons below to open the customer preview or download the full ZIP.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href={`/deployed/${projectId}`}
                target="_blank"
                className="rounded-xl bg-emerald-400 px-5 py-3 text-sm font-black text-black hover:bg-emerald-300"
              >
                Open Customer Preview
              </a>

              <a
                href={`/api/runtime-proxy/runs/${projectId}/download`}
                className="rounded-xl bg-white px-5 py-3 text-sm font-black text-black hover:bg-slate-200"
              >
                Download Full ZIP
              </a>

              <a
                href={`/artifacts/${projectId}`}
                className="rounded-xl border border-purple-400/50 bg-purple-500/10 px-5 py-3 text-sm font-black text-purple-100 hover:bg-purple-500/20"
              >
                Review Artifacts
              </a>

              <a
                href={`/projects/${projectId}/validation`}
                className="rounded-xl border border-yellow-400/50 bg-yellow-500/10 px-5 py-3 text-sm font-black text-yellow-100 hover:bg-yellow-500/20"
              >
                View Validation
              </a>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-red-200">
            {error}
          </div>
        )}

        {runtime?.status === "completed" && projectId && (
          <section className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black">Live Preview</h2>
                <p className="mt-1 text-sm text-white/60">
                  This is the generated customer-facing output.
                </p>
              </div>

              <a
                href={`/deployed/${projectId}`}
                target="_blank"
                className="rounded-xl border border-cyan-400/50 bg-cyan-500/10 px-4 py-2 text-sm font-black text-cyan-100 hover:bg-cyan-500/20"
              >
                Open Full Screen
              </a>
            </div>

            <iframe
              src={`/deployed/${projectId}`}
              className="h-[620px] w-full rounded-2xl border border-white/10 bg-white"
              title="Generated project preview"
            />
          </section>
        )}

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-3xl font-bold">{agents.length}</div>
            <div className="text-sm text-white/60">Agents</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-3xl font-bold">{events.length}</div>
            <div className="text-sm text-white/60">Runtime Events</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-3xl font-bold">{artifacts.length}</div>
            <div className="text-sm text-white/60">Artifacts</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-3xl font-bold">
              {runtime?.status || "loading"}
            </div>
            <div className="text-sm text-white/60">Status</div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">Agent Handoff Timeline</h2>

            <div className="mt-4 space-y-3">
              {agents.length ? (
                agents.map((agent: any, index: number) => (
                  <div key={index} className="rounded-xl border border-white/10 p-4">
                    <div className="font-semibold">{agent.name || `Agent ${index + 1}`}</div>
                    <div className="text-sm text-white/60">{agent.role}</div>
                    <p className="mt-2 text-sm text-white/80">{agent.output}</p>
                  </div>
                ))
              ) : (
                <p className="text-white/60">No agent handoffs loaded yet.</p>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">Runtime Events</h2>

            <div className="mt-4 space-y-3">
              {events.length ? (
                events.map((event: any, index: number) => (
                  <div key={index} className="rounded-xl border border-white/10 p-4">
                    <div className="text-xs uppercase text-yellow-300">
                      {event.agent || event.type || "runtime-event"}
                    </div>
                    <p className="mt-2 text-sm text-white/80">
                      {event.event || event.message || JSON.stringify(event)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-white/60">No runtime events loaded yet.</p>
              )}
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold">Delivery Summary</h2>

          <pre className="mt-4 overflow-auto rounded-xl bg-black/60 p-4 text-xs text-white/80">
            {JSON.stringify(
              {
                validation: runtime?.validation,
                delivery: runtime?.delivery,
                summary: runtime?.summary,
                artifacts,
                transcript,
              },
              null,
              2
            )}
          </pre>
        </section>
      </section>
    </main>
  );
}

async function deployRuntimeArtifact(projectId: string) {
  const response = await fetch(`/api/runtime-proxy/runs/${projectId}/deploy`, {
    method: "POST",
  });

  const data = await response.json();

  if (!data?.ok) {
    alert("Deployment failed.");
    return;
  }

  window.open(data.previewUrl || `/deployed/${projectId}`, "_blank");
}

export default function LiveRuntimePage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-black text-white p-10">Loading runtime...</main>}>
      <LiveRuntimeInner />
    </Suspense>
  );
}
