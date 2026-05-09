import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function ProjectDistributionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [project, packages] = await Promise.all([
    prisma.project.findUnique({
      where: { id },
    }),
    prisma.distributionPackage.findMany({
      where: { projectId: id },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  return (
    <main className="space-y-6">
      <div className="rounded-3xl border border-border bg-panel/70 p-6">
        <Link href={`/projects/${id}`} className="text-sm text-cyan-300 hover:underline">
          ← Back to project
        </Link>

        <p className="mt-5 text-xs uppercase tracking-[0.25em] text-blue-300">
          Sugent Distribution Layer
        </p>

        <h1 className="mt-3 text-4xl font-black text-white">
          Distribution · {project?.name || "Project"}
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
          Export, clone, and package this project for portability across Sugent OS.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={`/api/projects/${id}/export`}
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white hover:bg-blue-500"
          >
            Export Package
          </a>

          <form action={`/api/projects/${id}/clone`} method="POST">
            <button className="rounded-xl border border-blue-400/30 bg-blue-500/10 px-5 py-3 text-sm font-black text-blue-100 hover:bg-blue-500/20">
              Clone Project
            </button>
          </form>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <Metric label="Packages" value={String(packages.length)} />
        <Metric label="Project" value={id.slice(0, 10)} />
        <Metric label="Type" value="project" />
        <Metric label="Version" value="1.0.0" />
      </section>

      <section className="rounded-3xl border border-border bg-panel/70 p-5">
        <h2 className="text-xl font-black text-white">Distribution Packages</h2>

        <div className="mt-4 space-y-3">
          {packages.length ? (
            packages.map((pkg) => (
              <div key={pkg.id} className="rounded-2xl border border-border bg-black/20 p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="text-sm font-bold text-white">
                      {pkg.type} · v{pkg.version}
                    </div>
                    <div className="mt-1 text-xs text-muted">
                      Package ID: {pkg.id}
                    </div>
                  </div>

                  <div className="text-xs text-muted">
                    {new Date(pkg.createdAt).toLocaleString()}
                  </div>
                </div>

                <pre className="mt-3 max-h-80 overflow-auto rounded-xl border border-border bg-slate-950 p-3 text-xs text-slate-200">
                  {JSON.stringify(pkg.manifest, null, 2)}
                </pre>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-border bg-black/20 p-4 text-sm text-muted">
              No packages exported yet.
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
      <div className="mt-2 truncate text-xl font-black text-white">{value}</div>
    </div>
  );
}
