import fs from "fs";
import path from "path";

export default async function ArtifactHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const artifactDir = path.join(process.cwd(), "data", "generated-artifacts", id);
  const versionsDir = path.join(artifactDir, "versions");
  const runPath = path.join(process.cwd(), "data", "sovereign-runs", `${id}.json`);

  const run = fs.existsSync(runPath)
    ? JSON.parse(fs.readFileSync(runPath, "utf8"))
    : null;

  const versions = fs.existsSync(versionsDir)
    ? fs.readdirSync(versionsDir).filter((name) => /^v\d+$/.test(name)).sort()
    : [];

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <section className="mx-auto max-w-7xl">
        <div className="rounded-3xl border border-cyan-400/20 bg-cyan-500/10 p-8">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-300">
            OmegaCrownAI Artifact History
          </p>

          <h1 className="mt-4 text-5xl font-black">{id}</h1>

          <p className="mt-4 max-w-4xl text-slate-300">
            Review generated versions, previews, runtime events, and sovereign artifact lineage.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a href={`/artifacts/${id}`} className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-black text-black">
              Open Active Artifact
            </a>

            <a href={`/live-runtime?projectId=${id}`} className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-5 py-3 text-sm font-black text-emerald-100">
              Open Runtime
            </a>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-black">Artifact Versions</h2>

            <div className="mt-6 grid gap-4">
              {versions.length ? versions.map((version) => (
                <div key={version} className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-5">
                  <div className="text-xs uppercase tracking-[0.25em] text-cyan-300">
                    Generated Version
                  </div>

                  <div className="mt-2 text-3xl font-black">{version.toUpperCase()}</div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <a
                      href={`/api/artifacts/${id}/preview`}
                      className="rounded-xl bg-cyan-400 px-4 py-3 text-xs font-black text-black"
                    >
                      Open Active Preview
                    </a>

                    <a
                      href={`/api/sovereign/runs/${id}`}
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-black text-white"
                    >
                      View Run JSON
                    </a>
                  </div>
                </div>
              )) : (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-slate-300">
                  No generated versions found yet.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-black">Runtime Events</h2>

            <div className="mt-6 space-y-3">
              {(run?.events || []).slice().reverse().map((event: string, index: number) => (
                <div key={`${event}-${index}`} className="rounded-2xl border border-emerald-400/10 bg-emerald-500/10 p-4">
                  <div className="text-xs uppercase tracking-[0.25em] text-emerald-300">
                    Event
                  </div>

                  <div className="mt-2 text-sm leading-7 text-slate-200">{event}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
