import { emitRuntimeEvent } from "@/lib/runtime-event-bus/unifiedRuntimeEventBus";

export const AGENT_TASK_ROUTER_VERSION =
  "v27.5 Phase 295 — Unified Runtime Event Bus + Agent Task Routing";

export type AgentCapability = {
  agentId: string;
  name: string;
  department: string;
  capabilities: string[];
  status: "available" | "busy" | "offline";
};

const defaultAgents: AgentCapability[] = [
  {
    agentId: "executive-command",
    name: "Executive Command Center",
    department: "executive",
    capabilities: ["planning", "decision_room", "global_orchestration"],
    status: "available",
  },
  {
    agentId: "marketing-war-room",
    name: "Marketing War Room",
    department: "marketing",
    capabilities: ["campaigns", "audience_growth", "funnel_optimization"],
    status: "available",
  },
  {
    agentId: "sales-command",
    name: "Sales Command",
    department: "sales",
    capabilities: ["lead_scoring", "pipeline_forecasting", "conversion"],
    status: "available",
  },
  {
    agentId: "runtime-supervisor",
    name: "Runtime Supervisor",
    department: "runtime",
    capabilities: ["supervision", "recovery", "queue_monitoring"],
    status: "available",
  },
];

export function getTaskRoutingStatus() {
  return {
    ok: true,
    version: AGENT_TASK_ROUTER_VERSION,
    agents: defaultAgents,
    routingMode: "capability_match_preview",
  };
}

export function dispatchTask(input: {
  taskType?: string;
  payload?: Record<string, unknown>;
  priority?: "low" | "normal" | "high" | "critical";
}) {
  const taskType = input.taskType || "planning";

  const agent =
    defaultAgents.find(
      (candidate) =>
        candidate.status === "available" &&
        candidate.capabilities.includes(taskType),
    ) || defaultAgents[0];

  const event = emitRuntimeEvent({
    type: "TaskDispatched",
    source: "task-router",
    target: agent.agentId,
    priority: input.priority || "normal",
    payload: {
      taskType,
      assignedAgent: agent,
      taskPayload: input.payload || {},
    },
  });

  return {
    ok: true,
    version: AGENT_TASK_ROUTER_VERSION,
    assignedTo: agent,
    event: event.event,
  };
}
