export type AgentIntent =
  | "website_build"
  | "website_edit"
  | "website_publish"
  | "trading_scan"
  | "video_create"
  | "automation_plan"
  | "general_chat";

export interface AgentRunRequest {
  userId: string;
  sessionId: string;
  message: string;
  context?: {
    projectId?: string;
    channel?: "web_app" | "mobile_app" | "api";
    [key: string]: any;
  };
}

export interface AgentRunResponse {
  ok: boolean;
  intent: AgentIntent;
  plan: string[];
  reply: string;
  actions: string[];
  nextSuggestions: string[];
}

export type ToolLog = {
  sessionId: string;
  toolName: string;
  input: any;
  output: any;
  status: "success" | "error";
  createdAt: string;
};
