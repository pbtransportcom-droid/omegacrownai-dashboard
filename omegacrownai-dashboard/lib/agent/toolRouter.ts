import type { AgentIntent, ToolLog } from "./types";

export async function executeToolsForIntent(
  intent: AgentIntent,
  message: string,
  context?: any
): Promise<{ actions: string[]; toolLogs: ToolLog[] }> {
  const actions: string[] = [];
  const toolLogs: ToolLog[] = [];
  const sessionId = context?.sessionId || "unknown_session";

  function log(toolName: string, input: any, output: any, status: "success" | "error" = "success") {
    toolLogs.push({
      sessionId,
      toolName,
      input,
      output,
      status,
      createdAt: new Date().toISOString(),
    });
  }

  switch (intent) {
    case "website_build":
      if (context?.projectId) {
        actions.push("used_existing_project");
        log("useProject", { projectId: context.projectId }, { ok: true });
      } else {
        actions.push("project_needed");
        log("projectNeeded", { message }, { ok: true, note: "Frontend can create project or pass projectId." });
      }
      actions.push("website_build_planned");
      log("planWebsiteBuild", { message, projectId: context?.projectId }, { ok: true });
      break;

    case "website_edit":
      actions.push("website_edit_planned");
      log("planWebsiteEdit", { message, projectId: context?.projectId }, { ok: true });
      break;

    case "website_publish":
      actions.push("website_publish_planned");
      log("planWebsitePublish", { projectId: context?.projectId }, { ok: true });
      break;

    case "trading_scan":
      actions.push("trading_scan_planned");
      log("planTradingScan", { message }, { ok: true });
      break;

    case "video_create":
      actions.push("video_create_planned");
      log("planVideoCreate", { message, projectId: context?.projectId }, { ok: true });
      break;

    case "automation_plan":
      actions.push("generated_automation_plan");
      log("automationPlanner", { message }, { ok: true });
      break;

    case "general_chat":
    default:
      actions.push("chat_reply");
      break;
  }

  return { actions, toolLogs };
}
