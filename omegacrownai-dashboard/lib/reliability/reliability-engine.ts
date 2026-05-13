import { hashIdentityPayload } from "@/lib/identity-kernel/sovereign-identity-kernel";

export type ErrorCategory =
  | "USER_INPUT"
  | "PROVIDER"
  | "POLICY"
  | "INFRA"
  | "AGENT_LOGIC"
  | "UNKNOWN";

export type ExecutionTrace = {
  id: string;
  agentId: string;
  identitySignature: string;
  input: unknown;
  output: unknown;
  startedAt: string;
  finishedAt: string;
  tools: {
    name: string;
    costUsd: number;
    latencyMs: number;
  }[];
  modelCost: {
    tokensIn: number;
    tokensOut: number;
    usd: number;
  };
  infraCost: {
    usd: number;
  };
  error?: {
    message: string;
    code?: string;
  };
};

export type ReplayResult = {
  executionId: string;
  originalHash: string;
  replayHash: string;
  match: boolean;
  driftOrNondeterminism: boolean;
  detail: string;
};

export type RCAResult = {
  executionId: string;
  rootCause: ErrorCategory;
  severity: "low" | "medium" | "high" | "critical";
  details: string;
  suggestedAction: string;
};

export type CostSummary = {
  executionId: string;
  totalUsd: number;
  modelUsd: number;
  toolUsd: number;
  infraUsd: number;
  totalLatencyMs: number;
  costRisk: "normal" | "watch" | "high";
};

export const sampleTrace: ExecutionTrace = {
  id: "trace_phase87_demo",
  agentId: "agent_strategy_director",
  identitySignature: "sample_identity_signature",
  input: {
    prompt: "Run governed enterprise workflow."
  },
  output: {
    result: "Workflow completed."
  },
  startedAt: new Date(Date.now() - 1400).toISOString(),
  finishedAt: new Date().toISOString(),
  tools: [
    {
      name: "identity_kernel",
      costUsd: 0.01,
      latencyMs: 120
    },
    {
      name: "policy_engine",
      costUsd: 0.01,
      latencyMs: 80
    },
    {
      name: "multi_agent_spine",
      costUsd: 0.04,
      latencyMs: 900
    }
  ],
  modelCost: {
    tokensIn: 1200,
    tokensOut: 420,
    usd: 0.08
  },
  infraCost: {
    usd: 0.02
  }
};

export function replayTrace(params: {
  trace: ExecutionTrace;
  replayOutput?: unknown;
}): ReplayResult {
  const originalHash = hashIdentityPayload(params.trace.output);
  const replayHash = hashIdentityPayload(params.replayOutput ?? params.trace.output);
  const match = originalHash === replayHash;

  return {
    executionId: params.trace.id,
    originalHash,
    replayHash,
    match,
    driftOrNondeterminism: !match,
    detail: match
      ? "Replay matched original output."
      : "Replay mismatch detected. Route to RCA and identity drift review."
  };
}

export function classifyError(trace: ExecutionTrace): ErrorCategory {
  const message = trace.error?.message?.toLowerCase() ?? "";

  if (!trace.error) return "UNKNOWN";
  if (message.includes("policy") || message.includes("denied")) return "POLICY";
  if (message.includes("provider") || message.includes("rate limit")) return "PROVIDER";
  if (message.includes("timeout") || message.includes("database") || message.includes("network")) return "INFRA";
  if (message.includes("invalid input") || message.includes("missing required")) return "USER_INPUT";
  if (message.includes("agent") || message.includes("reasoning")) return "AGENT_LOGIC";

  return "UNKNOWN";
}

export function runRCA(trace: ExecutionTrace): RCAResult {
  const rootCause = classifyError(trace);

  const suggestedActions: Record<ErrorCategory, string> = {
    USER_INPUT: "Validate request fields earlier and return actionable customer guidance.",
    PROVIDER: "Check provider status, credentials, rate limits, retries, and fallback adapters.",
    POLICY: "Review policy decision, identity signature, region scope, and violation logs.",
    INFRA: "Inspect deployment, database, network, queues, workers, and runtime logs.",
    AGENT_LOGIC: "Replay execution, compare output hashes, and route to identity drift review.",
    UNKNOWN: "Collect more trace context and escalate if recurrence is detected."
  };

  return {
    executionId: trace.id,
    rootCause,
    severity:
      rootCause === "POLICY" || rootCause === "INFRA"
        ? "high"
        : rootCause === "PROVIDER" || rootCause === "AGENT_LOGIC"
          ? "medium"
          : "low",
    details: trace.error?.message ?? "No error present; RCA sample returned from healthy trace.",
    suggestedAction: suggestedActions[rootCause]
  };
}

export function summarizeCost(trace: ExecutionTrace): CostSummary {
  const toolUsd = trace.tools.reduce((sum, tool) => sum + tool.costUsd, 0);
  const totalLatencyMs = trace.tools.reduce((sum, tool) => sum + tool.latencyMs, 0);
  const totalUsd = Number((trace.modelCost.usd + toolUsd + trace.infraCost.usd).toFixed(4));

  return {
    executionId: trace.id,
    totalUsd,
    modelUsd: trace.modelCost.usd,
    toolUsd: Number(toolUsd.toFixed(4)),
    infraUsd: trace.infraCost.usd,
    totalLatencyMs,
    costRisk: totalUsd > 1 ? "high" : totalUsd > 0.25 ? "watch" : "normal"
  };
}

export const reliabilityControls = [
  {
    area: "Execution trace",
    control:
      "Every governed execution should record agent identity, input, output, timing, tools, model cost, infra cost, and error context."
  },
  {
    area: "Replay",
    control:
      "Replay compares original and replay output hashes to detect non-determinism or drift."
  },
  {
    area: "RCA",
    control:
      "Root cause analysis classifies failures as user input, provider, policy, infrastructure, agent logic, or unknown."
  },
  {
    area: "Cost observability",
    control:
      "Model, tool, infrastructure, and latency costs must be visible per execution."
  },
  {
    area: "Incident escalation",
    control:
      "Policy failures, identity drift, provider-wide failures, and infra outages should escalate into the incident response layer."
  }
];
