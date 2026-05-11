import Link from "next/link";
import { prisma } from "@/lib/db";
import { OmegaLogo } from "@/components/brand/OmegaLogo";
import { getVersioningDashboard } from "@/lib/sugent/versioning/versionEngine";

export default async function VersioningPage({
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

  const data = company ? await getVersioningDashboard(company.id) : null;

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

        <p className="mt-5 text-xs uppercase tracking-[0.25em] text-sky-300">
          Versioning + Review · Phase 22
        </p>

        <h1 className="mt-3 text-4xl font-black text-white">
          Creative Versioning · {project?.name || "Project"}
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
          Snapshot video and podcast projects, start reviews, approve/reject versions, and keep threaded creative feedback.
        </p>
      </section>

      {company && data ? (
        <>
          <section className="grid gap-4 md:grid-cols-4 xl:grid-cols-7">
            <Metric label="Versions" value={String(data.summary.versions)} />
            <Metric label="Draft" value={String(data.summary.draft)} />
            <Metric label="In Review" value={String(data.summary.inReview)} />
            <Metric label="Approved" value={String(data.summary.approved)} />
            <Metric label="Rejected" value={String(data.summary.rejected)} />
            <Metric label="Open Threads" value={String(data.summary.openThreads)} />
            <Metric label="Resolved" value={String(data.summary.resolvedThreads)} />
          </section>

          <section className="grid gap-4 xl:grid-cols-2">
            <div className="rounded-3xl border border-border bg-panel/70 p-5">
              <h2 className="text-xl font-black text-white">Create Video Version</h2>

              <div className="mt-4 space-y-3">
                {videoProjects.length ? (
                  videoProjects.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-border bg-black/20 p-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <div className="text-sm font-black text-white">{item.title}</div>
                          <div className="mt-1 text-xs text-muted">{item.id}</div>
                        </div>

                        <form action={`/api/company/${company.id}/version/create/video/${item.id}`} method="POST">
                          <input type="hidden" name="label" value={`Video snapshot ${new Date().toISOString()}`} />
                          <button className="rounded-xl bg-sky-600 px-4 py-3 text-xs font-black text-white hover:bg-sky-500">
                            Save Version
                          </button>
                        </form>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-border bg-black/20 p-4 text-sm text-muted">
                    No video projects yet.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-panel/70 p-5">
              <h2 className="text-xl font-black text-white">Create Podcast Version</h2>

              <div className="mt-4 space-y-3">
                {podcastProjects.length ? (
                  podcastProjects.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-border bg-black/20 p-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <div className="text-sm font-black text-white">{item.title}</div>
                          <div className="mt-1 text-xs text-muted">{item.id}</div>
                        </div>

                        <form action={`/api/company/${company.id}/version/create/podcast/${item.id}`} method="POST">
                          <input type="hidden" name="label" value={`Podcast snapshot ${new Date().toISOString()}`} />
                          <button className="rounded-xl bg-sky-600 px-4 py-3 text-xs font-black text-white hover:bg-sky-500">
                            Save Version
                          </button>
                        </form>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-border bg-black/20 p-4 text-sm text-muted">
                    No podcast projects yet.
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-panel/70 p-5">
            <h2 className="text-xl font-black text-white">Versions</h2>

            <div className="mt-4 space-y-3">
              {data.versions.length ? (
                data.versions.map((version: any) => (
                  <div key={version.id} className="rounded-2xl border border-border bg-black/20 p-4">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                      <div>
                        <div className="text-sm font-black text-white">
                          {version.label || version.id}
                        </div>
                        <div className="mt-1 text-xs text-sky-300">
                          {version.projectType} · {version.status}
                        </div>
                        <div className="mt-1 font-mono text-[11px] text-muted">
                          {version.id}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {["in_review", "approved", "rejected"].map((status) => (
                          <form
                            key={status}
                            action={`/api/company/${company.id}/version/status/${version.id}`}
                            method="POST"
                          >
                            <button
                              formMethod="dialog"
                              className="hidden"
                            />
                          </form>
                        ))}

                        <a
                          href={`/api/company/${company.id}/version/detail/${version.id}`}
                          className="rounded-xl border border-sky-400/30 bg-sky-500/10 px-3 py-2 text-xs font-black text-sky-100 hover:bg-sky-500/20"
                        >
                          Open JSON
                        </a>
                      </div>
                    </div>

                    <pre className="mt-3 max-h-72 overflow-auto rounded-xl border border-border bg-slate-950 p-3 text-xs text-slate-200">
                      {JSON.stringify(version.snapshotJson, null, 2)}
                    </pre>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-border bg-black/20 p-4 text-sm text-muted">
                  No versions yet.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-panel/70 p-5">
            <h2 className="text-xl font-black text-white">Review Threads</h2>

            <div className="mt-4 space-y-3">
              {data.threads.length ? (
                data.threads.map((thread: any) => (
                  <div key={thread.id} className="rounded-2xl border border-border bg-black/20 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="text-sm font-black text-white">
                          {thread.targetType} · {thread.status}
                        </div>
                        <div className="mt-1 text-xs text-muted">
                          {thread.projectType} · {thread.projectId}
                        </div>
                        <div className="mt-1 font-mono text-[11px] text-muted">
                          {thread.id}
                        </div>
                      </div>

                      {thread.status !== "resolved" && (
                        <form action={`/api/company/${company.id}/review/thread/${thread.id}/resolve`} method="POST">
                          <button className="rounded-xl border border-sky-400/30 bg-sky-500/10 px-3 py-2 text-xs font-black text-sky-100 hover:bg-sky-500/20">
                            Resolve
                          </button>
                        </form>
                      )}
                    </div>

                    <div className="mt-3 space-y-2">
                      {thread.comments.map((comment: any) => (
                        <div key={comment.id} className="rounded-xl border border-border bg-slate-950 p-3 text-xs text-slate-200">
                          {comment.body}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-border bg-black/20 p-4 text-sm text-muted">
                  No review threads yet.
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
