import Link from "next/link";
import { prisma } from "@/lib/db";
import { OmegaLogo } from "@/components/brand/OmegaLogo";

export default async function PodcastPage({
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

  const [podcasts, campaigns] = company
    ? await Promise.all([
        prisma.podcastProject.findMany({
          where: { companyId: company.id },
          orderBy: { createdAt: "desc" },
          take: 50,
          include: {
            outline: true,
            segments: {
              orderBy: { index: "asc" },
              include: { voiceAsset: true },
            },
          },
        }),
        prisma.marketingCampaign.findMany({
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

        <p className="mt-5 text-xs uppercase tracking-[0.25em] text-purple-300">
          Native Podcast Mode · Phase 20
        </p>

        <h1 className="mt-3 text-4xl font-black text-white">
          Podcast Studio · {project?.name || "Project"}
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
          Create podcast outlines, scripts, segments, voice jobs, music jobs, and audio render jobs using the sovereign OmegaCrown AI media engine.
        </p>
      </section>

      {company ? (
        <>
          <section className="grid gap-4 md:grid-cols-4">
            <Metric label="Podcast Projects" value={String(podcasts.length)} />
            <Metric label="Segments" value={String(podcasts.reduce((sum, item) => sum + item.segments.length, 0))} />
            <Metric label="Campaigns" value={String(campaigns.length)} />
            <Metric label="Duration" value={`${podcasts.reduce((sum, item) => sum + (item.durationSeconds || 0), 0)}s`} />
          </section>

          <section className="rounded-3xl border border-border bg-panel/70 p-5">
            <h2 className="text-xl font-black text-white">Create Podcast Episode</h2>

            <form
              action={`/api/company/${company.id}/podcast/projects`}
              method="POST"
              className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5"
            >
              <input
                name="title"
                placeholder="Podcast title"
                className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none"
              />

              <input
                name="topic"
                placeholder="Topic / description"
                className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none xl:col-span-2"
              />

              <input
                name="tone"
                placeholder="Tone"
                defaultValue="premium, confident, educational"
                className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none"
              />

              <button className="rounded-xl bg-purple-600 px-5 py-3 text-sm font-black text-white hover:bg-purple-500">
                Create Podcast
              </button>
            </form>
          </section>

          <section className="rounded-3xl border border-border bg-panel/70 p-5">
            <h2 className="text-xl font-black text-white">Create Podcast from Marketing Campaign</h2>

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

                      <form action={`/api/company/${company.id}/podcast/from-campaign`} method="POST">
                        <input type="hidden" name="campaignId" value={campaign.id} />
                        <button className="rounded-xl border border-purple-400/30 bg-purple-500/10 px-4 py-3 text-xs font-black text-purple-100 hover:bg-purple-500/20">
                          Generate Podcast
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
            {podcasts.length ? (
              podcasts.map((podcast) => (
                <div key={podcast.id} className="rounded-3xl border border-border bg-panel/70 p-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h2 className="text-2xl font-black text-white">{podcast.title}</h2>
                      <p className="mt-2 text-sm text-muted">{podcast.description || "No description."}</p>
                      <p className="mt-1 font-mono text-xs text-muted">{podcast.id}</p>
                    </div>

                    <div className="rounded-xl border border-purple-400/30 bg-purple-500/10 px-3 py-2 text-xs font-bold text-purple-100">
                      {podcast.status} · {podcast.durationSeconds || 0}s
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <form action={`/api/company/${company.id}/podcast/${podcast.id}/generate-assets`} method="POST">
                      <button className="rounded-xl bg-purple-600 px-5 py-3 text-sm font-black text-white hover:bg-purple-500">
                        Generate Voice + Music Jobs
                      </button>
                    </form>

                    <form action={`/api/company/${company.id}/podcast/${podcast.id}/render`} method="POST">
                      <button className="rounded-xl border border-purple-400/30 bg-purple-500/10 px-5 py-3 text-sm font-black text-purple-100 hover:bg-purple-500/20">
                        Queue Audio Render
                      </button>
                    </form>
                  </div>

                  <div className="mt-4 grid gap-4 xl:grid-cols-3">
                    <Panel title="Outline" value={podcast.outline?.structureJson || {}} />
                    <Panel title="Segments + Scripts" value={podcast.segments} />
                    <Panel title="Voice Assets" value={podcast.segments.map((segment) => segment.voiceAsset).filter(Boolean)} />
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-border bg-black/20 p-5 text-sm text-muted">
                No podcast projects yet.
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
      <div className="text-xs font-bold uppercase tracking-[0.16em] text-purple-300">
        {title}
      </div>
      <pre className="mt-2 max-h-96 overflow-auto whitespace-pre-wrap text-xs leading-5 text-slate-200">
        {typeof value === "string" ? value : JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}
