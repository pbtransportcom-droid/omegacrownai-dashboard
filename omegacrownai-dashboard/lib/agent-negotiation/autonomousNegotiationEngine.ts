import { emitRuntimeEvent } from "@/lib/runtime-event-bus/unifiedRuntimeEventBus";

export const AUTONOMOUS_NEGOTIATION_ENGINE_VERSION =
  "v28.5 Phase 315 — Autonomous Multi-Agent Negotiation Layer";

export type NegotiationStatus =
  | "open"
  | "negotiating"
  | "resolved"
  | "escalated";

export type NegotiationPriority = "low" | "normal" | "high" | "critical";

export type AgentNegotiation = {
  negotiationId: string;
  topic: string;
  priority: NegotiationPriority;
  status: NegotiationStatus;
  participants: string[];
  proposals: {
    agentId: string;
    proposal: string;
    score: number;
    createdAt: string;
  }[];
  resolution?: string;
  escalationReason?: string;
  createdAt: string;
  updatedAt: string;
};

const negotiations: AgentNegotiation[] = [];

export function getNegotiationEngineStatus() {
  return {
    ok: true,
    version: AUTONOMOUS_NEGOTIATION_ENGINE_VERSION,
    purpose:
      "Coordinate autonomous inter-agent negotiation, task ownership arbitration, workload conflict resolution, priority bargaining, and escalation governance.",
    activeNegotiations: negotiations.length,
    capabilities: [
      "Negotiation session creation",
      "Inter-agent proposal exchange",
      "Priority arbitration",
      "Autonomous resolution selection",
      "Conflict escalation",
      "Runtime event emission",
      "Distributed consensus foundation",
    ],
  };
}

export function openAgentNegotiation(input?: {
  topic?: string;
  priority?: NegotiationPriority;
  participants?: string[];
}) {
  const negotiation: AgentNegotiation = {
    negotiationId: `negotiation_${Date.now()}`,
    topic:
      input?.topic ||
      "Resolve sovereign multi-agent task ownership and priority allocation.",
    priority: input?.priority || "high",
    status: "open",
    participants:
      input?.participants || [
        "executive-command",
        "runtime-supervisor",
        "marketing-war-room",
      ],
    proposals: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  negotiations.push(negotiation);

  emitRuntimeEvent({
    type: "AgentNegotiationOpened",
    source: "agent-negotiation",
    priority: negotiation.priority,
    payload: {
      negotiationId: negotiation.negotiationId,
      topic: negotiation.topic,
      participants: negotiation.participants,
    },
  });

  return {
    ok: true,
    version: AUTONOMOUS_NEGOTIATION_ENGINE_VERSION,
    negotiation,
  };
}

export function negotiateAgentProposal(input?: {
  negotiationId?: string;
  agentId?: string;
  proposal?: string;
  score?: number;
}) {
  const negotiation =
    negotiations.find((item) => item.negotiationId === input?.negotiationId) ||
    negotiations[negotiations.length - 1];

  if (!negotiation) {
    return {
      ok: false,
      reason: "NEGOTIATION_NOT_FOUND",
    };
  }

  const agentId = input?.agentId || negotiation.participants[0];

  negotiation.status = "negotiating";
  negotiation.proposals.push({
    agentId,
    proposal:
      input?.proposal ||
      "Accept ownership with balanced priority and runtime supervision.",
    score: input?.score ?? 85,
    createdAt: new Date().toISOString(),
  });
  negotiation.updatedAt = new Date().toISOString();

  emitRuntimeEvent({
    type: "AgentNegotiationProposalSubmitted",
    source: "agent-negotiation",
    target: agentId,
    priority: negotiation.priority,
    payload: {
      negotiationId: negotiation.negotiationId,
      agentId,
      proposalCount: negotiation.proposals.length,
    },
  });

  return {
    ok: true,
    version: AUTONOMOUS_NEGOTIATION_ENGINE_VERSION,
    negotiation,
  };
}

export function resolveAgentNegotiation(input?: {
  negotiationId?: string;
}) {
  const negotiation =
    negotiations.find((item) => item.negotiationId === input?.negotiationId) ||
    negotiations[negotiations.length - 1];

  if (!negotiation) {
    return {
      ok: false,
      reason: "NEGOTIATION_NOT_FOUND",
    };
  }

  const bestProposal = negotiation.proposals
    .slice()
    .sort((a, b) => b.score - a.score)[0];

  if (!bestProposal) {
    return {
      ok: false,
      reason: "NO_PROPOSALS_AVAILABLE",
      negotiation,
    };
  }

  negotiation.status = "resolved";
  negotiation.resolution = `${bestProposal.agentId} selected with proposal: ${bestProposal.proposal}`;
  negotiation.updatedAt = new Date().toISOString();

  emitRuntimeEvent({
    type: "AgentNegotiationResolved",
    source: "agent-negotiation",
    target: bestProposal.agentId,
    priority: negotiation.priority,
    payload: {
      negotiationId: negotiation.negotiationId,
      selectedAgent: bestProposal.agentId,
      score: bestProposal.score,
    },
  });

  return {
    ok: true,
    version: AUTONOMOUS_NEGOTIATION_ENGINE_VERSION,
    negotiation,
    selectedProposal: bestProposal,
  };
}

export function escalateAgentNegotiation(input?: {
  negotiationId?: string;
  reason?: string;
}) {
  const negotiation =
    negotiations.find((item) => item.negotiationId === input?.negotiationId) ||
    negotiations[negotiations.length - 1];

  if (!negotiation) {
    return {
      ok: false,
      reason: "NEGOTIATION_NOT_FOUND",
    };
  }

  negotiation.status = "escalated";
  negotiation.escalationReason =
    input?.reason || "Negotiation escalated for executive arbitration.";
  negotiation.updatedAt = new Date().toISOString();

  emitRuntimeEvent({
    type: "AgentNegotiationEscalated",
    source: "agent-negotiation",
    priority: "critical",
    payload: {
      negotiationId: negotiation.negotiationId,
      reason: negotiation.escalationReason,
    },
  });

  return {
    ok: true,
    version: AUTONOMOUS_NEGOTIATION_ENGINE_VERSION,
    negotiation,
  };
}
