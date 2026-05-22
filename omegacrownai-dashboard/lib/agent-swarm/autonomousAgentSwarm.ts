import { emitRuntimeEvent } from "@/lib/runtime-event-bus/unifiedRuntimeEventBus";

export const AUTONOMOUS_AGENT_SWARM_VERSION =
  "v28.3 Phase 313 — Autonomous Agent Swarm Coordination Layer";

export type SwarmAgentStatus = "available" | "busy" | "offline";
export type SwarmStatus = "created" | "coordinating" | "balanced" | "degraded";

export type SwarmAgent = {
  agentId: string;
  role: string;
  capabilities: string[];
  status: SwarmAgentStatus;
  load: number;
};

export type AgentSwarm = {
  swarmId: string;
  objective: string;
  status: SwarmStatus;
  createdAt: string;
  updatedAt: string;
  agents: SwarmAgent[];
  consensusLog: string[];
  coordinationLog: string[];
};

const swarms: AgentSwarm[] = [];

export function getAgentSwarmStatus() {
  return {
    ok: true,
    version: AUTONOMOUS_AGENT_SWARM_VERSION,
    purpose:
      "Coordinate distributed autonomous agent groups, swarm consensus, load rebalancing, role synchronization, and sovereign multi-agent execution.",
    activeSwarms: swarms.length,
    capabilities: [
      "Dynamic swarm creation",
      "Multi-agent coordination",
      "Consensus cycle preview",
      "Load rebalance planning",
      "Distributed role synchronization",
      "Runtime event emission",
    ],
  };
}

export function createAgentSwarm(input?: {
  objective?: string;
  agents?: Partial<SwarmAgent>[];
}) {
  const swarm: AgentSwarm = {
    swarmId: `agent_swarm_${Date.now()}`,
    objective:
      input?.objective ||
      "Coordinate sovereign multi-agent execution group.",
    status: "created",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    agents:
      input?.agents?.map((agent, index) => ({
        agentId: agent.agentId || `swarm_agent_${index + 1}`,
        role: agent.role || "specialist",
        capabilities: agent.capabilities || ["planning"],
        status: agent.status || "available",
        load: agent.load ?? 20,
      })) || [
        {
          agentId: "executive-command",
          role: "strategic_lead",
          capabilities: ["planning", "decision_room"],
          status: "available",
          load: 18,
        },
        {
          agentId: "runtime-supervisor",
          role: "runtime_guardian",
          capabilities: ["supervision", "recovery"],
          status: "available",
          load: 16,
        },
        {
          agentId: "marketing-war-room",
          role: "growth_specialist",
          capabilities: ["campaigns", "audience_growth"],
          status: "available",
          load: 22,
        },
      ],
    consensusLog: [],
    coordinationLog: [],
  };

  swarms.push(swarm);

  emitRuntimeEvent({
    type: "AgentSwarmCreated",
    source: "agent-swarm",
    priority: "high",
    payload: {
      swarmId: swarm.swarmId,
      objective: swarm.objective,
      agents: swarm.agents.length,
    },
  });

  return {
    ok: true,
    version: AUTONOMOUS_AGENT_SWARM_VERSION,
    swarm,
  };
}

export function coordinateAgentSwarm(input?: { swarmId?: string }) {
  const swarm =
    swarms.find((item) => item.swarmId === input?.swarmId) ||
    swarms[swarms.length - 1];

  if (!swarm) {
    return {
      ok: false,
      reason: "AGENT_SWARM_NOT_FOUND",
    };
  }

  swarm.status = "coordinating";
  swarm.updatedAt = new Date().toISOString();

  for (const agent of swarm.agents) {
    swarm.coordinationLog.push(
      `${agent.agentId} synchronized as ${agent.role}.`,
    );
  }

  emitRuntimeEvent({
    type: "AgentSwarmCoordinated",
    source: "agent-swarm",
    priority: "high",
    payload: {
      swarmId: swarm.swarmId,
      agents: swarm.agents.length,
    },
  });

  return {
    ok: true,
    version: AUTONOMOUS_AGENT_SWARM_VERSION,
    swarm,
  };
}

export function runSwarmConsensus(input?: { swarmId?: string }) {
  const swarm =
    swarms.find((item) => item.swarmId === input?.swarmId) ||
    swarms[swarms.length - 1];

  if (!swarm) {
    return {
      ok: false,
      reason: "AGENT_SWARM_NOT_FOUND",
    };
  }

  const availableAgents = swarm.agents.filter(
    (agent) => agent.status === "available",
  );

  const consensus =
    availableAgents.length >= Math.ceil(swarm.agents.length / 2)
      ? "consensus_reached"
      : "consensus_degraded";

  swarm.consensusLog.push(
    `${consensus}: ${availableAgents.length}/${swarm.agents.length} agents available.`,
  );

  swarm.updatedAt = new Date().toISOString();

  emitRuntimeEvent({
    type: "AgentSwarmConsensusCompleted",
    source: "agent-swarm",
    priority: consensus === "consensus_reached" ? "high" : "critical",
    payload: {
      swarmId: swarm.swarmId,
      consensus,
      availableAgents: availableAgents.length,
    },
  });

  return {
    ok: true,
    version: AUTONOMOUS_AGENT_SWARM_VERSION,
    consensus,
    swarm,
  };
}

export function rebalanceAgentSwarm(input?: { swarmId?: string }) {
  const swarm =
    swarms.find((item) => item.swarmId === input?.swarmId) ||
    swarms[swarms.length - 1];

  if (!swarm) {
    return {
      ok: false,
      reason: "AGENT_SWARM_NOT_FOUND",
    };
  }

  const overloaded = swarm.agents.filter((agent) => agent.load >= 80);
  const offline = swarm.agents.filter((agent) => agent.status === "offline");

  swarm.status =
    overloaded.length > 0 || offline.length > 0 ? "degraded" : "balanced";

  swarm.updatedAt = new Date().toISOString();

  emitRuntimeEvent({
    type: "AgentSwarmRebalanced",
    source: "agent-swarm",
    priority: swarm.status === "degraded" ? "critical" : "high",
    payload: {
      swarmId: swarm.swarmId,
      status: swarm.status,
      overloadedAgents: overloaded.length,
      offlineAgents: offline.length,
    },
  });

  return {
    ok: true,
    version: AUTONOMOUS_AGENT_SWARM_VERSION,
    swarm,
    overloadedAgents: overloaded.length,
    offlineAgents: offline.length,
  };
}
