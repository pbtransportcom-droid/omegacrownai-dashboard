import {
  AgentProfile,
  hashIdentityPayload,
  signAgentIdentity
} from "@/lib/identity-kernel/sovereign-identity-kernel";
import {
  PolicyEvaluationContext,
  evaluatePolicies,
  samplePolicies
} from "@/lib/global-policy-engine/global-policy-engine";

export type DebateMessage = {
  id: string;
  agentId: string;
  agentRole: string;
  content: string;
  identitySignature: string;
  timestamp: string;
  scoreSeed: number;
};

export type Critique = {
  id: string;
  criticAgentId: string;
  targetAgentId: string;
  issues: string[];
  score: number;
  timestamp: string;
};

export type ConsensusResult = {
  winnerAgentId: string;
  winningMessageId: string;
  reasoning: string;
  combinedScore: number;
  rankedAgents: {
    agentId: string;
    score: number;
  }[];
};

export type ExecutionPlan = {
  id: string;
  agentId: string;
  action: "generate" | "publish" | "store" | "execute" | "review";
  tool: string;
  args: Record<string, unknown>;
  identitySignature: string;
  policyDecision: "allow" | "deny";
};

export type MemoryWrite = {
  id: string;
  agentId: string;
  sourceMessageId: string;
  memoryType: "consensus" | "critique" | "execution" | "lesson";
  content: string;
  approved: boolean;
};

export type OrchestrationResult = {
  phase: "v6.5 Phase 86";
  prompt: string;
  startedAt: string;
  completedAt: string;
  debateMessages: DebateMessage[];
  critiques: Critique[];
  consensus: ConsensusResult;
  executionPlan: ExecutionPlan;
  memoryWrites: MemoryWrite[];
  policyAllowed: boolean;
};

export type SpineAgent = AgentProfile & {
  department: "strategy" | "creative" | "security" | "operations" | "growth";
  perspective: string;
};

export const sampleSpineAgents: SpineAgent[] = [
  {
    agentId: "agent_strategy_director",
    role: "strategy_director",
    department: "strategy",
    perspective:
      "Prioritize business value, sequence, customer impact, and roadmap alignment.",
    version: "v6.5.86",
    constitutionVersion: "omega-constitution-v1",
    capabilities: [
      {
        name: "strategic_planning",
        version: "1.0.0",
        scope: "company"
      }
    ],
    environment: {
      runtime: "nextjs",
      region: "production",
      model: "internal",
      provider: "omegacrownai"
    },
    behavior: {
      safetyBias: 1,
      creativityBias: 0.7,
      precisionBias: 0.9,
      complianceBias: 1,
      tone: "executive"
    }
  },
  {
    agentId: "agent_security_governor",
    role: "security_governor",
    department: "security",
    perspective:
      "Prioritize tenant isolation, auditability, policy enforcement, and enterprise risk controls.",
    version: "v6.5.86",
    constitutionVersion: "omega-constitution-v1",
    capabilities: [
      {
        name: "security_review",
        version: "1.0.0",
        scope: "security"
      }
    ],
    environment: {
      runtime: "nextjs",
      region: "production",
      model: "internal",
      provider: "omegacrownai"
    },
    behavior: {
      safetyBias: 1,
      creativityBias: 0.45,
      precisionBias: 1,
      complianceBias: 1,
      tone: "security"
    }
  },
  {
    agentId: "agent_growth_operator",
    role: "growth_operator",
    department: "growth",
    perspective:
      "Prioritize distribution readiness, onboarding, activation, customer success, and measurable outcomes.",
    version: "v6.5.86",
    constitutionVersion: "omega-constitution-v1",
    capabilities: [
      {
        name: "growth_execution",
        version: "1.0.0",
        scope: "distribution"
      }
    ],
    environment: {
      runtime: "nextjs",
      region: "production",
      model: "internal",
      provider: "omegacrownai"
    },
    behavior: {
      safetyBias: 0.9,
      creativityBias: 0.85,
      precisionBias: 0.8,
      complianceBias: 0.9,
      tone: "growth"
    }
  }
];

export function runDebate(params: {
  prompt: string;
  agents?: SpineAgent[];
}): DebateMessage[] {
  const agents = params.agents ?? sampleSpineAgents;

  return agents.map((agent) => {
    const signature = signAgentIdentity(agent);
    const content = `${agent.role} recommends: ${agent.perspective} For prompt "${params.prompt}", proceed only after identity, policy, reliability, and customer-impact checks pass.`;
    const scoreSeed = hashIdentityPayload({
      agentId: agent.agentId,
      prompt: params.prompt,
      content
    }).charCodeAt(0);

    return {
      id: `debate_${agent.agentId}_${Date.now()}`,
      agentId: agent.agentId,
      agentRole: agent.role,
      content,
      identitySignature: signature.identitySignature,
      timestamp: new Date().toISOString(),
      scoreSeed
    };
  });
}

export function runCritique(messages: DebateMessage[]): Critique[] {
  const critiques: Critique[] = [];

  for (const critic of messages) {
    for (const target of messages) {
      if (critic.agentId === target.agentId) continue;

      const issues: string[] = [];

      if (!target.identitySignature) {
        issues.push("Missing identity signature.");
      }

      if (!target.content.toLowerCase().includes("policy")) {
        issues.push("Policy enforcement was not addressed.");
      }

      if (!target.content.toLowerCase().includes("customer")) {
        issues.push("Customer impact was not addressed.");
      }

      const score = Math.max(0.1, 1 - issues.length * 0.2);

      critiques.push({
        id: `critique_${critic.agentId}_${target.agentId}_${Date.now()}`,
        criticAgentId: critic.agentId,
        targetAgentId: target.agentId,
        issues,
        score,
        timestamp: new Date().toISOString()
      });
    }
  }

  return critiques;
}

export function computeConsensus(params: {
  messages: DebateMessage[];
  critiques: Critique[];
}): ConsensusResult {
  const scores: Record<string, number> = {};

  for (const message of params.messages) {
    scores[message.agentId] = 1 + message.scoreSeed / 1000;
  }

  for (const critique of params.critiques) {
    scores[critique.targetAgentId] = (scores[critique.targetAgentId] ?? 1) + critique.score;
  }

  const rankedAgents = Object.entries(scores)
    .map(([agentId, score]) => ({
      agentId,
      score: Number(score.toFixed(4))
    }))
    .sort((a, b) => b.score - a.score);

  const winner = rankedAgents[0];
  const winningMessage = params.messages.find(
    (message) => message.agentId === winner.agentId
  );

  return {
    winnerAgentId: winner.agentId,
    winningMessageId: winningMessage?.id ?? "unknown",
    reasoning:
      "Winner selected by deterministic debate seed plus critique scores. Identity signatures are required for every debate contribution.",
    combinedScore: winner.score,
    rankedAgents
  };
}

export function createExecutionPlan(params: {
  prompt: string;
  winner: SpineAgent;
  consensus: ConsensusResult;
}): ExecutionPlan {
  const signature = signAgentIdentity(params.winner);
  const policyContext: PolicyEvaluationContext = {
    region: "US",
    agentId: params.winner.agentId,
    channel: "internal",
    actionType: "execute",
    contentType: "text",
    riskLevel: "medium",
    identitySignature: signature.identitySignature,
    orgId: "org_demo",
    projectId: "project_demo",
    metadata: {
      phase: "v6.5 Phase 86",
      consensusWinner: params.consensus.winnerAgentId
    }
  };

  const policyResult = evaluatePolicies({
    policies: samplePolicies,
    context: policyContext,
    payload: {
      prompt: params.prompt
    }
  });

  return {
    id: `execution_plan_${Date.now()}`,
    agentId: params.winner.agentId,
    action: "execute",
    tool: "orchestration_spine_foundation",
    args: {
      prompt: params.prompt,
      consensus: params.consensus
    },
    identitySignature: signature.identitySignature,
    policyDecision: policyResult.allowed ? "allow" : "deny"
  };
}

export function arbitrateMemory(params: {
  messages: DebateMessage[];
  consensus: ConsensusResult;
}): MemoryWrite[] {
  return params.messages.map((message) => ({
    id: `memory_${message.id}`,
    agentId: message.agentId,
    sourceMessageId: message.id,
    memoryType:
      message.agentId === params.consensus.winnerAgentId ? "consensus" : "lesson",
    content:
      message.agentId === params.consensus.winnerAgentId
        ? `Consensus memory: ${message.content}`
        : `Supporting debate memory: ${message.content}`,
    approved: message.agentId === params.consensus.winnerAgentId
  }));
}

export function runOrchestration(params: {
  prompt: string;
  agents?: SpineAgent[];
}): OrchestrationResult {
  const startedAt = new Date().toISOString();
  const agents = params.agents ?? sampleSpineAgents;
  const debateMessages = runDebate({
    prompt: params.prompt,
    agents
  });
  const critiques = runCritique(debateMessages);
  const consensus = computeConsensus({
    messages: debateMessages,
    critiques
  });
  const winner = agents.find((agent) => agent.agentId === consensus.winnerAgentId) ?? agents[0];
  const executionPlan = createExecutionPlan({
    prompt: params.prompt,
    winner,
    consensus
  });
  const memoryWrites = arbitrateMemory({
    messages: debateMessages,
    consensus
  });

  return {
    phase: "v6.5 Phase 86",
    prompt: params.prompt,
    startedAt,
    completedAt: new Date().toISOString(),
    debateMessages,
    critiques,
    consensus,
    executionPlan,
    memoryWrites,
    policyAllowed: executionPlan.policyDecision === "allow"
  };
}

export const multiAgentSpineControls = [
  {
    area: "Debate engine",
    control:
      "Multiple department agents produce signed perspectives before execution."
  },
  {
    area: "Critique engine",
    control:
      "Agents critique each other for missing identity, policy, customer, reliability, and execution considerations."
  },
  {
    area: "Consensus engine",
    control:
      "A deterministic scoring process selects the winning agent contribution."
  },
  {
    area: "Execution planning",
    control:
      "The winning agent creates an execution plan with identity signature and policy decision."
  },
  {
    area: "Memory arbitration",
    control:
      "Consensus messages are approved for memory while non-winning messages are retained as supporting lessons."
  },
  {
    area: "Identity and policy integration",
    control:
      "Every debate contribution is identity-signed and every execution plan is evaluated by the Global Policy Engine foundation."
  }
];
