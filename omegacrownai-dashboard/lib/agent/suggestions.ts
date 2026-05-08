import type { AgentIntent } from "./types";

export function buildReply(intent: AgentIntent, actions: string[], context?: any): string {
  switch (intent) {
    case "website_build":
      return actions.includes("used_existing_project")
        ? "I prepared a website build plan using your current project."
        : "I prepared a website build plan. Next, I can create or open a website project workspace.";

    case "website_edit":
      return "I prepared the website edit plan. Tell me which section to update, or use the section editor.";

    case "website_publish":
      return "I prepared the website publish plan. Confirm the build and slug before publishing.";

    case "trading_scan":
      return "I prepared a trading scan plan. Run the market scanner to see ranked signals.";

    case "video_create":
      return "I prepared a video creation plan. Continue in the video creator to generate your draft.";

    case "automation_plan":
      return "I created an automation plan outline. We can turn it into a live workflow next.";

    case "general_chat":
    default:
      return "I understand. I can help route this into a website, video, trading scan, automation, or chat workflow.";
  }
}

export function buildNextSuggestions(intent: AgentIntent, actions: string[], context?: any): string[] {
  switch (intent) {
    case "website_build":
      return ["Create project", "Edit website sections", "Upload logo", "Publish website"];
    case "website_edit":
      return ["Preview website", "Edit colors", "Add pricing", "Publish website"];
    case "website_publish":
      return ["Copy public link", "Create promo video", "Share website"];
    case "trading_scan":
      return ["Scan saved watchlist", "Set BUY WATCH alert", "Analyze one symbol"];
    case "video_create":
      return ["Generate video", "Upload photos", "Add logo watermark"];
    case "automation_plan":
      return ["Add trigger", "Add email step", "Save workflow"];
    case "general_chat":
    default:
      return ["Build website", "Create video", "Analyze market", "Plan automation"];
  }
}
