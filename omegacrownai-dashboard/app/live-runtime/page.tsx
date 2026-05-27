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

    fetch(`/api/sovereign/runs/${projectId}`)
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

  const agents = runtime?.agents || [];
  const artifacts = runtime?.artifacts || [];
  const events = runtime?.events || [];
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

        <p className="mt-3 text-white/70">
          Project: {projectId || "missing"} · Runtime: {runtimeId || "missing"} · Mode:{" "}
          {runtime?.mode || intent}
        </p>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-red-200">
            {error}
          </div>
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

export default function LiveRuntimePage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-black text-white p-10">Loading runtime...</main>}>
      <LiveRuntimeInner />
    </Suspense>
  );
}
