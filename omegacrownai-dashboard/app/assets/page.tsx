"use client";

const assets = [
  {
    id: "VID-7421",
    title: "OmegaCrownAI Commercial",
    type: "Video",
    status: "Rendered",
    preview:
      "Cinematic sovereign AI commercial with futuristic production scenes.",
  },
  {
    id: "POD-1842",
    title: "AI Market Intelligence Podcast",
    type: "Podcast",
    status: "Processing",
    preview:
      "Institutional-style AI trading intelligence and market commentary.",
  },
  {
    id: "MUS-9921",
    title: "Cinematic Piano Score",
    type: "Music",
    status: "Completed",
    preview:
      "Luxury orchestral soundtrack generated for sovereign media campaigns.",
  },
];

export default function AssetsPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <section className="mx-auto max-w-7xl">
        <div className="rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-[#07111f] via-[#08111b] to-black p-10 shadow-2xl shadow-cyan-500/10">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.35em] text-cyan-300">
                OmegaCrownAI Assets
              </p>

              <h1 className="mt-4 text-5xl font-black">
                Sovereign Asset Library
              </h1>

              <p className="mt-5 max-w-4xl text-lg leading-8 text-slate-300">
                Access rendered videos, podcasts, AI music, marketing campaigns,
                exports, media timelines, and sovereign production assets.
              </p>
            </div>

            <a
              href="/render-queue"
              className="rounded-2xl bg-cyan-400 px-6 py-4 text-sm font-black text-black hover:bg-cyan-300"
            >
              Open Render Queue
            </a>
          </div>

          <div className="mt-10 grid gap-6">
            {assets.map((asset) => (
              <div
                key={asset.id}
                className="rounded-3xl border border-white/10 bg-white/5 p-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-[0.25em] text-cyan-300">
                      {asset.id}
                    </div>

                    <div className="mt-2 text-2xl font-black">
                      {asset.title}
                    </div>

                    <div className="mt-3 inline-flex rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">
                      {asset.type}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-3 text-sm font-black uppercase tracking-[0.2em] text-emerald-300">
                    {asset.status}
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-5">
                  <div className="aspect-video rounded-2xl border border-dashed border-white/10 bg-gradient-to-br from-cyan-500/10 to-black" />

                  <p className="mt-5 text-sm leading-7 text-slate-300">
                    {asset.preview}
                  </p>
                </div>

                <div className="mt-6 flex flex-wrap gap-4">
                  <button className="rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-black text-black hover:bg-cyan-300">
                    Open Asset
                  </button>

                  <button className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-black text-white hover:bg-white/20">
                    Download Export
                  </button>

                  <button className="rounded-2xl border border-purple-500/20 bg-purple-500/10 px-5 py-3 text-sm font-black text-purple-200 hover:bg-purple-500/20">
                    Publish
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-3xl border border-yellow-400/20 bg-yellow-500/10 p-6">
            <div className="text-xs font-black uppercase tracking-[0.25em] text-yellow-300">
              Sovereign Media Persistence
            </div>

            <p className="mt-4 text-sm leading-8 text-yellow-100">
              OmegaCrownAI stores sovereign media assets, render history,
              publishing workflows, execution metadata, exports, and AI
              production outputs across the unified runtime system.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
