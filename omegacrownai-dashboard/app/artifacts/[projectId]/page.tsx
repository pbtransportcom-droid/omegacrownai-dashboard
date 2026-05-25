import fs from "fs";
import path from "path";

export default async function ArtifactPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  const artifactDir = path.join(process.cwd(), "data", "generated-artifacts", projectId);
  const briefPath = path.join(artifactDir, "brief.md");
  const planPath = path.join(artifactDir, "plan.md");

  const brief = fs.existsSync(briefPath) ? fs.readFileSync(briefPath, "utf8") : "No brief found.";
  const plan = fs.existsSync(planPath) ? fs.readFileSync(planPath, "utf8") : "No plan found.";

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <section className="mx-auto max-w-6xl">
        <div className="rounded-3xl border border-cyan-400/20 bg-cyan-500/10 p-8">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-300">
            OmegaCrownAI Generated Artifact
          </p>
          <h1 className="mt-4 text-5xl font-black">{projectId}</h1>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={`/api/artifacts/${projectId}/preview`}
              className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-black text-black"
            >
              Open HTML Preview
            </a>
            <a
              href={`/live-runtime?projectId=${projectId}&intent=artifact`}
              className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-5 py-3 text-sm font-black text-emerald-100"
            >
              Open Runtime
            </a>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-black">Brief</h2>
            <pre className="mt-5 whitespace-pre-wrap text-sm leading-7 text-slate-300">{brief}</pre>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-black">Plan</h2>
            <pre className="mt-5 whitespace-pre-wrap text-sm leading-7 text-slate-300">{plan}</pre>
          </div>
        </div>
      </section>
    </main>
  );
}
