import { emitRuntimeEvent } from "@/lib/runtime-event-bus/unifiedRuntimeEventBus";
import { dispatchTask } from "@/lib/task-routing/agentTaskRouter";

export const AUTONOMOUS_RUNTIME_ORCHESTRATOR_VERSION =
  "v28.2 Phase 312 — Autonomous Multi-Agent Runtime Orchestrator";

export type OrchestrationSessionStatus =
  | "created"
  | "running"
  | "reconciling"
  | "healthy"
  | "degraded"
  | "completed";

export type RuntimeAgentHeartbeat = {
  agentId: string;
  status: "available" | "busy" | "offline";
  lastSeenAt: string;
  load: number;
};

export type OrchestrationSession = {
  sessionId: string;
  objective: string;
  status: OrchestrationSessionStatus;
  createdAt: string;
  updatedAt: string;
  heartbeats: RuntimeAgentHeartbeat[];
  dispatchLog: {
    taskType: string;
    targetAgent: string;
    priority: string;
    dispatchedAt: string;
  }[];
  reconciliationNotes: string[];
};

const orchestrationSessions: OrchestrationSession[] = [];

const defaultHeartbeats: RuntimeAgentHeartbeat[] = [
  {
    agentId: "executive-command",
    status: "available",
    lastSeenAt: new Date().toISOString(),
    load: 18,
  },
  {
    agentId: "marketing-war-room",
    status: "available",
    lastSeenAt: new Date().toISOString(),
    load: 22,
  },
  {
    agentId: "sales-command",
    status: "available",
    lastSeenAt: new Date().toISOString(),
    load: 25,
  },
  {
    agentId: "runtime-supervisor",
    status: "available",
    lastSeenAt: new Date().toISOString(),
    load: 16,
  },
];

export function getRuntimeOrchestratorStatus() {
  return {
    ok: true,
    version: AUTONOMOUS_RUNTIME_ORCHESTRATOR_VERSION,
    purpose:
      "Coordinate autonomous multi-agent runtime sessions, dispatch cycles, heartbeat monitoring, reconciliation, workload balancing, and sovereign execution continuity.",
    activeSessions: orchestrationSessions.length,
    capabilities: [
      "Multi-agent orchestration sessions",
      "Autonomous dispatch cycles",
      "Agent heartbeat tracking",
      "Runtime reconciliation",
      "Workload balancing preview",
      "Execution continuity checks",
      "Runtime event emission",
      "Recovery-aware orchestration",
    ],
  };
}

export function startOrchestrationSession(input?: {
  objective?: string;
}) {
  const session: OrchestrationSession = {
    sessionId: `orchestration_session_${Date.now()}`,
    objective:
      input?.objective ||
      "Coordinate sovereign runtime multi-agent execution.",
    status: "created",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    heartbeats: defaultHeartbeats.map((heartbeat) => ({
      ...heartbeat,
      lastSeenAt: new Date().toISOString(),
    })),
    dispatchLog: [],
    reconciliationNotes: [],
  };

  orchestrationSessions.push(session);

  emitRuntimeEvent({
    type: "OrchestrationSessionStarted",
    source: "runtime-orchestrator",
    priority: "critical",
    payload: {
      sessionId: session.sessionId,
      objective: session.objective,
    },
  });

  return {
    ok: true,
    version: AUTONOMOUS_RUNTIME_ORCHESTRATOR_VERSION,
    session,
  };
}

export function dispatchOrchestrationCycle(input?: {
  sessionId?: string;
  taskType?: string;
  priority?: "low" | "normal" | "high" | "critical";
}) {
  const session =
    orchestrationSessions.find(
      (item) => item.sessionId === input?.sessionId,
    ) || orchestrationSessions[orchestrationSessions.length - 1];

  if (!session) {
    return {
      ok: false,
      reason: "ORCHESTRATION_SESSION_NOT_FOUND",
    };
  }

  session.status = "running";
  session.updatedAt = new Date().toISOString();

  const taskType = input?.taskType || "planning";
  const priority = input?.priority || "high";

  const dispatch = dispatchTask({
    taskType,
    priority,
    payload: {
      sessionId: session.sessionId,
      objective: session.objective,
      orchestrationCycle: true,
    },
  });

  session.dispatchLog.push({
    taskType,
    targetAgent: dispatch.assignedTo.agentId,
    priority,
    dispatchedAt: new Date().toISOString(),
  });

  emitRuntimeEvent({
    type: "OrchestrationCycleDispatched",
    source: "runtime-orchestrator",
    target: dispatch.assignedTo.agentId,
    priority,
    payload: {
      sessionId: session.sessionId,
      taskType,
      targetAgent: dispatch.assignedTo.agentId,
    },
  });

  return {
    ok: true,
    version: AUTONOMOUS_RUNTIME_ORCHESTRATOR_VERSION,
    session,
    dispatch,
  };
}

export function recordRuntimeHeartbeat(input?: {
  sessionId?: string;
  agentId?: string;
  status?: "available" | "busy" | "offline";
  load?: number;
}) {
  const session =
    orchestrationSessions.find(
      (item) => item.sessionId === input?.sessionId,
    ) || orchestrationSessions[orchestrationSessions.length - 1];

  if (!session) {
    return {
      ok: false,
      reason: "ORCHESTRATION_SESSION_NOT_FOUND",
    };
  }

  const agentId = input?.agentId || "runtime-supervisor";

  const heartbeat = session.heartbeats.find(
    (item) => item.agentId === agentId,
  );

  if (heartbeat) {
    heartbeat.status = input?.status || heartbeat.status;
    heartbeat.load = input?.load ?? heartbeat.load;
    heartbeat.lastSeenAt = new Date().toISOString();
  } else {
    session.heartbeats.push({
      agentId,
      status: input?.status || "available",
      load: input?.load ?? 0,
      lastSeenAt: new Date().toISOString(),
    });
  }

  session.updatedAt = new Date().toISOString();

  emitRuntimeEvent({
    type: "RuntimeHeartbeatRecorded",
    source: "runtime-orchestrator",
    priority: "normal",
    payload: {
      sessionId: session.sessionId,
      agentId,
    },
  });

  return {
    ok: true,
    version: AUTONOMOUS_RUNTIME_ORCHESTRATOR_VERSION,
    session,
  };
}

export function reconcileRuntimeOrchestration(input?: {
  sessionId?: string;
}) {
  const session =
    orchestrationSessions.find(
      (item) => item.sessionId === input?.sessionId,
    ) || orchestrationSessions[orchestrationSessions.length - 1];

  if (!session) {
    return {
      ok: false,
      reason: "ORCHESTRATION_SESSION_NOT_FOUND",
    };
  }

  session.status = "reconciling";

  const offlineAgents = session.heartbeats.filter(
    (heartbeat) => heartbeat.status === "offline",
  );

  const overloadedAgents = session.heartbeats.filter(
    (heartbeat) => heartbeat.load >= 80,
  );

  if (offlineAgents.length > 0) {
    session.status = "degraded";
    session.reconciliationNotes.push(
      `Detected ${offlineAgents.length} offline agent(s).`,
    );
  }

  if (overloadedAgents.length > 0) {
    session.status = "degraded";
    session.reconciliationNotes.push(
      `Detected ${overloadedAgents.length} overloaded agent(s).`,
    );
  }

  if (offlineAgents.length === 0 && overloadedAgents.length === 0) {
    session.status = "healthy";
    session.reconciliationNotes.push(
      "Runtime orchestration state is healthy.",
    );
  }

  session.updatedAt = new Date().toISOString();

  emitRuntimeEvent({
    type: "RuntimeOrchestrationReconciled",
    source: "runtime-orchestrator",
    priority: session.status === "degraded" ? "critical" : "high",
    payload: {
      sessionId: session.sessionId,
      status: session.status,
      offlineAgents: offlineAgents.length,
      overloadedAgents: overloadedAgents.length,
    },
  });

  return {
    ok: true,
    version: AUTONOMOUS_RUNTIME_ORCHESTRATOR_VERSION,
    session,
  };
}
