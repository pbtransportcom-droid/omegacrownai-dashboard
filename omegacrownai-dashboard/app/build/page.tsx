const builderCards = [
  {
    title: "Website Builder",
    description:
      "Build landing pages, business websites, product pages, and public customer-ready websites.",
    href: "/create?type=website",
    badge: "Websites",
  },
  {
    title: "App Builder",
    description:
      "Build dashboards, portals, SaaS tools, business apps, and customer-facing applications.",
    href: "/create?type=app",
    badge: "Apps",
  },
  {
    title: "Coding Workspace",
    description:
      "Generate, edit, review, and ship code with OmegaCrownAI project workspaces.",
    href: "/create?type=coding",
    badge: "Code",
  },
  {
    title: "Automation Builder",
    description:
      "Build workflow automations, AI agents, business pipelines, and scheduled execution flows.",
    href: "/automate",
    badge: "Automation",
  },
  {
    title: "Trading Builder",
    description:
      "Build trading dashboards, watchlists, alerts, forecasts, and King Trading System tools.",
    href: "/trade",
    badge: "Trading",
  },
];

export default function BuildPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <section className="mx-auto max-w-6xl">
        <div className="rounded-3xl border border-cyan-400/20 bg-cyan-500/10 p-8 text-center shadow-2xl shadow-cyan-950/30">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-300">
            OmegaCrownAI Builder Hub
          </p>
          <h1 className="mt-4 text-4xl font-black md:text-6xl">
            Build websites, apps, code, automations, and trading systems.
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-slate-300">
            Choose what you want to build. OmegaCrownAI can help create customer-ready websites,
            full-stack apps, coding projects, automation workflows, and King Trading System tools.
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <a
              href="/create?type=website"
              className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-black text-black hover:bg-cyan-300"
            >
              Start Website Builder
            </a>
            <a
              href="/create?type=app"
              className="rounded-xl bg-purple-500 px-5 py-3 text-sm font-black text-white hover:bg-purple-400"
            >
              Start App Builder
            </a>
            <a
              href="/create?type=coding"
              className="rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-black text-white hover:bg-white/20"
            >
              Start Coding Workspace
            </a>
          </div>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {builderCards.map((card) => (
            <a
              key={card.title}
              href={card.href}
              className="rounded-2xl border border-slate-700 bg-slate-900/80 p-6 shadow-xl shadow-black/20 transition hover:border-cyan-300/60 hover:bg-slate-900"
            >
              <span className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-black uppercase tracking-wide text-cyan-200">
                {card.badge}
              </span>
              <h2 className="mt-5 text-2xl font-black text-white">{card.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">{card.description}</p>
              <p className="mt-5 text-sm font-black text-cyan-200">Open {card.title} →</p>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
