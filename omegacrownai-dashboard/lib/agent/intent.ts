import type { AgentIntent } from "./types";

export function detectIntent(message: string, context?: any): AgentIntent {
  const text = String(message || "").toLowerCase();

  if (text.includes("publish") && (text.includes("website") || text.includes("site") || context?.projectId)) {
    return "website_publish";
  }

  if (
    (text.includes("edit") || text.includes("change") || text.includes("update") || text.includes("make it") || text.includes("add ")) &&
    (text.includes("website") || text.includes("site") || text.includes("hero") || text.includes("section") || text.includes("color") || context?.projectId)
  ) {
    return "website_edit";
  }

  if (
    text.includes("website") ||
    text.includes("landing page") ||
    text.includes("homepage") ||
    text.includes("web app") ||
    text.includes("dashboard") ||
    text.includes("build me") ||
    text.includes("build a")
  ) {
    return "website_build";
  }

  if (
    text.includes("trading") ||
    text.includes("scan market") ||
    text.includes("signals") ||
    text.includes("stock") ||
    text.includes("crypto") ||
    text.includes("watchlist")
  ) {
    return "trading_scan";
  }

  if (
    text.includes("video") ||
    text.includes("promo") ||
    text.includes("commercial") ||
    text.includes("ad video") ||
    text.includes("reel")
  ) {
    return "video_create";
  }

  if (
    text.includes("automation") ||
    text.includes("workflow") ||
    text.includes("automate") ||
    text.includes("follow up")
  ) {
    return "automation_plan";
  }

  return "general_chat";
}
