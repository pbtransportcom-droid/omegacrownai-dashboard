export default function StudioPage() {
  const tools = [
    {
      title: "Video Generator",
      description:
        "Create cinematic AI videos, commercials, reels, trailers, and social campaigns.",
      href: "/video-studio",
    },
    {
      title: "Podcast Builder",
      description:
        "Generate AI podcasts, interviews, narration, and voice productions.",
      href: "/create?type=podcast",
    },
    {
      title: "Music Generator",
      description:
        "Create cinematic soundtracks, intros, background music, and audio branding.",
      href: "/create?type=music",
    },
    {
      title: "Marketing Campaigns",
      description:
        "Launch AI marketing systems, ads, funnels, social media, and promotional content.",
      href: "/create?type=marketing",
    },
  ];

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <section className="mx-auto max-w-7xl">
        <div className="rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-[#07111f] via-[#081222] to-black p-10 shadow-2xl shadow-cyan-500/10">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-cyan-300">
            OmegaCrownAI Studio
          </p>

          <h1 className="mt-5 text-5xl font-black leading-tight">
            Sovereign AI Media Operating System
          </h1>

          <p className="mt-6 max-w-4xl text-lg leading-8 text-slate-300">
            Create cinematic productions, AI-generated media, commercial campaigns,
            podcasts, music systems, and marketing assets inside one unified
            sovereign production environment.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="/video-studio"
              className="rounded-2xl bg-cyan-400 px-6 py-4 text-sm font-black text-black hover:bg-cyan-300"
            >
              Create Video Project
            </a>

            <a
              href="/create?type=studio"
              className="rounded-2xl border border-white/15 bg-white/10 px-6 py-4 text-sm font-black text-white hover:bg-white/20"
            >
              Open Studio Workspace
            </a>
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {tools.map((tool) => (
            <a
              key={tool.title}
              href={tool.href}
              className="group rounded-3xl border border-white/10 bg-white/5 p-6 transition-all hover:border-cyan-400/40 hover:bg-cyan-500/5"
            >
              <div className="text-lg font-black text-white group-hover:text-cyan-300">
                {tool.title}
              </div>

              <p className="mt-4 text-sm leading-7 text-slate-400">
                {tool.description}
              </p>

              <div className="mt-6 text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
                Launch Builder →
              </div>
            </a>
          ))}
        </div>

        <div className="mt-10 rounded-3xl border border-yellow-400/20 bg-yellow-500/10 p-6">
          <div className="text-xs font-black uppercase tracking-[0.3em] text-yellow-300">
            Sovereign Studio Runtime
          </div>

          <p className="mt-4 max-w-5xl text-sm leading-8 text-yellow-100">
            OmegaCrownAI Studio is evolving into a unified AI media operating system
            for video generation, podcast production, cinematic campaigns, music
            systems, social automation, rendering pipelines, and sovereign AI
            content orchestration.
          </p>
        </div>
      </section>
    </main>
  );
}
