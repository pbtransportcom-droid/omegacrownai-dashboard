import Link from "next/link";
import { prisma } from "@/lib/db";
import { OmegaLogo } from "@/components/brand/OmegaLogo";
import { getCreatorExportDashboard } from "@/lib/sugent/creator-export/creatorExportEngine";

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
          Native Creator Product Completion · v3.0 Phase 46
        </p>

        <h1 className="mt-3 text-4xl font-black text-white">
          Creator Exports · {project?.name || "Project"}
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
          Generate video and podcast export records after runtime policy allows. This phase renders real MP4 scene-card videos with placeholder voiceover cues, a background audio bed, AAC audio mixing, and export history.
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

          <section className="grid gap-6 xl:grid-cols-2">
            <section className="rounded-3xl border border-border bg-panel/70 p-5">
              <h2 className="text-xl font-black text-white">Export Video</h2>

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

                <button className="rounded-xl bg-cyan-600 px-5 py-3 text-sm font-black text-white hover:bg-cyan-500">
                  Create Video Export
                </button>
              </form>
            </section>

            <section className="rounded-3xl border border-border bg-panel/70 p-5">
              <h2 className="text-xl font-black text-white">Export Podcast</h2>

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

                <button className="rounded-xl bg-cyan-600 px-5 py-3 text-sm font-black text-white hover:bg-cyan-500">
                  Create Podcast Export
                </button>
              </form>
            </section>
          </section>

          <section className="rounded-3xl border border-border bg-panel/70 p-5">
            <h2 className="text-xl font-black text-white">Export History</h2>

            <div className="mt-4 space-y-3">
              {data.exports.length ? (
                data.exports.map((item: any) => (
                  <div key={item.id} className="rounded-2xl border border-border bg-black/20 p-4">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                      <div>
                        <div className="text-sm font-black text-white">{item.title || "Creator Export"}</div>
                        <div className="mt-1 text-xs text-cyan-300">
                          {item.status} · {item.projectType} · {item.format}
                        </div>
                        <div className="mt-1 font-mono text-[11px] text-muted">{item.id}</div>
                      </div>

                      <span className={`rounded-full px-3 py-1 text-xs font-black ${
                        item.status === "completed"
                          ? "bg-emerald-600 text-white"
                          : item.status === "blocked"
                            ? "bg-red-600 text-white"
                            : "bg-slate-700 text-white"
                      }`}>
                        {item.status}
                      </span>
                    </div>

                    <div className="mt-3 grid gap-2 text-xs">
                      <HashRow label="Public URL" value={item.publicUrl || "none"} />
                      <HashRow label="QA Scorecard" value={item.qaScorecardId || "none"} />
                      <HashRow label="Policy Decision" value={item.policyDecisionId || "none"} />
                    </div>

                    {item.publicUrl && (
                      <a
                        href={item.publicUrl}
                        className="mt-4 inline-flex rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-3 py-2 text-xs font-black text-cyan-100 hover:bg-cyan-500/20"
                      >
                        Open Export
                      </a>
                    )}

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
                      {JSON.stringify(item.manifestJson || item.metadata || {}, null, 2)}
                    </pre>
                  </div>
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
