export type SRPMessage =
  | { type: "connected"; sessionId: string; createdAt: string }
  | { type: "heartbeat"; sessionId: string; createdAt: string }
  | { type: "agent_token"; content: string; createdAt?: string }
  | { type: "agent_complete"; content: string; createdAt?: string }
  | { type: "agent_message"; from: string; to: string; role: string; content: string; createdAt?: string }
  | { type: "tool_call"; tool: string; args: any; createdAt?: string }
  | { type: "tool_result"; tool: string; result: any; createdAt?: string }
  | { type: "builder_update"; draft: any; createdAt?: string }
  | { type: "cloud_job_update"; status: string; result?: any; createdAt?: string }
  | { type: "error"; message: string; createdAt?: string };
