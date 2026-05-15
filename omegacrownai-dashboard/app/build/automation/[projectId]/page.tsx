import { prisma } from "@/lib/db";
import AutomationWorkspace from "@/components/build/AutomationWorkspace";

export default async function AutomationWorkspacePage({
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
      domain: "automation",
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
          kind: "automation_flow_v1",
        },
      })
    : null;

  const activeBuild = builds.find((build) => build.id === activeBuildId) || null;

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <section className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <a href="/sovereign/automation" className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm font-black text-emerald-100 hover:bg-emerald-500/20">
            ← Automation Department
          </a>
          <a href={`/projects/${projectId}`} className="rounded-xl bg-emerald-400 px-4 py-2 text-sm font-black text-black hover:bg-emerald-300">
            Open Project Record
          </a>
        </div>

        <div className="mt-6 rounded-3xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500/15 via-slate-900 to-cyan-500/10 p-8 shadow-2xl shadow-emerald-950/30">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-300">
            Automation Department Workspace
          </p>
          <h1 className="mt-4 text-4xl font-black md:text-6xl">
            Build workflows that run.
          </h1>
          <p className="mt-5 max-w-4xl text-base leading-8 text-slate-300">
            Design agents, scheduled tasks, operational workflows, reporting pipelines,
            customer follow-ups, and repeatable business automation.
          </p>
          <div className="mt-6 rounded-2xl border border-slate-700 bg-black/30 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">Project ID</p>
            <p className="mt-1 break-all font-mono text-sm font-black text-emerald-100">{projectId}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-4">
          {["Trigger", "Workflow", "Approvals", "Run History"].map((item) => (
            <div key={item} className="rounded-2xl border border-slate-700 bg-slate-900/80 p-6">
              <h2 className="text-xl font-black text-white">{item}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                Configure the {item.toLowerCase()} layer for this automation project.
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-6">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-300">
            Builder Data Panel
          </p>
          <h2 className="mt-2 text-3xl font-black text-white">
            Automation build history and flow draft
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            This restores the real automation workspace data: saved builds, active build selection,
            automation flow payload, and project-backed execution context.
          </p>
          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-700 bg-slate-950">
            <AutomationWorkspace
              project={project}
              builds={builds}
              activeBuild={activeBuild}
              draft={artifact?.payload || null}
            />
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-6">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-300">
            Automation Actions
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <a href={`/projects/${projectId}/executions`} className="rounded-xl border border-slate-700 bg-black/30 p-4 hover:border-emerald-300/60">
              <p className="font-black text-white">Execution History</p>
              <p className="mt-2 text-xs text-slate-400">Review workflow runs and output history.</p>
            </a>
            <a href={`/projects/${projectId}/settings/execution-policy`} className="rounded-xl border border-slate-700 bg-black/30 p-4 hover:border-emerald-300/60">
              <p className="font-black text-white">Execution Policy</p>
              <p className="mt-2 text-xs text-slate-400">Control approval, safety, and automation behavior.</p>
            </a>
            <a href={`/reliability/replay`} className="rounded-xl border border-slate-700 bg-black/30 p-4 hover:border-emerald-300/60">
              <p className="font-black text-white">Replay</p>
              <p className="mt-2 text-xs text-slate-400">Inspect and replay reliability scenarios.</p>
            </a>
            <a href={`/api/sovereign/workspace-validation?department=automation&projectId=${projectId}`} className="rounded-xl border border-slate-700 bg-black/30 p-4 hover:border-emerald-300/60">
              <p className="font-black text-white">Workspace Check</p>
              <p className="mt-2 text-xs text-slate-400">Validate routing for this automation workspace.</p>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
