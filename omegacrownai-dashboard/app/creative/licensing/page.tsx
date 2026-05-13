import {
  createAssetJobs,
  createScenePlan,
  runLicensingChecks
} from "@/lib/creative-super-department/creative-super-department";

const scenes = createScenePlan("OmegaCrownAI Enterprise Creative Launch");
const assetJobs = createAssetJobs(scenes);
const checks = runLicensingChecks(assetJobs);

export default function CreativeLicensingPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-16 text-slate-900">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          OmegaCrownAI Phase 89
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Creative Licensing Controls
        </h1>
        <p className="mt-5 max-w-4xl text-base leading-7 text-slate-700">
          Licensing controls protect OmegaCrownAI by requiring review of voice,
          B-roll, music, sound effects, likeness, provider rights, and commercial
          usage before publishing.
        </p>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2">
        {checks.map((check) => (
          <article
            key={check.id}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">{check.assetType}</h2>
              <span className="rounded-full border border-slate-300 px-3 py-1 text-xs font-bold uppercase tracking-wide">
                {check.status}
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-700">
              {check.requirement}
            </p>
            <p className="mt-4 text-sm font-semibold leading-6 text-slate-700">
              {check.companyProtectiveNote}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}
