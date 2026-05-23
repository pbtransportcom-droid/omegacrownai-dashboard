"use client";

const sections = [
  {
    title: "Agent Swarm",
    description:
      "Monitor autonomous agents, swarm coordination, and runtime execution health.",
    href: "/runtime-control-center/swarm",
  },
  {
    title: "Workflow Engine",
    description:
      "Visualize workflow execution state, recovery replay, and orchestration timelines.",
    href: "/runtime-control-center/workflows",
  },
  {
    title: "Dependency Graph",
    description:
      "Inspect DAG execution paths, dependency chains, and blocked-state resolution.",
    href: "/runtime-control-center/dependencies",
  },
  {
    title: "Mission Control",
    description:
      "Coordinate sovereign execution missions, escalations, and strategic objectives.",
    href: "/runtime-control-center/missions",
  },
  {
    title: "Runtime Events",
    description:
      "Observe live runtime telemetry, orchestration signals, and autonomous events.",
    href: "/runtime-control-center/events",
  },
  {
    title: "Resource Intelligence",
    description:
      "Track resource allocation, runtime balancing, failover, and infrastructure pressure.",
    href: "/runtime-control-center/resources",
  },
  {
    title: "Negotiation Layer",
    description:
      "Inspect multi-agent negotiations, arbitration, and distributed consensus resolution.",
    href: "/runtime-control-center/negotiations",
  },
  {
    title: "Recovery Systems",
    description:
      "Replay autonomous recoveries, failovers, retries, and runtime stabilization.",
    href: "/runtime-control-center/recovery",
  },
  ] as const;

export default function RuntimeControlCenterPage() {
  return (
    <main className="min-h-screen bg-black text-white p-10">
      <div className="max-w-7xl mx-auto space-y-10">
        <div>
          <h1 className="text-5xl font-bold">
            OmegaCrownAI Runtime Control Center
          </h1>

          <p className="text-zinc-400 mt-4 text-lg max-w-4xl">
            Sovereign autonomous intelligence infrastructure visualization layer
            for runtime orchestration, swarm coordination, workflow execution,
            cognitive synchronization, and enterprise-scale AI governance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {sections.map((section) => (
            <a
              key={section.title}
              href={section.href}
              className="rounded-2xl border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 transition-all p-6 space-y-4"
            >
              <div>
                <h2 className="text-2xl font-semibold">{section.title}</h2>

                <p className="text-zinc-400 mt-2 text-sm leading-relaxed">
                  {section.description}
                </p>
              </div>

              <div className="text-blue-400 text-sm">
                Open Runtime Module →
              </div>
            </a>
          ))}
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-8">
          <h3 className="text-2xl font-semibold">
            Sovereign Runtime Status
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
            <div className="rounded-xl bg-zinc-900 p-5">
              <div className="text-zinc-500 text-sm">Runtime State</div>
              <div className="text-emerald-400 text-2xl font-bold mt-2">
                Operational
              </div>
            </div>

            <div className="rounded-xl bg-zinc-900 p-5">
              <div className="text-zinc-500 text-sm">Swarm Health</div>
              <div className="text-blue-400 text-2xl font-bold mt-2">
                Stable
              </div>
            </div>

            <div className="rounded-xl bg-zinc-900 p-5">
              <div className="text-zinc-500 text-sm">Execution Layer</div>
              <div className="text-purple-400 text-2xl font-bold mt-2">
                Active
              </div>
            </div>

            <div className="rounded-xl bg-zinc-900 p-5">
              <div className="text-zinc-500 text-sm">Recovery Systems</div>
              <div className="text-orange-400 text-2xl font-bold mt-2">
                Ready
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
