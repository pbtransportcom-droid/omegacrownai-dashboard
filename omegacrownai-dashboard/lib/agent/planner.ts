import type { AgentIntent } from "./types";

export function createPlan(intent: AgentIntent, message: string, context?: any): string[] {
  switch (intent) {
    case "website_build":
      return [
        "Understand the business and website goal.",
        "Create or use a project workspace.",
        "Generate a premium website draft.",
        "Prepare the website for preview and editing.",
      ];

    case "website_edit":
      return [
        "Identify the requested website change.",
        "Map the change to website sections or theme settings.",
        "Update the website draft.",
        "Prepare the updated version for preview.",
      ];

    case "website_publish":
      return [
        "Verify the project website draft exists.",
        "Prepare the website for publishing.",
        "Create or update the public website link.",
        "Return the shareable website URL.",
      ];

    case "trading_scan":
      return [
        "Identify the requested market or watchlist.",
        "Run a trading signal scan.",
        "Rank opportunities by confidence and risk.",
        "Return educational market analysis.",
      ];

    case "video_create":
      return [
        "Understand the video purpose and style.",
        "Prepare a video concept or prompt.",
        "Route the request to the video creation tool.",
        "Return the next steps for preview or rendering.",
      ];

    case "automation_plan":
      return [
        "Understand the automation goal.",
        "Break it into triggers, steps, and outcomes.",
        "Create a workflow plan.",
        "Suggest what can be automated next.",
      ];

    case "general_chat":
    default:
      return [
        "Understand the user request.",
        "Respond clearly and helpfully.",
        "Suggest the next useful action.",
      ];
  }
}
