import {
  createAssetLibrary,
  createProject
} from "@/lib/project-os/unified-project-os";

const project = createProject();
const assets = createAssetLibrary(project);

export default function ProjectOSAssetsPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-16 text-slate-900">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          OmegaCrownAI Phase 92
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Asset Library
        </h1>
        <p className="mt-5 max-w-4xl text-base leading-7 text-slate-700">
          Asset Library tracks executive reports, creative packages,
          distribution variants, marketplace reports, generated files, and
          project artifacts.
        </p>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2">
        {assets.map((asset) => (
          <article
            key={asset.id}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">{asset.name}</h2>
              <span className="rounded-full border border-slate-300 px-3 py-1 text-xs font-bold uppercase tracking-wide">
                {asset.status}
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-700">
              Source: {asset.source}
            </p>
            <p className="mt-4 break-all text-xs leading-6 text-slate-500">
              Hash: {asset.hash}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}
