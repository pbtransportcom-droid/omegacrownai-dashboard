import { apiFetch } from "./http";
import type { ChatResponse, ChatAction } from "@/lib/types";

export interface ChatRequest {
  message: string;
  project_id?: string;
}

function normalizeActions(actions: any[] | undefined): ChatAction[] | undefined {
  if (!actions) return undefined;

  return actions.map((a) => {
    let safeType: ChatAction["type"] = "run_analysis";

    if (a?.type === "open_project") safeType = "open_project";
    if (a?.type === "open_file") safeType = "open_file";

    return {
      type: safeType,
      label: String(a?.label || "AI suggestion"),
      project_id: a?.project_id ? String(a.project_id) : undefined,
      path: a?.path ? String(a.path) : undefined,
      symbol: a?.symbol ? String(a.symbol) : undefined,
    };
  });
}

export async function sendChat(
  payload: ChatRequest,
  token?: string
): Promise<ChatResponse> {
  const data = await apiFetch<any>("/api/ai/chat", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });

  return {
    reply: String(data?.reply || "No response from AI"),
    actions: normalizeActions(data?.actions),
  };
}
