"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const runtimeEvents = [
  "Initializing sovereign orchestration engine...",
  "Analyzing cinematic scene structure...",
  "Generating AI voice narration layers...",
  "Deploying creative workflow agents...",
  "Building marketing distribution variants...",
  "Synchronizing render queue assets...",
  "Running production intelligence analysis...",
  "Generating soundtrack composition...",
  "Preparing social media publishing exports...",
  "Optimizing sovereign execution pipeline...",
  "Rendering cinematic transitions...",
  "Streaming runtime telemetry...",
  "Finalizing AI production workflow...",
];

function LiveRuntimePageClient() {
  const searchParams = useSearchParams();


const [runtimeData, setRuntimeData] = useState<any>(null);

useEffect(() => {
  const projectId = searchParams.get("projectId");

  if (!projectId) return;

  fetch(`/api/sovereign/runs/${projectId}`)
    .then((res) => res.json())
    .then((data) => {
      setRuntimeData(data);
    })
    .catch(console.error);
}, [searchParams]);

const agents =
  runtimeData?.agents?.length || 0;

const artifacts =
  runtimeData?.artifacts?.length || 0;

const events =
  runtimeData?.events?.length || 0;


  const projectId =
    searchParams.get("projectId") || "OC-UNKNOWN";

  const runtimeId =
    searchParams.get("runtimeId") || "RT-UNKNOWN";

  const intent =
    searchParams.get("intent") || "general";

  const workspace =
    searchParams.get("workspace") || "/workspace";

  const [events, setEvents] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [realRun, setRealRun] = useState<any>(null);

  useEffect(() => {
    if (!projectId || projectId === "OC-UNKNOWN") return;

    async function loadRun() {
      try {
        const res = await fetch(`/api/sovereign/runs/${projectId}`, {
          cache: "no-store",
        });

        const data = await res.json();

        if (data?.ok && data?.run) {
          setRealRun(data.run);

          if (Array.isArray(data.run.events)) {
            setEvents(data.run.events.slice().reverse().slice(0, 20));
          }
        }
      } catch {}
    }

    loadRun();

    const poll = setInterval(loadRun, 3000);

    return () => clearInterval(poll);
  }, [projectId]);

  useEffect(() => {
    const interval = setInterval(() => {
      setEvents((prev) => [
        runtimeEvents[index % runtimeEvents.length],
        ...prev,
      ].slice(0, 12));

      setIndex((prev) => prev + 1);
    }, 1800);

    return () => clearInterval(interval);
  }, [index]);

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <section className="mx-auto max-w-7xl">
        <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-[#03110a] via-[#07140d] to-black p-10 shadow-2xl shadow-emerald-500/10">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.35em] text-emerald-300">
                OmegaCrownAI Runtime
              </p>

              <h1 className="mt-4 text-5xl font-black">
                Sovereign Live Execution Engine
              </h1>

              <p className="mt-5 max-w-4xl text-lg leading-8 text-slate-300">
                Monitor live AI orchestration, sovereign execution streams,
                render intelligence, workflow coordination, runtime telemetry,
                and active production operations across OmegaCrownAI.
              </p>
            </div>

            <div className="rounded-3xl border border-emerald-400/20 bg-emerald-500/10 px-6 py-5">
              <div className="text-xs font-black uppercase tracking-[0.25em] text-emerald-300">
                Runtime State
              </div>

              <div className="mt-3 flex items-center gap-3 text-lg font-black">
                <div className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
                LIVE EXECUTION
              </div>
            </div>
          </div>


          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              ["Project ID", realRun?.projectId || projectId],
              ["Runtime ID", realRun?.runtimeId || runtimeId],
              ["Intent", (realRun?.intent || intent).toUpperCase()],
              ["Workspace", realRun?.workspace || workspace],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-3xl border border-cyan-400/20 bg-cyan-500/10 p-5"
              >
                <div className="text-xs uppercase tracking-[0.25em] text-cyan-300">
                  {label}
                </div>

                <div className="mt-3 break-all text-lg font-black text-white">
                  {value}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              ["Project ID", realRun?.projectId || projectId],
              ["Runtime ID", realRun?.runtimeId || runtimeId],
              ["Intent", (realRun?.intent || intent).toUpperCase()],
              ["Workspace", realRun?.workspace || workspace],
            ].map(([label, value]) => (
              <div key={label} className="rounded-3xl border border-cyan-400/20 bg-cyan-500/10 p-5">
                <div className="text-xs uppercase tracking-[0.25em] text-cyan-300">{label}</div>
                <div className="mt-3 break-all text-lg font-black text-white">{value}</div>
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-center justify-between">
                <div className="text-sm font-black uppercase tracking-[0.25em] text-emerald-300">
                  Live Runtime Feed
                </div>

                <div className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-emerald-300">
                  STREAMING
                </div>
              </div>

              <div className="mt-6 h-[520px] overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-4">
                <div className="space-y-3">
                  {events.map((event, idx) => (
                    <div
                      key={`${event}-${idx}`}
                      className="rounded-2xl border border-emerald-500/10 bg-emerald-500/5 px-4 py-4 animate-pulse"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />

                        <div>
                          <div className="text-xs uppercase tracking-[0.2em] text-emerald-300">
                            Sovereign Runtime Event
                          </div>

                          <div className="mt-2 text-sm leading-7 text-slate-200">
                            {event}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {[
                ["AI Agents Active", "42"],
                ["Runtime Missions", realRun ? String(realRun.events?.length || 0) : "18"],
                ["Artifacts", realRun ? String(realRun.artifacts?.length || 0) : "0"],
                ["Publishing Tasks", "27"],
                ["Workflow Streams", "63"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-3xl border border-white/10 bg-white/5 p-6"
                >
                  <div className="text-xs uppercase tracking-[0.25em] text-emerald-300">
                    {label}
                  </div>

                  <div className="mt-4 text-5xl font-black">
                    {value}
                  </div>
                </div>
              ))}

              <div className="rounded-3xl border border-yellow-400/20 bg-yellow-500/10 p-6">
                <div className="text-xs font-black uppercase tracking-[0.25em] text-yellow-300">
                  Sovereign Runtime Intelligence
                </div>

                <p className="mt-4 text-sm leading-8 text-yellow-100">
                  OmegaCrownAI continuously coordinates AI execution pipelines,
                  generation systems, creative orchestration, render operations,
                  telemetry synchronization, and sovereign workflow intelligence.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}






export default function LiveRuntimePage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-black text-white p-10">
          <div className="mx-auto max-w-5xl rounded-3xl border border-cyan-400/20 bg-cyan-500/10 p-10">
            <div className="text-sm uppercase tracking-[0.3em] text-cyan-300">
              OmegaCrownAI Runtime
            </div>

            <h1 className="mt-4 text-5xl font-black">
              Initializing Sovereign Runtime...
            </h1>
          </div>
        </main>
      }
    >
      <div suppressHydrationWarning>
        <LiveRuntimePageClient />
      </div>
    </Suspense>
  );
}
