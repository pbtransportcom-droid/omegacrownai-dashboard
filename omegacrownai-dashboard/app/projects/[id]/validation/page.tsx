import fs from "fs";
import path from "path";
import Link from "next/link";

function checkPath(label: string, candidates: string[]) {
  const file = candidates.find((candidate) => fs.existsSync(candidate)) || candidates[0];
  const exists = fs.existsSync(file);
  const stat = exists ? fs.statSync(file) : null;

  return {
    label,
    file,
    ok: Boolean(stat && (stat.isDirectory() || stat.size > 0)),
    size: stat ? stat.size : 0,
  };
}

export default async function ProjectValidationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const root = process.cwd();

  const results = [
    checkPath("Runtime metadata", [
      path.join(root, "services", "sovereign-runtime", "data", "artifacts", id, "metadata.json"),
      path.join(root, "data", "generated-artifacts", id, "metadata.json"),
    ]),
    checkPath("Runtime HTML preview", [
      path.join(root, "services", "sovereign-runtime", "data", "artifacts", id, "index.html"),
      path.join(root, "public", "runtime-deployments", id, "index.html"),
      path.join(root, "data", "generated-artifacts", id, "index.html"),
    ]),
    checkPath("Runtime stylesheet", [
      path.join(root, "services", "sovereign-runtime", "data", "artifacts", id, "styles.css"),
      path.join(root, "public", "runtime-deployments", id, "styles.css"),
      path.join(root, "data", "project-builds", id, "styles.css"),
    ]),
    checkPath("Delivery manifest", [
      path.join(root, "services", "sovereign-runtime", "data", "exports", `${id}.json`),
      path.join(root, "data", "exports", `${id}.json`),
    ]),
    checkPath("Deployment record", [
      path.join(root, "services", "sovereign-runtime", "data", "deployments", `${id}.json`),
    ]),
    checkPath("Artifact directory", [
      path.join(root, "services", "sovereign-runtime", "data", "artifacts", id),
    ]),
  ];

  const passed = results.filter((result) => result.ok).length;
  const failed = results.length - passed;

  return (
    <main className="min-h-screen bg-black px-8 py-12 text-white">
      <section className="mx-auto max-w-5xl rounded-3xl border border-emerald-400/20 bg-emerald-950/20 p-8">
        <p className="text-sm uppercase tracking-[0.35em] text-emerald-300">
          OmegaCrownAI Validation Proof
        </p>
        <h1 className="mt-4 text-5xl font-black">{id}</h1>
        <p className="mt-3 text-zinc-300">
          {passed}/{results.length} current runtime checks passed. Failed: {failed}.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={`/deployed/${id}`} className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-black text-black">
            Open Artifact
          </Link>
          <Link href={`/artifacts/${id}`} className="rounded-xl border border-zinc-700 px-5 py-3 text-sm font-black">
            Artifact History
          </Link>
          <Link href={`/api/runtime-proxy/runs/${id}/download`} className="rounded-xl border border-indigo-400/40 bg-indigo-500/10 px-5 py-3 text-sm font-black">
            Download ZIP
          </Link>
        </div>
      </section>

      <section className="mx-auto mt-8 grid max-w-5xl gap-4">
        {results.map((result) => (
          <article key={result.label} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black">{result.label}</h2>
                <p className="mt-2 break-all text-sm text-zinc-500">{result.file}</p>
                <p className="mt-3 text-sm text-zinc-400">Size: {result.size} bytes</p>
              </div>
              <span className={result.ok ? "text-sm font-black text-emerald-300" : "text-sm font-black text-red-300"}>
                {result.ok ? "PASS" : "FAIL"}
              </span>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
