import { prisma } from "@/lib/db";
import TradingWorkspace from "@/components/build/TradingWorkspace";

export default async function TradingWorkspacePage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ buildId?: string }>;
}) {
  const { projectId } = await params;
  const { buildId } = await searchParams;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  const builds = await prisma.projectBuild.findMany({
    where: {
      projectId,
      domain: "trading",
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const activeBuildId = buildId || builds[0]?.id || "";

  const artifact = activeBuildId
    ? await prisma.projectBuildArtifact.findFirst({
        where: {
          projectId,
          buildId: activeBuildId,
          kind: "strategy_draft_v1",
        },
      })
    : null;

  const activeBuild = builds.find((build) => build.id === activeBuildId) || null;

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <section className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <a href="/sovereign/trading" className="rounded-xl border border-lime-400/30 bg-lime-500/10 px-4 py-2 text-sm font-black text-lime-100 hover:bg-lime-500/20">
            ← Trading Department
          </a>
          <a href="/trade" className="rounded-xl bg-lime-400 px-4 py-2 text-sm font-black text-black hover:bg-lime-300">
            Open King Trading System
          </a>
        </div>

        <div className="mt-6 rounded-3xl border border-lime-400/20 bg-gradient-to-br from-lime-500/15 via-slate-900 to-cyan-500/10 p-8 shadow-2xl shadow-lime-950/30">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-lime-300">
            Trading Department Workspace
          </p>
          <h1 className="mt-4 text-4xl font-black md:text-6xl">
            Research, rank, and control risk.
          </h1>
          <p className="mt-5 max-w-4xl text-base leading-8 text-slate-300">
            This workspace connects King Trading System research, watchlists,
            forecast quality, market discovery, and educational risk controls.
          </p>
          <div className="mt-6 rounded-2xl border border-slate-700 bg-black/30 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">Project ID</p>
            <p className="mt-1 break-all font-mono text-sm font-black text-lime-100">{projectId}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-4">
          {["Market Discovery", "Watchlist Quality", "Forecast Control", "Risk Notes"].map((item) => (
            <div key={item} className="rounded-2xl border border-slate-700 bg-slate-900/80 p-6">
              <h2 className="text-xl font-black text-white">{item}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                Use this section to organize {item.toLowerCase()} for educational market analysis.
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-lime-400/20 bg-lime-500/10 p-6">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-lime-300">
            Builder Data Panel
          </p>
          <h2 className="mt-2 text-3xl font-black text-white">
            Trading build history and strategy draft
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            This restores the real trading builder workspace data: saved builds, active strategy draft,
            project-backed trading research context, and generated strategy payload.
          </p>
          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-700 bg-slate-950">
            <TradingWorkspace
              project={project}
              builds={builds}
              activeBuild={activeBuild}
              draft={artifact?.payload || null}
            />
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-yellow-400/20 bg-yellow-500/10 p-6">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-yellow-300">
            Trading Safety Notice
          </p>
          <p className="mt-3 text-sm leading-7 text-yellow-50">
            Trading workspace output is educational market analysis only. It is not financial advice,
            not a guarantee, and not an instruction to buy or sell. Verify data, liquidity, filings,
            risk, and personal suitability before making decisions.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-lime-400/20 bg-lime-500/10 p-6">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-lime-300">
            Trading Actions
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <a href="/trade" className="rounded-xl border border-slate-700 bg-black/30 p-4 hover:border-lime-300/60">
              <p className="font-black text-white">King Trading System</p>
              <p className="mt-2 text-xs text-slate-400">Open the main trading intelligence interface.</p>
            </a>
            <a href={`/api/trading/watchlist-quality`} className="rounded-xl border border-slate-700 bg-black/30 p-4 hover:border-lime-300/60">
              <p className="font-black text-white">Watchlist Quality</p>
              <p className="mt-2 text-xs text-slate-400">Review quality scoring and forecast support.</p>
            </a>
            <a href={`/projects/${projectId}/memory`} className="rounded-xl border border-slate-700 bg-black/30 p-4 hover:border-lime-300/60">
              <p className="font-black text-white">Trading Notes</p>
              <p className="mt-2 text-xs text-slate-400">Open project memory and research notes.</p>
            </a>
            <a href={`/api/sovereign/workspace-validation?department=trading&projectId=${projectId}`} className="rounded-xl border border-slate-700 bg-black/30 p-4 hover:border-lime-300/60">
              <p className="font-black text-white">Workspace Check</p>
              <p className="mt-2 text-xs text-slate-400">Validate routing for this trading workspace.</p>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
