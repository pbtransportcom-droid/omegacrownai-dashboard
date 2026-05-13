import { createScenePlan } from "@/lib/creative-super-department/creative-super-department";

const scenes = createScenePlan("OmegaCrownAI Enterprise Creative Launch");

export default function CreativeScenePlanPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-16 text-slate-900">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          OmegaCrownAI Phase 89
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Scene-Level Creative Plan
        </h1>
        <p className="mt-5 max-w-4xl text-base leading-7 text-slate-700">
          Scene planning defines the objective, visual direction, audio
          direction, duration, and required assets for every production segment.
        </p>
      </section>

      <section className="mt-8 grid gap-5">
        {scenes.map((scene) => (
          <article
            key={scene.id}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">{scene.title}</h2>
              <span className="rounded-full border border-slate-300 px-3 py-1 text-xs font-bold uppercase tracking-wide">
                {scene.durationSeconds}s
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-700">
              {scene.objective}
            </p>
            <p className="mt-4 text-sm font-semibold text-slate-700">
              Visual: {scene.visualDirection}
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-700">
              Audio: {scene.audioDirection}
            </p>
            <p className="mt-4 text-xs uppercase tracking-wide text-slate-500">
              Assets: {scene.requiredAssets.join(", ")}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}
