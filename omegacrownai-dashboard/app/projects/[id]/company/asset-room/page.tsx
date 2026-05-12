import Link from "next/link";
import { prisma } from "@/lib/db";
import { OmegaLogo } from "@/components/brand/OmegaLogo";
import { listAssetRoomSessions } from "@/lib/sugent/asset-room/assetRoomEngine";

export default async function AssetRoomPage({
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
  const data = company ? await listAssetRoomSessions(company.id) : null;

  const [videoProjects, podcastProjects] = company
    ? await Promise.all([
        prisma.videoProject.findMany({
          where: { companyId: company.id },
          orderBy: { createdAt: "desc" },
          take: 25,
          include: {
            scenes: true,
            assets: true,
          },
        }),
        prisma.podcastProject.findMany({
          where: { companyId: company.id },
          orderBy: { createdAt: "desc" },
          take: 25,
          include: {
            segments: true,
          },
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

        <p className="mt-5 text-xs uppercase tracking-[0.25em] text-lime-300">
          Multi-Agent Asset Generator Room · Phase 34
        </p>

        <h1 className="mt-3 text-4xl font-black text-white">
          Asset Generator Room · {project?.name || "Project"}
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
          Multi-agent generation planning for image, video, avatar, voice, and music assets with prompt accuracy and production-quality coordination.
        </p>
      </section>

      {company && data ? (
        <>
          <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
            <Metric label="Sessions" value={String(data.summary.total)} />
            <Metric label="Open" value={String(data.summary.open)} />
            <Metric label="Consensus" value={String(data.summary.consensus)} />
            <Metric label="Queued" value={String(data.summary.queued)} />
            <Metric label="Video" value={String(data.summary.video)} />
            <Metric label="Podcast" value={String(data.summary.podcast)} />
          </section>

          <section className="rounded-3xl border border-border bg-panel/70 p-5">
            <h2 className="text-xl font-black text-white">Start Asset Generator Room</h2>

            <form
              action={`/api/company/${company.id}/asset-room`}
              method="POST"
              className="mt-4 grid gap-3"
            >
              <div className="grid gap-3 md:grid-cols-3">
                <select
                  name="projectType"
                  defaultValue="video"
                  className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none"
                >
                  <option value="video">Video</option>
                  <option value="podcast">Podcast</option>
                </select>

                <select
                  name="projectId"
                  defaultValue=""
                  className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none md:col-span-2"
                >
                  <option value="">No attached project</option>
                  <optgroup label="Videos">
                    {videoProjects.map((item: any) => (
                      <option key={item.id} value={item.id}>
                        Video · {item.title} · scenes {item.scenes.length} · assets {item.assets.length}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Podcasts">
                    {podcastProjects.map((item: any) => (
                      <option key={item.id} value={item.id}>
                        Podcast · {item.title} · segments {item.segments.length}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <input
                name="topic"
                placeholder="Topic, e.g. Generate production assets for launch video"
                className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none"
              />

              <button className="rounded-xl bg-lime-600 px-5 py-3 text-sm font-black text-white hover:bg-lime-500">
                Start Asset Planning
              </button>
            </form>
          </section>

          <section className="space-y-4">
            {data.sessions.length ? (
              data.sessions.map((session: any) => {
                const latestRound = session.rounds?.[0];
                const plan = latestRound?.assetPlanJson || {};
                const queueItems = plan.queueItems || [];

                return (
                  <div key={session.id} className="rounded-3xl border border-border bg-panel/70 p-5">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                      <div>
                        <h2 className="text-2xl font-black text-white">{session.topic}</h2>
                        <p className="mt-1 text-xs text-lime-300">{session.status} · {session.projectType}</p>
                        <p className="mt-1 font-mono text-[11px] text-muted">{session.id}</p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <form action={`/api/company/${company.id}/asset-room/${session.id}/next-round`} method="POST">
                          <button className="rounded-xl border border-lime-400/30 bg-lime-500/10 px-3 py-2 text-xs font-black text-lime-100 hover:bg-lime-500/20">
                            Run Next Round
                          </button>
                        </form>

                        <form action={`/api/company/${company.id}/asset-room/${session.id}/enqueue-plan`} method="POST">
                          <button className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-3 py-2 text-xs font-black text-cyan-100 hover:bg-cyan-500/20">
                            Enqueue Asset Plan
                          </button>
                        </form>

                        <a
                          href={`/api/company/${company.id}/asset-room/${session.id}`}
                          className="rounded-xl border border-border bg-black/20 px-3 py-2 text-xs font-black text-white hover:bg-black/40"
                        >
                          Open JSON
                        </a>
                      </div>
                    </div>

                    {latestRound ? (
                      <div className="mt-5 grid gap-4 xl:grid-cols-6">
                        <Panel title="Source Snapshot" value={JSON.stringify(latestRound.sourceJson, null, 2)} wide />
                        {["image", "video", "avatar", "voice", "music"].map((agent) => {
                          const msg = latestRound.messages?.find((m: any) => m.agentType === agent);
                          return (
                            <Panel
                              key={agent}
                              title={`${agent} agent`}
                              value={msg?.content || "No message yet."}
                            />
                          );
                        })}
                        <Panel title="Coordinator Summary" value={latestRound.summary || "Waiting for coordinator."} wide />
                        <Panel title="Asset Plan" value={JSON.stringify(plan.assetPlan || [], null, 2)} wide />
                        <Panel title={`Queue Items (${queueItems.length})`} value={JSON.stringify(queueItems, null, 2)} wide />
                      </div>
                    ) : (
                      <div className="mt-4 rounded-xl border border-border bg-black/20 p-4 text-sm text-muted">
                        No rounds yet.
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="rounded-xl border border-border bg-black/20 p-4 text-sm text-muted">
                No Asset Generator Room sessions yet.
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

function Panel({
  title,
  value,
  wide = false,
}: {
  title: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div className={`rounded-2xl border border-border bg-black/20 p-4 ${wide ? "xl:col-span-3" : "xl:col-span-1"}`}>
      <div className="text-xs font-black uppercase tracking-[0.16em] text-lime-300">
        {title}
      </div>
      <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap text-xs leading-5 text-slate-200">
        {value}
      </pre>
    </div>
  );
}
