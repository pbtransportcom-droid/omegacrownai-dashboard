import fs from "fs";
import path from "path";

export default async function ValidationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const root = process.cwd();

  const checks = [
    ["Run record", path.join(root, "data", "sovereign-runs", `${id}.json`)],
    ["Active artifact", path.join(root, "data", "generated-artifacts", id, "index.html")],
    ["Artifact metadata", path.join(root, "data", "generated-artifacts", id, "metadata.json")],
    ["Project build HTML", path.join(root, "data", "project-builds", id, "index.html")],
    ["Project build CSS", path.join(root, "data", "project-builds", id, "styles.css")],
    ["Export ZIP", path.join(root, "data", "exports", `${id}.zip`)],
  ];

  const results = checks.map(([label, filePath]) => ({
    label,
    filePath,
    exists: fs.existsSync(filePath),
    size: fs.existsSync(filePath) ? fs.statSync(filePath).size : 0,
  }));

  const passed = results.filter((r) => r.exists).length;
  const failed = results.length - passed;

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <section className="mx-auto max-w-6xl">
        <div className="rounded-3xl border border-emerald-400/20 bg-emerald-500/10 p-8">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-300">
            OmegaCrownAI Validation Proof
          </p>
          <h1 className="mt-4 text-5xl font-black">{id}</h1>
          <p className="mt-4 text-slate-300">
            {passed}/{results.length} production checks passed. Failed: {failed}.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a href={`/artifacts/${id}`} className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-black text-black">
              Open Artifact
            </a>
            <a href={`/projects/${id}/artifacts/history`} className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black">
              Artifact History
            </a>
            <a href={`/api/sovereign/download/${id}`} className="rounded-xl border border-purple-400/30 bg-purple-500/10 px-5 py-3 text-sm font-black text-purple-100">
              Download ZIP
            </a>
          </div>
        </div>

        <div className="mt-8 grid gap-4">
          {results.map((item) => (
            <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-xl font-black">{item.label}</div>
                  <div className="mt-2 text-sm text-slate-400">{item.filePath}</div>
                </div>
                <div className={item.exists ? "text-emerald-300 font-black" : "text-red-300 font-black"}>
                  {item.exists ? "PASS" : "FAIL"}
                </div>
              </div>
              <div className="mt-3 text-sm text-slate-300">Size: {item.size} bytes</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
