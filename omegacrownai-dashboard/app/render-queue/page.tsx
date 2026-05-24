"use client";

import { useState } from "react";

const mockJobs = [
  {
    id: "VID-7421",
    type: "Cinematic Commercial",
    status: "Rendering",
    progress: 74,
  },
  {
    id: "POD-1842",
    type: "Podcast Production",
    status: "Queued",
    progress: 21,
  },
  {
    id: "MUS-9921",
    type: "Music Generation",
    status: "Completed",
    progress: 100,
  },
];

export default function RenderQueuePage() {
  const [jobs] = useState(mockJobs);

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <section className="mx-auto max-w-7xl">
        <div className="rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-[#07111f] via-[#08111b] to-black p-10 shadow-2xl shadow-cyan-500/10">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.35em] text-cyan-300">
                OmegaCrownAI Runtime
              </p>

              <h1 className="mt-4 text-5xl font-black">
                Sovereign Render Queue
              </h1>

              <a
                href="/live-runtime"
                className="mt-5 inline-flex rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-5 py-3 text-sm font-black text-emerald-100 hover:bg-emerald-500/20"
              >
                Open Live Runtime
              </a>

              <p className="mt-5 max-w-4xl text-lg leading-8 text-slate-300">
                Monitor cinematic renders, AI media execution, podcast generation,
                music processing, and sovereign production orchestration across the
                OmegaCrownAI runtime system.
              </p>
            </div>

            <div className="rounded-3xl border border-cyan-400/20 bg-cyan-500/10 px-6 py-5">
              <div className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
                Runtime Status
              </div>

              <div className="mt-3 flex items-center gap-3 text-lg font-black text-white">
                <div className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
                ACTIVE
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-6">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="rounded-3xl border border-white/10 bg-white/5 p-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-[0.25em] text-cyan-300">
                      {job.id}
                    </div>

                    <div className="mt-2 text-2xl font-black">
                      {job.type}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/30 px-5 py-3 text-sm font-black uppercase tracking-[0.2em]">
                    {job.status}
                  </div>
                </div>

                <div className="mt-6">
                  <div className="mb-3 flex justify-between text-sm text-slate-300">
                    <span>Render Progress</span>
                    <span>{job.progress}%</span>
                  </div>

                  <div className="h-4 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-cyan-400 transition-all"
                      style={{ width: `${job.progress}%` }}
                    />
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-4">
                  <button className="rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-black text-black hover:bg-cyan-300">
                    Open Asset
                  </button>

                  <button className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-black text-white hover:bg-white/20">
                    View Workflow
                  </button>

                  <button className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-3 text-sm font-black text-red-200 hover:bg-red-500/20">
                    Stop Render
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-3xl border border-yellow-400/20 bg-yellow-500/10 p-6">
            <div className="text-xs font-black uppercase tracking-[0.25em] text-yellow-300">
              Sovereign Execution Layer
            </div>

            <p className="mt-4 text-sm leading-8 text-yellow-100">
              OmegaCrownAI orchestrates AI rendering workflows through sovereign
              runtime coordination, queue prioritization, asset synchronization,
              generation tracking, and production lifecycle execution.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
