import Link from "next/link";
import { prisma } from "@/lib/db";
import { OmegaLogo } from "@/components/brand/OmegaLogo";
import { getIdentityDashboard } from "@/lib/sugent/identity/platformIdentityEngine";

export default async function IdentityPage({
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
  const data = company ? await getIdentityDashboard(company.id) : null;

  const videoProjects = company
    ? await prisma.videoProject.findMany({
        where: { companyId: company.id },
        orderBy: { createdAt: "desc" },
        take: 25,
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

        <p className="mt-5 text-xs uppercase tracking-[0.25em] text-sky-300">
          Platform Identity + Anti-Clone Watermarking · Phase 35
        </p>

        <h1 className="mt-3 text-4xl font-black text-white">
          Platform Identity · {project?.name || "Project"}
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
          Invisible watermark metadata, asset fingerprints, lineage tracing, and clone detection hooks for OmegaCrownAI outputs.
        </p>
      </section>

      {company && data ? (
        <>
          <section className="grid gap-4 md:grid-cols-5">
            <Metric label="Watermarks" value={String(data.summary.watermarks)} />
            <Metric label="Fingerprints" value={String(data.summary.fingerprints)} />
            <Metric label="Clone Events" value={String(data.summary.cloneEvents)} />
            <Metric label="Matched Clones" value={String(data.summary.matchedClones)} />
            <Metric label="Active Marks" value={String(data.summary.activeWatermarks)} />
          </section>

          <section className="rounded-3xl border border-border bg-panel/70 p-5">
            <h2 className="text-xl font-black text-white">Protect Project Assets</h2>

            <form
              action={`/api/company/${company.id}/identity/protect-project`}
              method="POST"
              className="mt-4 grid gap-3 md:grid-cols-3"
            >
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
                required
                className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none"
              >
                <option value="">Select video project</option>
                {videoProjects.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
              </select>

              <button className="rounded-xl bg-sky-600 px-5 py-3 text-sm font-black text-white hover:bg-sky-500">
                Create Watermarks + Fingerprints
              </button>
            </form>
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <section className="rounded-3xl border border-border bg-panel/70 p-5">
              <h2 className="text-xl font-black text-white">Fingerprint Types</h2>
              <div className="mt-4 space-y-2">
                {Object.entries(data.fingerprintsByType).length ? (
                  Object.entries(data.fingerprintsByType).map(([type, count]) => (
                    <div key={type} className="flex justify-between rounded-xl border border-border bg-black/20 px-3 py-2 text-sm">
                      <span className="text-slate-300">{type}</span>
                      <span className="font-black text-white">{String(count)}</span>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-border bg-black/20 p-4 text-sm text-muted">
                    No fingerprint types yet.
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-3xl border border-border bg-panel/70 p-5">
              <h2 className="text-xl font-black text-white">Watermark Types</h2>
              <div className="mt-4 space-y-2">
                {Object.entries(data.watermarksByType).length ? (
                  Object.entries(data.watermarksByType).map(([type, count]) => (
                    <div key={type} className="flex justify-between rounded-xl border border-border bg-black/20 px-3 py-2 text-sm">
                      <span className="text-slate-300">{type}</span>
                      <span className="font-black text-white">{String(count)}</span>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-border bg-black/20 p-4 text-sm text-muted">
                    No watermark types yet.
                  </div>
                )}
              </div>
            </section>
          </section>

          <section className="rounded-3xl border border-border bg-panel/70 p-5">
            <h2 className="text-xl font-black text-white">Recent Watermarks</h2>

            <div className="mt-4 space-y-3">
              {data.watermarks.length ? (
                data.watermarks.map((item: any) => (
                  <div key={item.id} className="rounded-2xl border border-border bg-black/20 p-4">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                      <div>
                        <div className="text-sm font-black text-white">{item.watermarkKey}</div>
                        <div className="mt-1 text-xs text-sky-300">{item.watermarkType} · {item.status}</div>
                        <div className="mt-1 font-mono text-[11px] text-muted">{item.id}</div>
                      </div>
                      <div className="rounded-xl border border-border bg-slate-950 px-3 py-2 font-mono text-[10px] text-slate-300">
                        {item.hash.slice(0, 20)}...
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-border bg-black/20 p-4 text-sm text-muted">
                  No watermarks yet.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-panel/70 p-5">
            <h2 className="text-xl font-black text-white">Recent Fingerprints</h2>

            <div className="mt-4 space-y-3">
              {data.fingerprints.length ? (
                data.fingerprints.map((item: any) => (
                  <div key={item.id} className="rounded-2xl border border-border bg-black/20 p-4">
                    <div className="text-sm font-black text-white">{item.sourceType}</div>
                    <div className="mt-1 font-mono text-[11px] text-muted">{item.id}</div>
                    <div className="mt-2 rounded-xl border border-border bg-slate-950 px-3 py-2 font-mono text-[10px] text-slate-300">
                      fingerprint {item.fingerprint.slice(0, 32)}...
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-border bg-black/20 p-4 text-sm text-muted">
                  No fingerprints yet.
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
