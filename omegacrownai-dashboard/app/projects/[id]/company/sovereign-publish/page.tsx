import Link from "next/link";
import { prisma } from "@/lib/db";
import { OmegaLogo } from "@/components/brand/OmegaLogo";
import { getSovereignPublishDashboard } from "@/lib/sugent/publish/sovereignPublishEngine";

export default async function SovereignPublishPage({
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
  const data = company ? await getSovereignPublishDashboard(company.id) : null;

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

        <p className="mt-5 text-xs uppercase tracking-[0.25em] text-emerald-300">
          Sovereign Publish Execution Layer · Phase 44
        </p>

        <h1 className="mt-3 text-4xl font-black text-white">
          Sovereign Publish · {project?.name || "Project"}
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
          Executes internal publish only after sovereign runtime policy allows, then records publish history, evidence, and audit events.
        </p>
      </section>

      {company && data ? (
        <>
          <section className="grid gap-4 md:grid-cols-5">
            <Metric label="Records" value={String(data.summary.records)} />
            <Metric label="Published" value={String(data.summary.published)} />
            <Metric label="Blocked" value={String(data.summary.blocked)} />
            <Metric label="Running" value={String(data.summary.running)} />
            <Metric label="Internal" value={String(data.summary.internal)} />
          </section>

          <section className="rounded-3xl border border-border bg-panel/70 p-5">
            <h2 className="text-xl font-black text-white">Execute Sovereign Publish</h2>

            <form
              action={`/api/company/${company.id}/sovereign-publish/execute`}
              method="POST"
              className="mt-4 grid gap-3"
            >
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  name="actorId"
                  defaultValue="system-owner"
                  className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none"
                />

                <select
                  name="projectId"
                  defaultValue=""
                  required
                  className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none"
                >
                  <option value="">Select project</option>
                  {videoProjects.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <select
                  name="projectType"
                  defaultValue="video"
                  className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none"
                >
                  <option value="video">video</option>
                  <option value="podcast">podcast</option>
                </select>

                <select
                  name="channel"
                  defaultValue="internal"
                  className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none"
                >
                  <option value="internal">internal</option>
                  <option value="youtube_ready">youtube_ready</option>
                  <option value="tiktok_ready">tiktok_ready</option>
                  <option value="instagram_ready">instagram_ready</option>
                </select>
              </div>

              <button className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-black text-white hover:bg-emerald-500">
                Execute Sovereign Publish
              </button>
            </form>
          </section>

          <section className="rounded-3xl border border-border bg-panel/70 p-5">
            <h2 className="text-xl font-black text-white">Publish History</h2>

            <div className="mt-4 space-y-3">
              {data.records.length ? (
                data.records.map((record: any) => (
                  <div key={record.id} className="rounded-2xl border border-border bg-black/20 p-4">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                      <div>
                        <div className="text-sm font-black text-white">
                          {record.title || "Sovereign Publish"}
                        </div>
                        <div className="mt-1 text-xs text-emerald-300">
                          {record.status} · {record.channel} · {record.projectType}
                        </div>
                        <div className="mt-1 font-mono text-[11px] text-muted">{record.id}</div>
                      </div>

                      <span className={`rounded-full px-3 py-1 text-xs font-black ${
                        record.status === "published"
                          ? "bg-emerald-600 text-white"
                          : record.status === "blocked"
                            ? "bg-red-600 text-white"
                            : "bg-slate-700 text-white"
                      }`}>
                        {record.status}
                      </span>
                    </div>

                    <div className="mt-4">
                      <form action={`/api/company/${company.id}/sovereign-publish/${record.id}/verify`} method="POST">
                        <button className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-xs font-black text-emerald-100 hover:bg-emerald-500/20">
                          Verify Evidence
                        </button>
                      </form>
                    </div>

                    <div className="mt-3 grid gap-2 text-xs">
                      <HashRow label="Policy Decision" value={record.policyDecisionId || "none"} />
                      <HashRow label="QA Scorecard" value={record.qaScorecardId || "none"} />
                      <HashRow label="Passport Hash" value={record.passportHash || "none"} />
                      <HashRow label="Deployment" value={record.deploymentId || "none"} />
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      {record.events.map((event: any) => (
                        <div key={event.id} className="rounded-xl border border-border bg-slate-950 p-3">
                          <div className="text-xs font-black uppercase tracking-[0.14em] text-emerald-300">
                            {event.type}
                          </div>
                          <div className="mt-1 text-sm text-white">{event.status}</div>
                          {event.message && <p className="mt-2 text-xs text-slate-300">{event.message}</p>}
                        </div>
                      ))}
                    </div>

                    <pre className="mt-3 max-h-72 overflow-auto rounded-xl border border-border bg-slate-950 p-3 text-xs text-slate-200">
                      {JSON.stringify(record.resultJson || record.publishPayloadJson || {}, null, 2)}
                    </pre>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-border bg-black/20 p-4 text-sm text-muted">
                  No publish records yet.
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
