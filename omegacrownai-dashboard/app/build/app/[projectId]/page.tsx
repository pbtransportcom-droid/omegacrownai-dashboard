export default async function AppWorkspacePage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <section className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <a href="/sovereign/app" className="rounded-xl border border-purple-400/30 bg-purple-500/10 px-4 py-2 text-sm font-black text-purple-100 hover:bg-purple-500/20">
            ← App Department
          </a>
          <a href={`/projects/${projectId}`} className="rounded-xl bg-purple-400 px-4 py-2 text-sm font-black text-black hover:bg-purple-300">
            Open Project Record
          </a>
        </div>

        <div className="mt-6 rounded-3xl border border-purple-400/20 bg-gradient-to-br from-purple-500/15 via-slate-900 to-cyan-500/10 p-8 shadow-2xl shadow-purple-950/30">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-purple-300">
            App Department Workspace
          </p>
          <h1 className="mt-4 text-4xl font-black md:text-6xl">
            Build a real product workspace.
          </h1>
          <p className="mt-5 max-w-4xl text-base leading-8 text-slate-300">
            Plan and organize a dashboard, SaaS app, customer portal, internal tool,
            or full-stack business system from idea to production readiness.
          </p>
          <div className="mt-6 rounded-2xl border border-slate-700 bg-black/30 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">Project ID</p>
            <p className="mt-1 break-all font-mono text-sm font-black text-purple-100">{projectId}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-4">
          {[
            "Product Brief",
            "Data Model",
            "User Flows",
            "Release Readiness",
          ].map((item) => (
            <div key={item} className="rounded-2xl border border-slate-700 bg-slate-900/80 p-6">
              <h2 className="text-xl font-black text-white">{item}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                Organize the {item.toLowerCase()} for this app workspace and connect it to build history.
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-purple-400/20 bg-purple-500/10 p-6">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-purple-300">
            App Workspace Actions
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <a href={`/projects/${projectId}/company/versioning`} className="rounded-xl border border-slate-700 bg-black/30 p-4 hover:border-purple-300/60">
              <p className="font-black text-white">Versioning</p>
              <p className="mt-2 text-xs text-slate-400">Track releases, versions, and production changes.</p>
            </a>
            <a href={`/projects/${projectId}/executions`} className="rounded-xl border border-slate-700 bg-black/30 p-4 hover:border-purple-300/60">
              <p className="font-black text-white">Executions</p>
              <p className="mt-2 text-xs text-slate-400">Open runs, execution history, and build activity.</p>
            </a>
            <a href={`/projects/${projectId}/settings/safety`} className="rounded-xl border border-slate-700 bg-black/30 p-4 hover:border-purple-300/60">
              <p className="font-black text-white">Safety</p>
              <p className="mt-2 text-xs text-slate-400">Review project rules, safeguards, and controls.</p>
            </a>
            <a href={`/api/sovereign/workspace-validation?department=app&projectId=${projectId}`} className="rounded-xl border border-slate-700 bg-black/30 p-4 hover:border-purple-300/60">
              <p className="font-black text-white">Workspace Check</p>
              <p className="mt-2 text-xs text-slate-400">Validate routing for this app workspace.</p>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
