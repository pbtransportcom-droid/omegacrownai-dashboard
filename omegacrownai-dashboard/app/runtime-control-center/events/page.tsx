"use client";

import { useEffect, useState } from "react";

type RuntimeStatus = {
  orchestrationHealth: string;
  executionPressure: number;
  runtimeDrift: string;
  swarmConsensus: string;
  infrastructureStatus: string;
  activeAgents: number;
  activeMissions: number;
  runtimeEvents: number;
};

type RuntimeAgent = {
  agentId: string;
  role: string;
  status: string;
  workload: number;
  lastHeartbeatAt: string;
};

type RuntimeMission = {
  missionId: string;
  title: string;
  status: string;
  assignedSwarm: string;
  progress: number;
  createdAt: string;
};

type RuntimeEvent = {
  eventId: string;
  type: string;
  severity: string;
  source: string;
  timestamp: string;
};

export default function RuntimeTelemetryDashboardPage() {
  const [status, setStatus] = useState<RuntimeStatus | null>(null);
  const [agents, setAgents] = useState<RuntimeAgent[]>([]);
  const [missions, setMissions] = useState<RuntimeMission[]>([]);
  const [events, setEvents] = useState<RuntimeEvent[]>([]);

  async function loadTelemetry() {
    const [statusRes, agentsRes, missionsRes, eventsRes] = await Promise.all([
      fetch("/api/runtime-telemetry/status"),
      fetch("/api/runtime-telemetry/agents"),
      fetch("/api/runtime-telemetry/missions"),
      fetch("/api/runtime-telemetry/events"),
    ]);

    const statusJson = await statusRes.json();
    const agentsJson = await agentsRes.json();
    const missionsJson = await missionsRes.json();
    const eventsJson = await eventsRes.json();

    setStatus(statusJson);
    setAgents(agentsJson.agents || []);
    setMissions(missionsJson.missions || []);
    setEvents(eventsJson.events || []);
  }

  useEffect(() => {
    loadTelemetry();

    const interval = setInterval(loadTelemetry, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-5xl font-bold">
            Sovereign Runtime Telemetry
          </h1>

          <p className="text-zinc-400 mt-4 text-lg max-w-4xl">
            Live autonomous runtime visibility for agents, missions, event
            timelines, orchestration health, execution pressure, and sovereign
            infrastructure status.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <div className="text-zinc-500 text-sm">Orchestration</div>
            <div className="text-2xl font-bold text-emerald-400 mt-2">
              {status?.orchestrationHealth || "loading"}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <div className="text-zinc-500 text-sm">Execution Pressure</div>
            <div className="text-2xl font-bold text-orange-400 mt-2">
              {status?.executionPressure ?? 0}%
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <div className="text-zinc-500 text-sm">Swarm Consensus</div>
            <div className="text-2xl font-bold text-blue-400 mt-2">
              {status?.swarmConsensus || "loading"}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <div className="text-zinc-500 text-sm">Infrastructure</div>
            <div className="text-2xl font-bold text-purple-400 mt-2">
              {status?.infrastructureStatus || "loading"}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <h2 className="text-3xl font-semibold">Live Agents</h2>

            <div className="space-y-4 mt-6">
              {agents.map((agent) => (
                <div
                  key={agent.agentId}
                  className="rounded-xl bg-zinc-900 p-5 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{agent.agentId}</div>
                      <div className="text-zinc-500 text-sm">{agent.role}</div>
                    </div>

                    <span className="rounded-full bg-blue-500/20 text-blue-400 px-3 py-1 text-sm">
                      {agent.status}
                    </span>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm text-zinc-400">
                      <span>Workload</span>
                      <span>{agent.workload}%</span>
                    </div>

                    <div className="mt-2 h-3 rounded-full bg-zinc-800">
                      <div
                        className="h-3 rounded-full bg-blue-500"
                        style={{ width: `${agent.workload}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <h2 className="text-3xl font-semibold">Active Missions</h2>

            <div className="space-y-4 mt-6">
              {missions.map((mission) => (
                <div
                  key={mission.missionId}
                  className="rounded-xl bg-zinc-900 p-5 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{mission.title}</div>
                      <div className="text-zinc-500 text-sm">
                        {mission.assignedSwarm}
                      </div>
                    </div>

                    <span className="rounded-full bg-emerald-500/20 text-emerald-400 px-3 py-1 text-sm">
                      {mission.status}
                    </span>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm text-zinc-400">
                      <span>Progress</span>
                      <span>{mission.progress}%</span>
                    </div>

                    <div className="mt-2 h-3 rounded-full bg-zinc-800">
                      <div
                        className="h-3 rounded-full bg-emerald-500"
                        style={{ width: `${mission.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-3xl font-semibold">Runtime Event Timeline</h2>

          <div className="space-y-4 mt-6">
            {events.map((event) => (
              <div
                key={event.eventId}
                className="rounded-xl bg-zinc-900 p-5 flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold">{event.type}</div>
                  <div className="text-zinc-500 text-sm">
                    {event.source} • {new Date(event.timestamp).toLocaleString()}
                  </div>
                </div>

                <span className="rounded-full bg-orange-500/20 text-orange-400 px-3 py-1 text-sm">
                  {event.severity}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
