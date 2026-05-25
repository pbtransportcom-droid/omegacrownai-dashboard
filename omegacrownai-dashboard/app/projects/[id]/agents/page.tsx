import fs from "fs";
import path from "path";

export default async function ProjectAgentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const runPath = path.join(process.cwd(), "data", "sovereign-runs", `${id}.json`);
  const memoryPath = path.join(process.cwd(), "data", "runtime-memory", id, "shared-memory.json");
  const exportPath = path.join(process.cwd(), "data", "exports", `${id}.zip`);

  const run = fs.existsSync(runPath)
    ? JSON.parse(fs.readFileSync(runPath, "utf8"))
    : null;

  const memory = fs.existsSync(memoryPath)
    ? JSON.parse(fs.readFileSync(memoryPath, "utf8"))
    : null;

  const agents = run?.agents || memory?.agentHandoffs || [];

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <section className="mx-auto max-w-7xl">
        <div className="rounded-3xl border border-cyan-400/20 bg-cyan-500/10 p-8">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-300">
            OmegaCrownAI Agent Collaboration Room
          </p>
          <h1 className="mt-4 text-5xl font-black">{id}</h1>
          <p className="mt-4 max-w-4xl text-slate-300">
            Planner, Architect, Builder, Validator, and Delivery agents collaborate through shared runtime memory,
            artifact generation, validation proof, and export delivery.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a href={`/live-runtime?projectId=${id}`} className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-black text-black">
              Open Runtime
            </a>
            <a href={`/projects/${id}/validation`} className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-5 py-3 text-sm font-black text-emerald-100">
              Validation Proof
            </a>
            <a href={`/artifacts/${id}`} className="rounded-xl border border-purple-400/30 bg-purple-500/10 px-5 py-3 text-sm font-black text-purple-100">
              Open Artifact
            </a>
            <a href={`/api/sovereign/download/${id}`} className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-5 py-3 text-sm font-black text-amber-100">
              Download ZIP
            </a>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.75fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-black">Agent Handoff Chain</h2>

            <div className="mt-6 grid gap-4">
              {agents.length ? agents.map((agent: any, index: number) => (
                <div key={`${agent.name}-${index}`} className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-xs uppercase tracking-[0.25em] text-cyan-300">
                        Step {index + 1}
                      </div>
                      <h3 className="mt-2 text-2xl font-black">{agent.name}</h3>
                    </div>
                    <div className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-xs font-black text-emerald-200">
                      Completed
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-7 text-slate-300">
                    <strong>Role:</strong> {agent.role}
                  </p>

                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    <strong>Output:</strong> {agent.output}
                  </p>

                  {index < agents.length - 1 && (
                    <div className="mt-5 text-xs font-black uppercase tracking-[0.25em] text-slate-500">
                      Handoff → {agents[index + 1]?.name}
                    </div>
                  )}
                </div>
              )) : (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-slate-300">
                  No agent collaboration record found yet. Run sovereign orchestration first.
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-6">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-2xl font-black">Shared Runtime Memory</h2>
              <div className="mt-4 rounded-2xl border border-white/10 bg-black/40 p-4">
                <pre className="whitespace-pre-wrap text-xs leading-6 text-slate-300">
{JSON.stringify(memory || { status: "No shared memory found." }, null, 2)}
                </pre>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-2xl font-black">Delivery State</h2>

              <div className="mt-5 grid gap-3 text-sm">
                <div className="flex justify-between rounded-xl bg-white/5 p-4">
                  <span className="text-slate-400">Runtime Status</span>
                  <span className="font-black text-emerald-300">{run?.status || "unknown"}</span>
                </div>

                <div className="flex justify-between rounded-xl bg-white/5 p-4">
                  <span className="text-slate-400">Events</span>
                  <span className="font-black">{run?.events?.length || 0}</span>
                </div>

                <div className="flex justify-between rounded-xl bg-white/5 p-4">
                  <span className="text-slate-400">Artifacts</span>
                  <span className="font-black">{run?.artifacts?.length || 0}</span>
                </div>

                <div className="flex justify-between rounded-xl bg-white/5 p-4">
                  <span className="text-slate-400">ZIP Export</span>
                  <span className={fs.existsSync(exportPath) ? "font-black text-emerald-300" : "font-black text-red-300"}>
                    {fs.existsSync(exportPath) ? "READY" : "MISSING"}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-2xl font-black">Recent Runtime Events</h2>

              <div className="mt-5 space-y-3">
                {(run?.events || []).slice().reverse().slice(0, 8).map((event: string, index: number) => (
                  <div key={`${event}-${index}`} className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-300">
                    {event}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
