import type { AgentIntent, ToolLog } from "./types";

export async function logAgentMessage(input: {
  sessionId: string;
  userId: string;
  role: "user" | "agent";
  content: string;
}) {
  console.log("[agent_message]", input);
}

export async function createAgentTask(input: {
  sessionId: string;
  intent: AgentIntent;
  plan: string[];
  status: "pending" | "running" | "done" | "failed";
}) {
  const id = `task_${Date.now()}`;
  console.log("[agent_task_created]", { id, ...input });
  return id;
}

export async function updateAgentTask(
  taskId: string,
  input: { status: "pending" | "running" | "done" | "failed" }
) {
  console.log("[agent_task_updated]", { taskId, ...input });
}

export async function logToolRun(input: ToolLog) {
  console.log("[agent_tool_run]", input);
}
