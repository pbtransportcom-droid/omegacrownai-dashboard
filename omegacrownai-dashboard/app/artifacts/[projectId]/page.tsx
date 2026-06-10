import fs from "fs";
import path from "path";

export default async function ArtifactPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const root = process.cwd();

  const artifactDir = path.join(root, "services", "sovereign-runtime", "data", "artifacts", projectId);
  const exportPath = path.join(root, "services", "sovereign-runtime", "data", "exports", `${projectId}.json`);
  const metadataPath = path.join(artifactDir, "metadata.json");
  const readmePath = path.join(artifactDir, "README.md");

  const metadata = fs.existsSync(metadataPath)
    ? JSON.parse(fs.readFileSync(metadataPath, "utf8"))
    : null;
  const readme = fs.existsSync(readmePath)
    ? fs.readFileSync(readmePath, "utf8")
    : "No README found.";
  const delivery = fs.existsSync(exportPath)
    ? JSON.parse(fs.readFileSync(exportPath, "utf8"))
    : null;

  return (
    <main className="min-h-screen bg-black px-8 py-12 text-white">
      <section className="mx-auto max-w-6xl rounded-3xl border border-cyan-400/20 bg-cyan-950/20 p-8">
        <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">
          OmegaCrownAI Generated Artifact
        </p>
        <h1 className="mt-4 text-5xl font-black">{projectId}</h1>
        <p className="mt-4 max-w-3xl text-zinc-300">
          Customer-ready artifact package with deployed preview, downloadable ZIP, delivery manifest, runtime files, and validation proof.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <a href={`/deployed/${projectId}`} className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-black text-black">
            Open HTML Preview
          </a>
          <a href={`/live-runtime?projectId=${projectId}&intent=${metadata?.mode || "website"}`} className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-5 py-3 text-sm font-black text-emerald-100">
            Open Runtime
          </a>
          <a href={`/api/runtime-proxy/runs/${projectId}/download`} className="rounded-xl border border-indigo-400/40 bg-indigo-500/10 px-5 py-3 text-sm font-black">
            Download ZIP
          </a>
          <a href={`/projects/${projectId}/validation`} className="rounded-xl border border-zinc-700 px-5 py-3 text-sm font-black">
            Validation Proof
          </a>
        </div>
      </section>

      <section className="mx-auto mt-8 grid max-w-6xl gap-6 md:grid-cols-2">
        <article className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-2xl font-black">Metadata</h2>
          <pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap text-xs text-zinc-400">
            {JSON.stringify(metadata || {}, null, 2)}
          </pre>
        </article>

        <article className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-2xl font-black">Delivery Manifest</h2>
          <pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap text-xs text-zinc-400">
            {JSON.stringify(delivery || {}, null, 2)}
          </pre>
        </article>
      </section>

      <section className="mx-auto mt-6 max-w-6xl rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
        <h2 className="text-2xl font-black">README</h2>
        <pre className="mt-4 max-h-[520px] overflow-auto whitespace-pre-wrap text-sm leading-7 text-zinc-400">
          {readme}
        </pre>
      </section>
    </main>
  );
}
