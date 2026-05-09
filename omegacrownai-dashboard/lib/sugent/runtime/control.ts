import { RuntimeHub } from "./hub";

export type RuntimeControlState = {
  paused: boolean;
  stepRequested: boolean;
  overrides: string[];
  assignments: Record<string, string>;
  agentStates: Record<string, "alive" | "dead">;
  updatedAt: string;
};

const states = new Map<string, RuntimeControlState>();

function defaultState(): RuntimeControlState {
  return {
    paused: false,
    stepRequested: false,
    overrides: [],
    assignments: {},
    agentStates: {},
    updatedAt: new Date().toISOString(),
  };
}

export function getRuntimeControlState(sessionId: string) {
  if (!states.has(sessionId)) {
    states.set(sessionId, defaultState());
  }

  return states.get(sessionId)!;
}

export function applyRuntimeControl(sessionId: string, message: any) {
  const state = getRuntimeControlState(sessionId);

  if (message.type === "control_pause") {
    state.paused = true;
  }

  if (message.type === "control_resume") {
    state.paused = false;
    state.stepRequested = false;
  }

  if (message.type === "control_step") {
    state.stepRequested = true;
  }

  if (message.type === "control_override" && message.content) {
    state.overrides.push(String(message.content));
  }

  if (message.type === "control_assign" && message.agent && message.task) {
    state.assignments[String(message.agent)] = String(message.task);
  }

  if (message.type === "control_kill" && message.agent) {
    state.agentStates[String(message.agent)] = "dead";
  }

  if (message.type === "control_restart" && message.agent) {
    state.agentStates[String(message.agent)] = "alive";
  }

  state.updatedAt = new Date().toISOString();
  states.set(sessionId, state);

  RuntimeHub.emit(sessionId, {
    type: "agent_message",
    from: "mission_control",
    to: "runtime",
    role: "control",
    content: `Control applied: ${message.type}`,
  });

  RuntimeHub.emit(sessionId, {
    type: "builder_update",
    draft: {
      controlState: state,
      controlMessage: message,
    },
  });

  return state;
}
