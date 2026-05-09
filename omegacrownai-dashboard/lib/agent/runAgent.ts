import type { AgentRunRequest, AgentRunResponse, AgentIntent } from "./types";
import { detectIntent } from "./intent";
import { createPlan } from "./planner";
import { executeToolsForIntent } from "./toolRouter";
import { buildReply, buildNextSuggestions } from "./suggestions";
import { runTradingCommand } from "./tradingCommand";
import { runProjectCommand } from "./projectCommand";
import {
  logAgentMessage,
  createAgentTask,
  updateAgentTask,
  logToolRun,
} from "./memory";

export async function runAgent(req: AgentRunRequest): Promise<AgentRunResponse> {
  const { userId, sessionId, message, context = {} } = req;

  await logAgentMessage({
    sessionId,
    userId,
    role: "user",
    content: message,
  });

  const tradingCommand = await runTradingCommand(message);

  if (tradingCommand) {
    await logAgentMessage({
      sessionId,
      userId,
      role: "agent",
      content: tradingCommand.reply,
    });

    return tradingCommand as any;
  }

  const projectCommand = await runProjectCommand({
    userId,
    sessionId,
    message,
    context,
  });

  if (projectCommand) {
    await logAgentMessage({
      sessionId,
      userId,
      role: "agent",
      content: projectCommand.reply,
    });

    return projectCommand as any;
  }

  const intent: AgentIntent = detectIntent(message, context);
  const plan = createPlan(intent, message, context);

  const taskId = await createAgentTask({
    sessionId,
    intent,
    plan,
    status: "running",
  });

  const { actions, toolLogs } = await executeToolsForIntent(intent, message, {
    ...context,
    sessionId,
    userId,
  });

  for (const log of toolLogs) {
    await logToolRun(log);
  }

  const reply = buildReply(intent, actions, context);
  const nextSuggestions = buildNextSuggestions(intent, actions, context);

  await updateAgentTask(taskId, { status: "done" });

  await logAgentMessage({
    sessionId,
    userId,
    role: "agent",
    content: reply,
  });

  return {
    ok: true,
    intent,
    plan,
    reply,
    actions,
    nextSuggestions,
  };
}
