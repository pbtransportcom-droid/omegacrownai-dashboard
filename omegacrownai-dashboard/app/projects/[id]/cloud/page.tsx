import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function ProjectCloudPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [project, jobs] = await Promise.all([
    prisma.project.findUnique({
      where: { id },
    }),
    prisma.cloudJob.findMany({
      where: { projectId: id },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  return (
    <main className="space-y-6">
      <div className="rounded-3xl border border-border bg-panel/70 p-6">
        <Link href={`/projects/${id}`} className="text-sm text-cyan-300 hover:underline">
          ← Back to project
        </Link>

        <p className="mt-5 text-xs uppercase tracking-[0.25em] text-cyan-300">
          Sugent Cloud
        </p>

        <h1 className="mt-3 text-4xl font-black text-white">
          Cloud Jobs · {project?.name || "Project"}
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
          Inspect queued, running, successful, and blocked Sugent Cloud jobs for this project.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <Metric label="Total Jobs" value={String(jobs.length)} />
        <Metric label="Queued" value={String(jobs.filter((j) => j.status === "queued").length)} />
        <Metric label="Success" value={String(jobs.filter((j) => j.status === "success").length)} />
        <Metric label="Errors" value={String(jobs.filter((j) => j.status === "error").length)} />
      </section>

      <section className="rounded-3xl border border-border bg-panel/70 p-5">
        <h2 className="text-xl font-black text-white">Jobs</h2>

        <div className="mt-4 space-y-3">
          {jobs.length ? (
            jobs.map((job) => (
              <div key={job.id} className="rounded-2xl border border-border bg-black/20 p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="text-sm font-bold text-white">
                      {job.type} · {job.status}
                    </div>
                    <div className="mt-1 text-xs text-muted">
                      Job ID: {job.id}
                    </div>
                    {job.buildId && (
                      <div className="mt-1 text-xs text-muted">
                        Build ID: {job.buildId}
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-muted">
                    {new Date(job.createdAt).toLocaleString()}
                  </div>
                </div>

                <pre className="mt-3 max-h-72 overflow-auto rounded-xl border border-border bg-slate-950 p-3 text-xs text-slate-200">
                  {JSON.stringify(job.result || job.payload || {}, null, 2)}
                </pre>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-border bg-black/20 p-4 text-sm text-muted">
              No cloud jobs yet.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-black/20 p-4">
      <div className="text-xs uppercase tracking-[0.18em] text-muted">{label}</div>
      <div className="mt-2 text-2xl font-black text-white">{value}</div>
    </div>
  );
}
