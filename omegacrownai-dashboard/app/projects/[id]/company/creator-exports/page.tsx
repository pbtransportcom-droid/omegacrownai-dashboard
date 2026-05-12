import Link from "next/link";
import { prisma } from "@/lib/db";
import { OmegaLogo } from "@/components/brand/OmegaLogo";
import { getCreatorExportDashboard } from "@/lib/sugent/creator-export/creatorExportEngine";
import { getCreatorRenderJobDashboard } from "@/lib/sugent/creator-render/renderJobEngine";

export default async function CreatorExportsPage({
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
  const data = company ? await getCreatorExportDashboard(company.id) : null;
  const renderJobs = company ? await getCreatorRenderJobDashboard(company.id) : null;

  const [videoProjects, podcastProjects] = company
    ? await Promise.all([
        prisma.videoProject.findMany({
          where: { companyId: company.id },
          orderBy: { createdAt: "desc" },
          take: 25,
        }),
        prisma.podcastProject.findMany({
          where: { companyId: company.id },
          orderBy: { createdAt: "desc" },
          take: 25,
        }),
      ])
    : [[], []];

  const latest = data?.exports?.[0] || null;
  const completed = data?.exports?.filter((item: any) => item.status === "completed") || [];
  const blocked = data?.exports?.filter((item: any) => item.status === "blocked") || [];

  return (
    <main className="space-y-6">
      <div className="flex justify-center">
        <OmegaLogo className="h-16 w-auto object-contain" />
      </div>

      <section className="rounded-3xl border border-border bg-panel/70 p-6">
        <Link href={`/projects/${id}/company/executive`} className="text-sm text-cyan-300 hover:underline">
          ← Back to Executive Command Center
        </Link>

        <p className="mt-5 text-xs uppercase tracking-[0.25em] text-cyan-300">
          Creator Export Polish + Media Player UI · v3.4 Phase 50
        </p>

        <h1 className="mt-3 text-4xl font-black text-white">
          Creator Media Library · {project?.name || "Project"}
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
          Preview finished MP4 videos and MP3 podcasts with generated TTS narration, selectable music moods, timeline scene ordering, captions, duration controls, download links, render evidence, and creator output history.
        </p>
      </section>

      {company && data ? (
        <>
          <section className="grid gap-4 md:grid-cols-6">
            <Metric label="Exports" value={String(data.summary.exports)} />
            <Metric label="Completed" value={String(data.summary.completed)} />
            <Metric label="Blocked" value={String(data.summary.blocked)} />
            <Metric label="Running" value={String(data.summary.running)} />
            <Metric label="Video" value={String(data.summary.video)} />
            <Metric label="Podcast" value={String(data.summary.podcast)} />
          </section>

          {renderJobs && (
            <section className="grid gap-4 md:grid-cols-5">
              <Metric label="Render Jobs" value={String(renderJobs.summary.jobs)} />
              <Metric label="Queued" value={String(renderJobs.summary.queued)} />
              <Metric label="Running Jobs" value={String(renderJobs.summary.running)} />
              <Metric label="Completed Jobs" value={String(renderJobs.summary.completed)} />
              <Metric label="Avg Progress" value={`${renderJobs.summary.averageProgress}%`} />
            </section>
          )}

          {latest && (
            <section className="rounded-3xl border border-cyan-400/30 bg-cyan-500/10 p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Latest Export</p>
                  <h2 className="mt-2 text-2xl font-black text-white">{latest.title || "Creator Export"}</h2>
                  <p className="mt-2 text-sm text-slate-300">
                    {latest.status} · {latest.projectType} · {latest.format} · {latest.sizeBytes ? formatBytes(latest.sizeBytes) : "size pending"}
                  </p>
                </div>

                <StatusPill status={latest.status} />
              </div>

              <div className="mt-5">
                <MediaPreview item={latest} featured />
              </div>
            </section>
          )}

          <section className="grid gap-6 xl:grid-cols-2">
            <section className="rounded-3xl border border-border bg-panel/70 p-5">
              <h2 className="text-xl font-black text-white">Create Video Export</h2>
              <p className="mt-2 text-sm text-muted">Render a real MP4 with scene cards, generated TTS narration, and audio bed.</p>

              <form action={`/api/company/${company.id}/creator-export/execute`} method="POST" className="mt-4 grid gap-3">
                <input type="hidden" name="projectType" value="video" />
                <input type="hidden" name="format" value="mp4" />

                <select name="projectId" required className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none">
                  <option value="">Select video project</option>
                  {videoProjects.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title}
                    </option>
                  ))}
                </select>

                <AudioStyleControls />

                <button className="rounded-xl bg-cyan-600 px-5 py-3 text-sm font-black text-white hover:bg-cyan-500">
                  Render MP4 Export
                </button>
              </form>
            </section>

            <section className="rounded-3xl border border-border bg-panel/70 p-5">
              <h2 className="text-xl font-black text-white">Create Podcast Export</h2>
              <p className="mt-2 text-sm text-muted">Render a real MP3 podcast with generated TTS narration and intro/outro audio bed.</p>

              <form action={`/api/company/${company.id}/creator-export/execute`} method="POST" className="mt-4 grid gap-3">
                <input type="hidden" name="projectType" value="podcast" />
                <input type="hidden" name="format" value="mp3" />

                <select name="projectId" required className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none">
                  <option value="">Select podcast project</option>
                  {podcastProjects.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title}
                    </option>
                  ))}
                </select>

                <AudioStyleControls />

                <button className="rounded-xl bg-cyan-600 px-5 py-3 text-sm font-black text-white hover:bg-cyan-500">
                  Render MP3 Export
                </button>
              </form>
            </section>
          </section>

          <section className="rounded-3xl border border-border bg-panel/70 p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-xl font-black text-white">Completed Media</h2>
                <p className="mt-2 text-sm text-muted">Preview and download finished video and podcast exports.</p>
              </div>
              <div className="text-sm text-cyan-300">{completed.length} ready</div>
            </div>

            <div className="mt-5 grid gap-4 xl:grid-cols-2">
              {completed.length ? (
                completed.map((item: any) => <ExportCard key={item.id} item={item} />)
              ) : (
                <div className="rounded-xl border border-border bg-black/20 p-4 text-sm text-muted">
                  No completed media exports yet.
                </div>
              )}
            </div>
          </section>

          {!!blocked.length && (
            <section className="rounded-3xl border border-red-400/30 bg-red-500/10 p-5">
              <h2 className="text-xl font-black text-white">Blocked Exports</h2>
              <p className="mt-2 text-sm text-red-100">These exports were stopped by runtime policy and need QA, identity, governance, or audit repair.</p>

              <div className="mt-5 space-y-3">
                {blocked.map((item: any) => (
                  <div key={item.id} className="rounded-2xl border border-red-400/20 bg-black/20 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="text-sm font-black text-white">{item.title || "Blocked Export"}</div>
                        <div className="mt-1 text-xs text-red-200">{item.projectType} · {item.format}</div>
                        {item.error && <p className="mt-2 text-xs text-red-100">{item.error}</p>}
                      </div>
                      <StatusPill status={item.status} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {renderJobs && (
            <section className="rounded-3xl border border-border bg-panel/70 p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-xl font-black text-white">Render Job Queue</h2>
                  <p className="mt-2 text-sm text-muted">Track queued, running, completed, and failed creator render jobs.</p>
                </div>
                <div className="text-sm text-cyan-300">{renderJobs.summary.averageProgress}% average progress</div>
              </div>

              <div className="mt-5 space-y-3">
                {renderJobs.jobs.length ? (
                  renderJobs.jobs.slice(0, 12).map((job: any) => (
                    <div key={job.id} className="rounded-2xl border border-border bg-black/20 p-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <div className="text-sm font-black text-white">
                            {job.projectType} · {job.format || "export"} · attempt {job.attempt}/{job.maxAttempts}
                          </div>
                          <div className="mt-1 font-mono text-[11px] text-muted">{job.id}</div>
                        </div>

                        <StatusPill status={job.status} />
                      </div>

                      <div className="mt-4">
                        <div className="h-3 overflow-hidden rounded-full bg-slate-900">
                          <div
                            className="h-full rounded-full bg-cyan-500"
                            style={{ width: `${Math.max(0, Math.min(100, job.progress || 0))}%` }}
                          />
                        </div>
                        <div className="mt-2 text-xs text-cyan-200">{job.progress || 0}% complete</div>
                      </div>

                      {job.error && <p className="mt-3 text-xs text-red-200">{job.error}</p>}

                      {job.status === "failed" && (
                        <form className="mt-3" action={`/api/company/${company.id}/creator-render-jobs/${job.id}/retry`} method="POST">
                          <button className="rounded-xl border border-yellow-400/30 bg-yellow-500/10 px-3 py-2 text-xs font-black text-yellow-100 hover:bg-yellow-500/20">
                            Retry Job
                          </button>
                        </form>
                      )}

                      <div className="mt-4 grid gap-2 md:grid-cols-2">
                        {job.events.slice(-4).map((event: any) => (
                          <div key={event.id} className="rounded-xl border border-border bg-slate-950 p-3">
                            <div className="text-xs font-black uppercase tracking-[0.14em] text-cyan-300">{event.type}</div>
                            <div className="mt-1 text-sm text-white">{event.progress ?? job.progress}%</div>
                            {event.message && <p className="mt-2 text-xs text-slate-300">{event.message}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-border bg-black/20 p-4 text-sm text-muted">
                    No render jobs yet.
                  </div>
                )}
              </div>
            </section>
          )}

          <section className="rounded-3xl border border-border bg-panel/70 p-5">
            <h2 className="text-xl font-black text-white">Full Export History</h2>

            <div className="mt-4 space-y-3">
              {data.exports.length ? (
                data.exports.map((item: any) => (
                  <details key={item.id} className="rounded-2xl border border-border bg-black/20 p-4">
                    <summary className="cursor-pointer text-sm font-black text-white">
                      {item.title || "Creator Export"} · {item.status} · {item.projectType} · {item.format}
                    </summary>

                    <div className="mt-4 grid gap-2 text-xs">
                      <HashRow label="ID" value={item.id} />
                      <HashRow label="Public URL" value={item.publicUrl || "none"} />
                      <HashRow label="QA Scorecard" value={item.qaScorecardId || "none"} />
                      <HashRow label="Policy Decision" value={item.policyDecisionId || "none"} />
                      <HashRow label="Manifest" value={item.metadata?.manifestPublicUrl || "none"} />
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      {item.events.map((event: any) => (
                        <div key={event.id} className="rounded-xl border border-border bg-slate-950 p-3">
                          <div className="text-xs font-black uppercase tracking-[0.14em] text-cyan-300">{event.type}</div>
                          <div className="mt-1 text-sm text-white">{event.status}</div>
                          {event.message && <p className="mt-2 text-xs text-slate-300">{event.message}</p>}
                        </div>
                      ))}
                    </div>

                    <pre className="mt-3 max-h-72 overflow-auto rounded-xl border border-border bg-slate-950 p-3 text-xs text-slate-200">
                      {JSON.stringify(item.metadata || item.manifestJson || {}, null, 2)}
                    </pre>
                  </details>
                ))
              ) : (
                <div className="rounded-xl border border-border bg-black/20 p-4 text-sm text-muted">
                  No creator exports yet.
                </div>
              )}
            </div>
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


function AudioStyleControls() {
  return (
    <div className="grid gap-3 rounded-2xl border border-border bg-black/20 p-3">
      <div className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">Audio Style</div>

      <select name="musicMood" defaultValue="cinematic" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none">
        <option value="cinematic">Cinematic</option>
        <option value="luxury">Luxury</option>
        <option value="royal">Royal</option>
        <option value="calm">Calm</option>
        <option value="dramatic">Dramatic</option>
        <option value="energetic">Energetic</option>
      </select>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1 text-xs text-muted">
          Voice Speed
          <input name="voiceSpeed" defaultValue="145" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none" />
        </label>

        <label className="grid gap-1 text-xs text-muted">
          Voice Pitch
          <input name="voicePitch" defaultValue="45" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none" />
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1 text-xs text-muted">
          Voice Volume
          <input name="voiceVolume" defaultValue="1" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none" />
        </label>

        <label className="grid gap-1 text-xs text-muted">
          Music Volume
          <input name="musicVolume" defaultValue="1" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none" />
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-200">
        <input name="introOutro" type="checkbox" value="true" defaultChecked />
        Include intro/outro bed
      </label>
    </div>
  );
}

function ExportCard({ item }: { item: any }) {
  return (
    <div className="rounded-2xl border border-border bg-black/20 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="text-sm font-black text-white">{item.title || "Creator Export"}</div>
          <div className="mt-1 text-xs text-cyan-300">
            {item.projectType} · {item.format} · {item.sizeBytes ? formatBytes(item.sizeBytes) : "size pending"}
          </div>
          <div className="mt-1 font-mono text-[11px] text-muted">{item.id}</div>
        </div>

        <StatusPill status={item.status} />
      </div>

      <div className="mt-4">
        <MediaPreview item={item} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {item.publicUrl && (
          <>
            <a
              href={item.publicUrl}
              className="rounded-xl bg-cyan-600 px-3 py-2 text-xs font-black text-white hover:bg-cyan-500"
            >
              Open
            </a>
            <a
              href={item.publicUrl}
              download
              className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-3 py-2 text-xs font-black text-cyan-100 hover:bg-cyan-500/20"
            >
              Download
            </a>
          </>
        )}

        {item.metadata?.manifestPublicUrl && (
          <a
            href={item.metadata.manifestPublicUrl}
            className="rounded-xl border border-slate-400/20 bg-slate-500/10 px-3 py-2 text-xs font-black text-slate-100 hover:bg-slate-500/20"
          >
            Manifest
          </a>
        )}
      </div>

      <div className="mt-4 grid gap-2 text-xs">
        <HashRow label="Renderer" value={item.metadata?.renderer || "none"} />
        <HashRow label="Output" value={item.metadata?.outputType || "none"} />
        <HashRow label="Policy" value={item.metadata?.policyStatus || "none"} />
        <HashRow label="Timeline" value={item.metadata?.timeline?.source || "none"} />
        <HashRow label="Scene Durations" value={item.metadata?.timeline?.sceneDurations ? item.metadata.timeline.sceneDurations.join(", ") : "none"} />
      </div>
    </div>
  );
}

function MediaPreview({ item, featured = false }: { item: any; featured?: boolean }) {
  if (!item.publicUrl) {
    return (
      <div className="rounded-2xl border border-border bg-slate-950 p-4 text-sm text-muted">
        No media URL available.
      </div>
    );
  }

  if (item.format === "mp4" || item.assetType === "video") {
    return (
      <video
        src={item.publicUrl}
        controls
        preload="metadata"
        className={`w-full rounded-2xl border border-border bg-black ${featured ? "max-h-[560px]" : "max-h-[360px]"}`}
      />
    );
  }

  if (item.format === "mp3" || item.assetType === "audio") {
    return (
      <div className="rounded-2xl border border-border bg-slate-950 p-4">
        <div className="mb-3 text-xs uppercase tracking-[0.18em] text-cyan-300">Podcast Preview</div>
        <audio src={item.publicUrl} controls preload="metadata" className="w-full" />
      </div>
    );
  }

  return (
    <a href={item.publicUrl} className="text-sm text-cyan-300 hover:underline">
      Open export
    </a>
  );
}

function StatusPill({ status }: { status: string }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-black ${
      status === "completed"
        ? "bg-emerald-600 text-white"
        : status === "blocked"
          ? "bg-red-600 text-white"
          : status === "running"
            ? "bg-yellow-600 text-white"
            : "bg-slate-700 text-white"
    }`}>
      {status}
    </span>
  );
}

function HashRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-border bg-slate-950 px-3 py-2 md:flex-row md:items-center md:justify-between">
      <span className="text-muted">{label}</span>
      <span className="break-all font-mono text-slate-200">{value}</span>
    </div>
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

function formatBytes(bytes: number) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unit = 0;

  while (value >= 1024 && unit < units.length - 1) {
    value = value / 1024;
    unit += 1;
  }

  return `${value.toFixed(value >= 10 || unit === 0 ? 0 : 1)} ${units[unit]}`;
}
