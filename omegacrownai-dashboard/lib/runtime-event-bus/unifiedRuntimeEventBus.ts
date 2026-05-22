export const UNIFIED_RUNTIME_EVENT_BUS_VERSION =
  "v27.5 Phase 295 — Unified Runtime Event Bus + Agent Task Routing";

export type RuntimeEventPriority = "low" | "normal" | "high" | "critical";

export type UnifiedRuntimeEvent = {
  id: string;
  type: string;
  source: string;
  target?: string;
  priority: RuntimeEventPriority;
  payload: Record<string, unknown>;
  createdAt: string;
};

const runtimeEvents: UnifiedRuntimeEvent[] = [];

export function getRuntimeEventBusStatus() {
  return {
    ok: true,
    version: UNIFIED_RUNTIME_EVENT_BUS_VERSION,
    purpose:
      "Provide shared runtime messaging for executive orchestration, agent coordination, task routing, recovery escalation, and observability.",
    eventCount: runtimeEvents.length,
    capabilities: [
      "Executive-to-runtime delegation",
      "Cross-agent messaging",
      "Department event coordination",
      "Recovery escalation events",
      "Task dispatch signaling",
      "Observability event stream foundation",
    ],
  };
}

export function emitRuntimeEvent(input: Partial<UnifiedRuntimeEvent>) {
  const event: UnifiedRuntimeEvent = {
    id: input.id || `event_${Date.now()}`,
    type: input.type || "RuntimeEvent",
    source: input.source || "system",
    target: input.target,
    priority: input.priority || "normal",
    payload: input.payload || {},
    createdAt: input.createdAt || new Date().toISOString(),
  };

  runtimeEvents.push(event);

  return {
    ok: true,
    version: UNIFIED_RUNTIME_EVENT_BUS_VERSION,
    event,
    message: "Runtime event emitted successfully.",
  };
}
