import { RuntimeHub } from "./hub";

export async function streamAgentText(sessionId: string, text: string, delayMs = 20) {
  const words = String(text || "").split(/(\s+)/).filter(Boolean);

  for (const word of words) {
    RuntimeHub.emit(sessionId, {
      type: "agent_token",
      content: word,
    });

    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  RuntimeHub.emit(sessionId, {
    type: "agent_complete",
    content: text,
  });

  return { ok: true };
}

export async function streamToolCall<T>(
  sessionId: string,
  tool: string,
  args: any,
  fn: (args: any) => Promise<T>
) {
  RuntimeHub.emit(sessionId, {
    type: "tool_call",
    tool,
    args,
  });

  const result = await fn(args);

  RuntimeHub.emit(sessionId, {
    type: "tool_result",
    tool,
    result,
  });

  return result;
}

export function streamBuilderUpdate(sessionId: string, draft: any) {
  return RuntimeHub.emit(sessionId, {
    type: "builder_update",
    draft,
  });
}

export function streamCloudJob(sessionId: string, status: string, result?: any) {
  return RuntimeHub.emit(sessionId, {
    type: "cloud_job_update",
    status,
    result,
  });
}
