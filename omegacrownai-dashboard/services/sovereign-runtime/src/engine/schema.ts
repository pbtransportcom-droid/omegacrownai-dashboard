export type RuntimeStatus =
  | "created"
  | "queued"
  | "running"
  | "agent_chain"
  | "artifacts"
  | "validation"
  | "delivery"
  | "completed"
  | "error";

export type AgentRun = {
  name: string;
  role: string;
  output: string;
  status: string;
  timestamp: string;
};

export type RuntimeArtifact = {
  type: string;
  title: string;
  path: string;
  status: string;
};

export type RuntimeRun = {
  ok: boolean;
  projectId: string;
  runtimeId: string;
  mode: string;
  prompt: string;
  status: RuntimeStatus;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  events: string[];
  agents: AgentRun[];
  artifacts: RuntimeArtifact[];
  validation: any;
  delivery: any;
  summary: any;
  error?: string;
};
