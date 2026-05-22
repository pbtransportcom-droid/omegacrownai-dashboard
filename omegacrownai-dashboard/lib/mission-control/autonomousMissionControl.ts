import { emitRuntimeEvent } from "@/lib/runtime-event-bus/unifiedRuntimeEventBus";
import { createAgentSwarm } from "@/lib/agent-swarm/autonomousAgentSwarm";

export const AUTONOMOUS_MISSION_CONTROL_VERSION =
  "v28.4 Phase 314 — Autonomous Mission Control Layer";

export type MissionStatus =
  | "created"
  | "executing"
  | "under_review"
  | "escalated"
  | "completed";

export type MissionPriority = "low" | "normal" | "high" | "critical";

export type AutonomousMission = {
  missionId: string;
  objective: string;
  priority: MissionPriority;
  status: MissionStatus;
  assignedSwarmId?: string;
  createdAt: string;
  updatedAt: string;
  executionLog: string[];
  escalationLog: string[];
};

const missions: AutonomousMission[] = [];

export function getMissionControlStatus() {
  return {
    ok: true,
    version: AUTONOMOUS_MISSION_CONTROL_VERSION,
    purpose:
      "Manage persistent autonomous missions, multi-swarm assignment, execution lifecycle, strategic review, escalation, and sovereign operational continuity.",
    activeMissions: missions.length,
    capabilities: [
      "Mission lifecycle management",
      "Strategic objective execution",
      "Swarm assignment",
      "Mission review",
      "Escalation handling",
      "Runtime event emission",
      "Long-running autonomous operations foundation",
    ],
  };
}

export function createAutonomousMission(input?: {
  objective?: string;
  priority?: MissionPriority;
}) {
  const mission: AutonomousMission = {
    missionId: `mission_${Date.now()}`,
    objective:
      input?.objective ||
      "Execute sovereign autonomous enterprise operation.",
    priority: input?.priority || "high",
    status: "created",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    executionLog: [],
    escalationLog: [],
  };

  missions.push(mission);

  emitRuntimeEvent({
    type: "AutonomousMissionCreated",
    source: "mission-control",
    priority: mission.priority,
    payload: {
      missionId: mission.missionId,
      objective: mission.objective,
    },
  });

  return {
    ok: true,
    version: AUTONOMOUS_MISSION_CONTROL_VERSION,
    mission,
  };
}

export function executeAutonomousMission(input?: {
  missionId?: string;
}) {
  const mission =
    missions.find((item) => item.missionId === input?.missionId) ||
    missions[missions.length - 1];

  if (!mission) {
    return {
      ok: false,
      reason: "MISSION_NOT_FOUND",
    };
  }

  const swarm = createAgentSwarm({
    objective: mission.objective,
  });

  mission.status = "executing";
  mission.assignedSwarmId = swarm.swarm.swarmId;
  mission.updatedAt = new Date().toISOString();
  mission.executionLog.push(
    `Mission assigned to swarm ${swarm.swarm.swarmId}.`,
  );

  emitRuntimeEvent({
    type: "AutonomousMissionExecuting",
    source: "mission-control",
    priority: mission.priority,
    payload: {
      missionId: mission.missionId,
      assignedSwarmId: mission.assignedSwarmId,
    },
  });

  return {
    ok: true,
    version: AUTONOMOUS_MISSION_CONTROL_VERSION,
    mission,
    swarm: swarm.swarm,
  };
}

export function reviewAutonomousMission(input?: {
  missionId?: string;
}) {
  const mission =
    missions.find((item) => item.missionId === input?.missionId) ||
    missions[missions.length - 1];

  if (!mission) {
    return {
      ok: false,
      reason: "MISSION_NOT_FOUND",
    };
  }

  mission.status = "under_review";
  mission.updatedAt = new Date().toISOString();
  mission.executionLog.push("Mission entered strategic review.");

  emitRuntimeEvent({
    type: "AutonomousMissionReviewed",
    source: "mission-control",
    priority: mission.priority,
    payload: {
      missionId: mission.missionId,
      status: mission.status,
    },
  });

  return {
    ok: true,
    version: AUTONOMOUS_MISSION_CONTROL_VERSION,
    mission,
  };
}

export function escalateAutonomousMission(input?: {
  missionId?: string;
  reason?: string;
}) {
  const mission =
    missions.find((item) => item.missionId === input?.missionId) ||
    missions[missions.length - 1];

  if (!mission) {
    return {
      ok: false,
      reason: "MISSION_NOT_FOUND",
    };
  }

  mission.status = "escalated";
  mission.updatedAt = new Date().toISOString();
  mission.escalationLog.push(
    input?.reason || "Mission escalated for executive review.",
  );

  emitRuntimeEvent({
    type: "AutonomousMissionEscalated",
    source: "mission-control",
    priority: "critical",
    payload: {
      missionId: mission.missionId,
      reason:
        input?.reason || "Mission escalated for executive review.",
    },
  });

  return {
    ok: true,
    version: AUTONOMOUS_MISSION_CONTROL_VERSION,
    mission,
  };
}
