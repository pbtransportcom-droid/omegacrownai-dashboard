import Link from "next/link";
import { prisma } from "@/lib/db";
import { OmegaLogo } from "@/components/brand/OmegaLogo";

export default async function VideoStudioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [project, companies] = await Promise.all([
    prisma.project.findUnique({ where: { id } }),
    prisma.company.findMany({
      where: { projectId: id },
      orderBy: { createdAt: "desc" },
      take: 1,
    }),
  ]);

  const company = companies[0] || null;

  const [videoProjects, campaigns] = company
    ? await Promise.all([
        prisma.videoProject.findMany({
          where: { companyId: company.id },
          orderBy: { createdAt: "desc" },
          take: 50,
          include: {
            script: true,
            timeline: true,
            scenes: {
              orderBy: { index: "asc" },
              include: { assets: true },
            },
            assets: true,
          },
        }),
        prisma.marketingCampaign.findMany({
          where: { companyId: company.id },
          orderBy: { createdAt: "desc" },
          take: 25,
          include: { assets: true },
        }),
      ])
    : [[], []];

  return (
    <main className="space-y-6">
      <div className="flex justify-center">
        <OmegaLogo className="h-16 w-auto object-contain" />
      </div>

      <section className="rounded-3xl border border-border bg-panel/70 p-6">
        <Link href={`/projects/${id}/company/executive`} className="text-sm text-cyan-300 hover:underline">
          ← Back to Executive Command Center
        </Link>

        <p className="mt-5 text-xs uppercase tracking-[0.25em] text-fuchsia-300">
          Native Video Studio · Phase 16
        </p>

        <h1 className="mt-3 text-4xl font-black text-white">
          Video Studio Foundation · {project?.name || "Project"}
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
          Create sovereign video project structure: scripts, scenes, voiceover text, asset placeholders, brand overlay metadata, and timeline JSON.
        </p>
      </section>

      {company ? (
        <>
          <section className="grid gap-4 md:grid-cols-4">
            <Metric label="Video Projects" value={String(videoProjects.length)} />
            <Metric label="Scenes" value={String(videoProjects.reduce((sum, item) => sum + item.scenes.length, 0))} />
            <Metric label="Assets" value={String(videoProjects.reduce((sum, item) => sum + item.assets.length, 0))} />
            <Metric label="Campaigns" value={String(campaigns.length)} />
          </section>

          <section className="rounded-3xl border border-border bg-panel/70 p-5">
            <h2 className="text-xl font-black text-white">Create Native Video Project</h2>

            <form
              action={`/api/company/${company.id}/video/projects`}
              method="POST"
              className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5"
            >
              <input
                name="title"
                placeholder="Video title"
                className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none"
              />

              <input
                name="objective"
                placeholder="Objective"
                className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none xl:col-span-2"
              />

              <select
                name="aspectRatio"
                defaultValue="16:9"
                className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none"
              >
                <option value="16:9">16:9</option>
                <option value="9:16">9:16</option>
                <option value="1:1">1:1</option>
              </select>

              <button className="rounded-xl bg-fuchsia-600 px-5 py-3 text-sm font-black text-white hover:bg-fuchsia-500">
                Create Project
              </button>
            </form>
          </section>

          <section className="rounded-3xl border border-border bg-panel/70 p-5">
            <h2 className="text-xl font-black text-white">Generate Video from Marketing Campaign</h2>

            <div className="mt-4 space-y-3">
              {campaigns.length ? (
                campaigns.map((campaign) => (
                  <div key={campaign.id} className="rounded-2xl border border-border bg-black/20 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h3 className="text-sm font-black text-white">{campaign.name}</h3>
                        <p className="mt-1 text-xs leading-5 text-muted">{campaign.objective}</p>
                        <p className="mt-1 font-mono text-xs text-muted">{campaign.id}</p>
                      </div>

                      <form action={`/api/company/${company.id}/video/from-campaign`} method="POST">
                        <input type="hidden" name="campaignId" value={campaign.id} />
                        <button className="rounded-xl border border-fuchsia-400/30 bg-fuchsia-500/10 px-4 py-3 text-xs font-black text-fuchsia-100 hover:bg-fuchsia-500/20">
                          Generate Video
                        </button>
                      </form>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-border bg-black/20 p-4 text-sm text-muted">
                  No marketing campaigns available yet.
                </div>
              )}
            </div>
          </section>

          <section className="space-y-4">
            {videoProjects.length ? (
              videoProjects.map((video) => (
                <div key={video.id} className="rounded-3xl border border-border bg-panel/70 p-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h2 className="text-2xl font-black text-white">{video.title}</h2>
                      <p className="mt-2 text-sm text-muted">{video.description || "No description."}</p>
                      <p className="mt-1 font-mono text-xs text-muted">{video.id}</p>
                    </div>

                    <div className="rounded-xl border border-fuchsia-400/30 bg-fuchsia-500/10 px-3 py-2 text-xs font-bold text-fuchsia-100">
                      {video.status} · {video.aspectRatio} · {video.durationSeconds || 0}s
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 xl:grid-cols-2">
                    <Panel title="Script" value={video.script?.fullText || ""} />
                    <Panel title="Brand Overlay Metadata" value={video.brandOverlay || {}} />
                  </div>

                  <div className="mt-4 grid gap-4 xl:grid-cols-3">
                    <Panel title="Scenes + Voiceover" value={video.scenes} />
                    <Panel title="Asset Placeholders" value={video.assets} />
                    <Panel title="Timeline Metadata" value={video.timeline?.structureJson || {}} />
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-border bg-black/20 p-5 text-sm text-muted">
                No video projects yet.
              </div>
            )}
          </section>
        </>
      ) : (
        <section className="rounded-2xl border border-border bg-black/20 p-5 text-sm text-muted">
          No company exists for this project yet.
        </section>
      )}
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-black/20 p-4">
      <div className="text-xs uppercase tracking-[0.18em] text-muted">{label}</div>
      <div className="mt-2 truncate text-xl font-black text-white">{value}</div>
    </div>
  );
}

function Panel({ title, value }: { title: string; value: any }) {
  return (
    <div className="rounded-xl border border-border bg-slate-950 p-3">
      <div className="text-xs font-bold uppercase tracking-[0.16em] text-fuchsia-300">
        {title}
      </div>
      <pre className="mt-2 max-h-96 overflow-auto whitespace-pre-wrap text-xs leading-5 text-slate-200">
        {typeof value === "string" ? value : JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}
