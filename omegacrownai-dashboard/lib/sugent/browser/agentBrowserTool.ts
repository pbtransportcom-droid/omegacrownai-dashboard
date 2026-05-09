import { runBrowserTask } from "./runBrowserTask";

export function shouldUseBrowserAutomation(message: string) {
  const lower = String(message || "").toLowerCase();

  return (
    lower.includes("visit ") ||
    lower.includes("open ") ||
    lower.includes("scrape ") ||
    lower.includes("browser") ||
    lower.includes("navigate to") ||
    lower.includes("research this url")
  );
}

export function extractUrl(message: string) {
  const match = String(message || "").match(/https?:\/\/[^\s"'<>]+/i);
  return match ? match[0] : null;
}

export async function runAgentBrowserTool({
  projectId,
  sessionId,
  runtimeSessionId,
  message,
}: {
  projectId?: string | null;
  sessionId?: string | null;
  runtimeSessionId?: string | null;
  message: string;
}) {
  const url = extractUrl(message);

  if (!url) {
    return {
      ok: false,
      intent: "browser_automation",
      reply: "Browser automation failed: No URL detected.",
      actions: [{ type: "browser_run", status: "blocked", reason: "no_url" }],
    };
  }

  const result = await runBrowserTask({
    projectId: projectId || null,
    sessionId: sessionId || null,
    runtimeSessionId: runtimeSessionId || null,
    url,
    source: "agent_tool",
  });

  const task: any = result.task;

  if (!result.ok) {
    return {
      ok: false,
      intent: "browser_automation",
      reply: `Browser automation failed: ${result.error || task?.error || "Unknown error"}`,
      actions: [
        {
          type: "browser_run",
          projectId,
          taskId: task?.id,
          status: task?.status,
          url,
        },
      ],
      result: task,
      error: result.error || task?.error || null,
    };
  }

  return {
    ok: true,
    intent: "browser_automation",
    reply: `Browser automation completed successfully. Task ID: ${task?.id}.`,
    actions: [
      {
        type: "browser_run",
        projectId,
        taskId: task?.id,
        status: task?.status,
        url,
        title: task?.title,
      },
    ],
    result: task,
    error: null,
  };
}
