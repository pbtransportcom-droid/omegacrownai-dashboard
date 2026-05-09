import { BUILDER_LIST } from "@/lib/sugent/builder/registry";

export default function BuilderLauncher() {
  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-border bg-panel/70 p-6">
        <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">
          Sugent OS
        </p>
        <h1 className="mt-3 text-4xl font-black text-white">
          Unified Builder Launcher
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted">
          Create and open websites, trading strategies, and automation flows from one
          operating system. Each builder uses the same Project to Build to Artifact structure.
        </p>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {BUILDER_LIST.map((builder) => {
          const color =
            builder.accent === "emerald"
              ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-100"
              : builder.accent === "violet"
                ? "border-violet-500/25 bg-violet-500/10 text-violet-100"
                : "border-cyan-500/25 bg-cyan-500/10 text-cyan-100";

          const button =
            builder.accent === "emerald"
              ? "bg-emerald-600 hover:bg-emerald-500"
              : builder.accent === "violet"
                ? "bg-violet-600 hover:bg-violet-500"
                : "bg-cyan-600 hover:bg-cyan-500";

          return (
            <div key={builder.id} className={`rounded-3xl border p-5 ${color}`}>
              <div className="text-xs uppercase tracking-[0.22em] opacity-80">
                {builder.draftKind}
              </div>

              <h2 className="mt-3 text-2xl font-black text-white">
                {builder.label}
              </h2>

              <p className="mt-3 min-h-20 text-sm leading-7 text-white/70">
                {builder.description}
              </p>

              <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-white/50">
                  Example command
                </div>
                <div className="mt-2 text-sm text-white">
                  “{builder.examplePrompt}”
                </div>
              </div>

              <a
                href="/chat"
                className={`mt-5 inline-flex w-full justify-center rounded-xl px-5 py-3 text-sm font-black text-white ${button}`}
              >
                Create with Super Agent
              </a>
            </div>
          );
        })}
      </section>

      <section className="rounded-3xl border border-cyan-500/25 bg-cyan-500/10 p-6">
        <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">
          Live Runtime
        </p>
        <h2 className="mt-2 text-2xl font-black text-white">
          Sugent Runtime Console
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-white/70">
          Stream agent messages, tool calls, builder updates, and cloud job updates in real time.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a
            href="/runtime"
            className="inline-flex rounded-xl bg-cyan-600 px-5 py-3 text-sm font-black text-white hover:bg-cyan-500"
          >
            Open Runtime Console
          </a>

          <a
            href="/agents"
            className="inline-flex rounded-xl border border-violet-400/30 bg-violet-500/10 px-5 py-3 text-sm font-black text-violet-100 hover:bg-violet-500/20"
          >
            Open Agent Room
          </a>
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-black/20 p-6">
        <h2 className="text-xl font-bold text-white">Builder routing</h2>
        <div className="mt-4 grid gap-3 text-sm text-muted md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-panel/60 p-4">
            /build/website/:projectId
          </div>
          <div className="rounded-2xl border border-border bg-panel/60 p-4">
            /build/trading/:projectId
          </div>
          <div className="rounded-2xl border border-border bg-panel/60 p-4">
            /build/automation/:projectId
          </div>
        </div>
      </section>
    </div>
  );
}
