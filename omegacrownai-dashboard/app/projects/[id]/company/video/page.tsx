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
            timeline: {
              include: {
                tracks: {
                  orderBy: { index: "asc" },
                  include: {
                    clips: {
                      orderBy: { startTimeSeconds: "asc" },
                      include: { asset: true, scene: true },
                    },
                  },
                },
              },
            },
            scenes: {
              orderBy: { index: "asc" },
              include: { assets: true },
            },
            assets: true,
            assetGenerationJobs: {
              orderBy: { createdAt: "desc" },
              include: { outputAsset: true, scene: true },
            },
            renderJobs: {
              orderBy: { createdAt: "desc" },
              include: { outputAsset: true },
            },
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

        <div className="mt-4">
          <Link
            href={`/projects/${id}/company/distribution`}
            className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-5 py-3 text-sm font-black text-emerald-100 hover:bg-emerald-500/20"
          >
            Distribution Studio
          </Link>
        </div>

        <div className="mt-4">
          <Link
            href={`/projects/${id}/company/versioning`}
            className="rounded-xl border border-sky-400/30 bg-sky-500/10 px-5 py-3 text-sm font-black text-sky-100 hover:bg-sky-500/20"
          >
            Versioning + Review
          </Link>
        </div>

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

                  <div className="mt-4 flex flex-wrap gap-3">
                    <form action={`/api/company/${company.id}/video/${video.id}/generate-assets`} method="POST">
                      <input type="hidden" name="includeMusic" value="true" />
                      <button className="rounded-xl bg-cyan-600 px-5 py-3 text-sm font-black text-white hover:bg-cyan-500">
                        Generate Scene Assets
                      </button>
                    </form>

                    <form action={`/api/company/${company.id}/video/${video.id}/generate-assets`} method="POST">
                      <input type="hidden" name="includeVideo" value="true" />
                      <input type="hidden" name="includeAvatar" value="true" />
                      <input type="hidden" name="includeMusic" value="true" />
                      <button className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-5 py-3 text-sm font-black text-cyan-100 hover:bg-cyan-500/20">
                        Generate Full Asset Set
                      </button>
                    </form>

                    <form action={`/api/company/${company.id}/video/${video.id}/render`} method="POST">
                      <input type="hidden" name="type" value="video" />
                      <button className="rounded-xl bg-fuchsia-600 px-5 py-3 text-sm font-black text-white hover:bg-fuchsia-500">
                        Queue Video Render
                      </button>
                    </form>

                    <form action={`/api/company/${company.id}/video/${video.id}/render`} method="POST">
                      <input type="hidden" name="type" value="audio_only" />
                      <button className="rounded-xl border border-fuchsia-400/30 bg-fuchsia-500/10 px-5 py-3 text-sm font-black text-fuchsia-100 hover:bg-fuchsia-500/20">
                        Queue Audio Render
                      </button>
                    </form>
                  </div>

                  <div className="mt-4 grid gap-4 xl:grid-cols-3">
                    <Panel title="Scenes + Voiceover" value={video.scenes} />
                    <Panel title="Asset Placeholders" value={video.assets} />
                    <Panel title="Timeline Metadata" value={video.timeline?.structureJson || {}} />
                  </div>

                  <div className="mt-4">
                    <Panel title="Render Jobs" value={(video as any).renderJobs || []} />
                  </div>

                  <div className="mt-4">
                    <Panel title="Asset Generation Jobs" value={(video as any).assetGenerationJobs || []} />
                  </div>

                  <div className="mt-4 rounded-2xl border border-fuchsia-400/20 bg-fuchsia-500/10 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="text-lg font-black text-white">Timeline Editor</h3>
                        <p className="mt-1 text-xs text-muted">
                          Normalized tracks and clips for editing. Phase 17 render reads the regenerated timeline JSON.
                        </p>
                      </div>

                      <form action={`/api/company/${company.id}/video/${video.id}/timeline/init`} method="POST">
                        <button className="rounded-xl bg-fuchsia-600 px-4 py-3 text-xs font-black text-white hover:bg-fuchsia-500">
                          Initialize Timeline
                        </button>
                      </form>
                    </div>

                    <div className="mt-4 space-y-3">
                      {((video.timeline as any)?.tracks || []).length ? (
                        ((video.timeline as any).tracks || []).map((track: any) => (
                          <div key={track.id} className="rounded-xl border border-border bg-slate-950 p-3">
                            <div className="flex items-center justify-between">
                              <div className="text-xs font-black uppercase tracking-[0.16em] text-fuchsia-300">
                                {track.label || track.type} · {track.type}
                              </div>
                              <div className="font-mono text-xs text-muted">{track.id}</div>
                            </div>

                            <div className="mt-3 flex flex-wrap gap-2">
                              {(track.clips || []).map((clip: any) => (
                                <div key={clip.id} className="rounded-lg border border-border bg-black/30 px-3 py-2">
                                  <div className="text-xs font-bold text-white">
                                    {clip.scene?.title || clip.asset?.label || "Clip"}
                                  </div>
                                  <div className="mt-1 text-[11px] text-muted">
                                    start {clip.startTimeSeconds}s · duration {clip.durationSeconds}s
                                  </div>
                                  <div className="mt-1 text-[11px] text-muted">
                                    {clip.transitionIn || "cut"} → {clip.transitionOut || "cut"}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-xl border border-border bg-black/20 p-4 text-sm text-muted">
                          No normalized timeline tracks yet. Click Initialize Timeline.
                        </div>
                      )}
                    </div>
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
    
      <section className="rounded-3xl border border-cyan-400/30 bg-cyan-500/10 p-5">
        <p className="text-xs uppercase tracking-[0.22em] text-cyan-300">v3.8 Timeline Export</p>
        <h2 className="mt-2 text-xl font-black text-white">Timeline-aware exports are enabled</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Creator Exports now uses scene ordering, generated visual scene assets, captions, and duration settings from the video timeline when rendering MP4 files.
        </p>
      </section>

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
