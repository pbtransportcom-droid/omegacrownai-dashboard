import Link from "next/link";
import { prisma } from "@/lib/db";
import { OmegaLogo } from "@/components/brand/OmegaLogo";
import {
  ensureDefaultDistributionTargets,
  getDistributionDashboard,
} from "@/lib/sugent/distribution/distributionEngine";

export default async function DistributionPage({
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

  const data = company
    ? await (async () => {
        await ensureDefaultDistributionTargets(company.id);
        return getDistributionDashboard(company.id);
      })()
    : null;

  const assets = company
    ? await prisma.videoAsset.findMany({
        where: {
          project: {
            companyId: company.id,
          },
          type: {
            in: ["rendered_video", "rendered_audio", "generated_voice", "generated_music", "generated_clip"],
          },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          project: true,
        },
      })
    : [];

  return (
    <main className="space-y-6">
      <div className="flex justify-center">
        <OmegaLogo className="h-16 w-auto object-contain" />
      </div>

      <section className="rounded-3xl border border-border bg-panel/70 p-6">
        <Link href={`/projects/${id}/company/executive`} className="text-sm text-cyan-300 hover:underline">
          ← Back to Executive Command Center
        </Link>

        <p className="mt-5 text-xs uppercase tracking-[0.25em] text-emerald-300">
          Distribution + Automation · Phase 21
        </p>

        <h1 className="mt-3 text-4xl font-black text-white">
          Distribution Studio · {project?.name || "Project"}
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
          Create publish targets, schedule publish jobs, and move rendered video/podcast assets into internal library, RSS, YouTube, or social distribution pipelines.
        </p>
      </section>

      {company && data ? (
        <>
          <section className="grid gap-4 md:grid-cols-5">
            <Metric label="Targets" value={String(data.summary.targets)} />
            <Metric label="Jobs" value={String(data.summary.jobs)} />
            <Metric label="Queued" value={String(data.summary.queued)} />
            <Metric label="Completed" value={String(data.summary.completed)} />
            <Metric label="Failed" value={String(data.summary.failed)} />
          </section>

          <section className="rounded-3xl border border-border bg-panel/70 p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-black text-white">Distribution Targets</h2>
                <p className="mt-1 text-sm text-muted">Default sovereign targets are created automatically.</p>
              </div>

              <form action={`/api/company/${company.id}/distribution/auto-publish`} method="POST">
                <button className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-black text-white hover:bg-emerald-500">
                  Auto-Publish Latest Assets
                </button>
              </form>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {data.targets.map((target: any) => (
                <div key={target.id} className="rounded-2xl border border-border bg-black/20 p-4">
                  <div className="text-sm font-black text-white">{target.label}</div>
                  <div className="mt-1 text-xs text-emerald-300">{target.type}</div>
                  <div className="mt-1 text-xs text-muted">{target.status}</div>
                  <div className="mt-2 font-mono text-[11px] text-muted">{target.id}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-panel/70 p-5">
            <h2 className="text-xl font-black text-white">Publish Assets</h2>

            <div className="mt-4 space-y-3">
              {assets.length ? (
                assets.map((asset) => (
                  <div key={asset.id} className="rounded-2xl border border-border bg-black/20 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="text-sm font-black text-white">{asset.label}</div>
                        <div className="mt-1 text-xs text-muted">
                          {asset.type} · {asset.format || "unknown"} · {asset.storageKey || "no storage key"}
                        </div>
                        <div className="mt-1 font-mono text-[11px] text-muted">{asset.id}</div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {data.targets.map((target: any) => (
                          <form
                            key={target.id}
                            action={`/api/company/${company.id}/distribution/publish-jobs`}
                            method="POST"
                          >
                            <input type="hidden" name="assetId" value={asset.id} />
                            <input type="hidden" name="targetId" value={target.id} />
                            <button className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-xs font-black text-emerald-100 hover:bg-emerald-500/20">
                              Publish to {target.type}
                            </button>
                          </form>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-border bg-black/20 p-4 text-sm text-muted">
                  No rendered or generated assets available for publishing yet.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-panel/70 p-5">
            <h2 className="text-xl font-black text-white">Publish Jobs</h2>

            <div className="mt-4 space-y-3">
              {data.jobs.length ? (
                data.jobs.map((job: any) => (
                  <div key={job.id} className="rounded-2xl border border-border bg-black/20 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="text-sm font-black text-white">
                          {job.target?.label || "Target"} · {job.status}
                        </div>
                        <div className="mt-1 text-xs text-muted">
                          {job.asset?.label || job.assetId}
                        </div>
                        <div className="mt-1 text-xs text-emerald-300">
                          externalId: {job.externalId || "pending"}
                        </div>
                      </div>

                      <pre className="max-h-40 overflow-auto rounded-xl border border-border bg-slate-950 p-3 text-xs text-slate-200">
                        {JSON.stringify(job.metadata || {}, null, 2)}
                      </pre>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-border bg-black/20 p-4 text-sm text-muted">
                  No publish jobs yet.
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

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-black/20 p-4">
      <div className="text-xs uppercase tracking-[0.18em] text-muted">{label}</div>
      <div className="mt-2 truncate text-xl font-black text-white">{value}</div>
    </div>
  );
}
