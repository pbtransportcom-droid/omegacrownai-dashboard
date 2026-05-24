"use client";

import { useState } from "react";

export default function VideoStudioPage() {
  const [prompt, setPrompt] = useState(
    "Create a cinematic OmegaCrownAI commercial showing sovereign AI intelligence, futuristic interfaces, luxury presentation, and production-grade realism."
  );

  const [loading, setLoading] = useState(false);

  async function generateVideo() {
    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 2200));

    setLoading(false);

    alert("OmegaCrownAI video generation pipeline initialized.");
  }

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <section className="mx-auto max-w-7xl">
        <div className="rounded-3xl border border-red-500/20 bg-gradient-to-br from-[#140505] via-[#0a0a0a] to-black p-10 shadow-2xl shadow-red-500/10">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-red-300">
            OmegaCrownAI Video Studio
          </p>

          <h1 className="mt-5 text-5xl font-black">
            Cinematic AI Video Generation
          </h1>

          <p className="mt-6 max-w-4xl text-lg leading-8 text-slate-300">
            Generate AI commercials, trailers, cinematic campaigns, reels,
            product launches, and sovereign media productions using the
            OmegaCrownAI production engine.
          </p>

          <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="text-sm font-black uppercase tracking-[0.25em] text-red-300">
                Video Prompt
              </div>

              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="mt-5 h-64 w-full rounded-2xl border border-white/10 bg-black/40 p-5 text-sm leading-7 text-white outline-none focus:border-red-400"
              />

              <div className="mt-6 flex flex-wrap gap-4">
                <button
                  onClick={generateVideo}
                  disabled={loading}
                  className="rounded-2xl bg-red-400 px-6 py-4 text-sm font-black text-black hover:bg-red-300 disabled:opacity-50"
                >
                  {loading ? "Initializing Render..." : "Generate Video"}
                </button>

                <button
                  className="rounded-2xl border border-white/10 bg-white/10 px-6 py-4 text-sm font-black text-white hover:bg-white/20"
                >
                  Open Timeline
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="text-sm font-black uppercase tracking-[0.25em] text-red-300">
                AI Render Pipeline
              </div>

              <div className="mt-6 space-y-4">
                {[
                  "Scene planning",
                  "Shot generation",
                  "Voiceover synthesis",
                  "Motion sequencing",
                  "Transition rendering",
                  "Soundtrack generation",
                  "Export pipeline",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/10 bg-black/30 px-4 py-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold">{item}</span>

                      <span className="text-xs uppercase tracking-[0.25em] text-emerald-300">
                        Ready
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-2xl border border-red-400/20 bg-red-500/10 p-5">
                <div className="text-xs font-black uppercase tracking-[0.25em] text-red-300">
                  Sovereign Production Engine
                </div>

                <p className="mt-3 text-sm leading-7 text-red-100">
                  OmegaCrownAI orchestrates cinematic production workflows,
                  AI-directed sequencing, prompt interpretation, rendering
                  logic, media assets, and publishing preparation through the
                  sovereign media runtime.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
