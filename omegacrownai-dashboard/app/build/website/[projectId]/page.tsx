export default async function WebsiteWorkspacePage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <section className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <a
            href="/sovereign/website"
            className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm font-black text-cyan-100 hover:bg-cyan-500/20"
          >
            ← Website Department
          </a>
          <div className="flex flex-wrap gap-2">
            <a
              href="/build"
              className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-black text-white hover:bg-white/20"
            >
              Sovereign OS
            </a>
            <a
              href={`/projects/${projectId}`}
              className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-black text-black hover:bg-cyan-300"
            >
              Open Project Record
            </a>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/15 via-slate-900 to-blue-500/10 p-8 shadow-2xl shadow-cyan-950/30">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-300">
            Website Department Workspace
          </p>
          <h1 className="mt-4 text-4xl font-black md:text-6xl">
            Build a customer-ready website.
          </h1>
          <p className="mt-5 max-w-4xl text-base leading-8 text-slate-300">
            This workspace organizes the website project into brief, structure, content,
            design, SEO, launch readiness, and production next actions.
          </p>

          <div className="mt-6 rounded-2xl border border-slate-700 bg-black/30 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Project ID
            </p>
            <p className="mt-1 break-all font-mono text-sm font-black text-cyan-100">
              {projectId}
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {[
            {
              title: "Website Brief",
              body: "Define business goals, target customers, service offer, tone, pages, and conversion objective.",
            },
            {
              title: "Page Structure",
              body: "Plan homepage, services, proof, pricing, contact, trust sections, and customer journey.",
            },
            {
              title: "Launch Readiness",
              body: "Check SEO basics, mobile layout, calls-to-action, trust content, analytics, and publishing steps.",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-2xl border border-slate-700 bg-slate-900/80 p-6 shadow-xl shadow-black/20"
            >
              <h2 className="text-2xl font-black text-white">{card.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">{card.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-6">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-300">
            Workspace Actions
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <a href={`/projects/${projectId}/company/deployment`} className="rounded-xl border border-slate-700 bg-black/30 p-4 hover:border-emerald-300/60">
              <p className="font-black text-white">Deployment</p>
              <p className="mt-2 text-xs leading-5 text-slate-400">Prepare hosting, route, publish, and final launch steps.</p>
            </a>
            <a href={`/projects/${projectId}/company/qa-improvement`} className="rounded-xl border border-slate-700 bg-black/30 p-4 hover:border-emerald-300/60">
              <p className="font-black text-white">Quality Review</p>
              <p className="mt-2 text-xs leading-5 text-slate-400">Review customer-facing polish and improvement tasks.</p>
            </a>
            <a href={`/projects/${projectId}/memory`} className="rounded-xl border border-slate-700 bg-black/30 p-4 hover:border-emerald-300/60">
              <p className="font-black text-white">Knowledge Base</p>
              <p className="mt-2 text-xs leading-5 text-slate-400">Open project memory, decisions, notes, and context.</p>
            </a>
            <a href={`/api/sovereign/workspace-validation?department=website&projectId=${projectId}`} className="rounded-xl border border-slate-700 bg-black/30 p-4 hover:border-emerald-300/60">
              <p className="font-black text-white">Workspace Check</p>
              <p className="mt-2 text-xs leading-5 text-slate-400">Verify routing and workspace readiness.</p>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
