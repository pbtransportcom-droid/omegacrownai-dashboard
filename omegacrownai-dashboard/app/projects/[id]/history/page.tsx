import Link from "next/link";
import { prisma } from "@/lib/db";
import { diffJson } from "@/lib/sugent/core/diff";

export default async function ProjectHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
  });

  const artifacts = await prisma.projectBuildArtifact.findMany({
    where: { projectId: id },
    orderBy: { createdAt: "asc" },
  });

  const pairs = [];
  for (let i = 1; i < artifacts.length; i++) {
    pairs.push({
      from: artifacts[i - 1],
      to: artifacts[i],
      diff: diffJson(artifacts[i - 1].payload, artifacts[i].payload),
    });
  }

  return (
    <main className="space-y-6">
      <div className="rounded-3xl border border-border bg-panel/70 p-6">
        <Link href={`/projects/${id}`} className="text-sm text-cyan-300 hover:underline">
          ← Back to project
        </Link>

        <p className="mt-5 text-xs uppercase tracking-[0.25em] text-violet-300">
          Sugent OS Time Machine
        </p>

        <h1 className="mt-3 text-4xl font-black text-white">
          History · {project?.name || "Project"}
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
          Inspect draft artifact changes over time.
        </p>
      </div>

      <section className="rounded-3xl border border-border bg-panel/70 p-5">
        <h2 className="text-xl font-black text-white">
          Artifact Versions
        </h2>

        <div className="mt-4 space-y-3">
          {artifacts.length ? (
            artifacts.map((artifact, index) => (
              <div key={artifact.id} className="rounded-2xl border border-border bg-black/20 p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="text-sm font-bold text-white">
                      Version {index + 1} · {artifact.kind}
                    </div>
                    <div className="mt-1 text-xs text-muted">
                      Artifact ID: {artifact.id}
                    </div>
                  </div>
                  <div className="text-xs text-muted">
                    {new Date(artifact.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-border bg-black/20 p-4 text-sm text-muted">
              No artifacts yet.
            </div>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-panel/70 p-5">
        <h2 className="text-xl font-black text-white">
          Draft Diffs
        </h2>

        <div className="mt-4 space-y-3">
          {pairs.length ? (
            pairs.map((pair) => (
              <div key={pair.to.id} className="rounded-2xl border border-border bg-black/20 p-4">
                <div className="text-sm font-bold text-white">
                  {pair.from.kind} → {pair.to.kind}
                </div>
                <div className="mt-1 text-xs text-muted">
                  {new Date(pair.from.createdAt).toLocaleString()} →{" "}
                  {new Date(pair.to.createdAt).toLocaleString()}
                </div>

                <pre className="mt-3 max-h-96 overflow-auto rounded-xl border border-border bg-slate-950 p-3 text-xs text-slate-200">
                  {JSON.stringify(pair.diff, null, 2)}
                </pre>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-border bg-black/20 p-4 text-sm text-muted">
              No diffs yet. Save another draft version to compare changes.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
