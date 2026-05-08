import { apiFetch } from "./http";

export interface WorkflowResult {
  trigger: string;
  actions: string[];
  status: "active" | "paused";
}

export async function generateWorkflow(
  prompt: string,
  token?: string
) {
  return apiFetch<WorkflowResult>("/api/ai/workflow/generate", {
    method: "POST",
    token,
    body: JSON.stringify({ prompt }),
  });
}
