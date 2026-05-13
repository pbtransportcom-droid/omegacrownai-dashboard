import { releaseNotes } from "@/lib/release-readiness/production-release-readiness";

export default function ReleaseNotesPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-16 text-slate-900">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          OmegaCrownAI Phase 94
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Production Release Notes
        </h1>
        <p className="mt-5 max-w-4xl text-base leading-7 text-slate-700">
          Release notes summarize the completed v6.3 through v7.1 architecture
          arc and the customer-facing routes added across identity, policy,
          spine, reliability, distribution, creative, executive, marketplace,
          and Project OS layers.
        </p>
      </section>

      <section className="mt-8 grid gap-5">
        {releaseNotes.map((note) => (
          <article
            key={note.phase}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">
              {note.phase}
            </p>
            <h2 className="mt-2 text-xl font-semibold">{note.title}</h2>
            <p className="mt-4 text-sm leading-6 text-slate-700">
              {note.summary}
            </p>
            <p className="mt-4 text-xs uppercase tracking-wide text-slate-500">
              Routes: {note.routes.join(", ")}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}
