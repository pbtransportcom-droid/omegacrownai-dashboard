export type PolicyScope = "global" | "region" | "org" | "project" | "agent";

export type PolicyEffect = "allow" | "deny";

export type PolicyActionType =
  | "generation"
  | "tool_call"
  | "publish"
  | "store"
  | "execute"
  | "billing"
  | "provider"
  | "export";

export type PolicyChannel = "web" | "api" | "marketplace" | "internal";

export type PolicyContentType = "text" | "image" | "audio" | "video" | "code" | "data";

export type PolicyRiskLevel = "low" | "medium" | "high" | "critical";

export type PolicyDefinition = {
  id: string;
  name: string;
  version: string;
  scope: PolicyScope;
  region?: string;
  orgId?: string;
  projectId?: string;
  agentId?: string;
  priority: number;
  enabled: boolean;
  effect: PolicyEffect;
  actionType: PolicyActionType;
  conditions: PolicyCondition[];
  reason: string;
};

export type PolicyConditionOperator =
  | "equals"
  | "not_equals"
  | "in"
  | "not_in"
  | "exists"
  | "missing";

export type PolicyCondition = {
  field: string;
  operator: PolicyConditionOperator;
  value?: string | string[] | boolean | number;
};

export type PolicyEvaluationContext = {
  region: string;
  agentId: string;
  channel: PolicyChannel;
  actionType: PolicyActionType;
  userId?: string;
  orgId?: string;
  projectId?: string;
  contentType?: PolicyContentType;
  riskLevel?: PolicyRiskLevel;
  identitySignature?: string;
  metadata?: Record<string, unknown>;
};

export type PolicyEvaluationResult = {
  allowed: boolean;
  decision: "allow" | "deny";
  reasons: string[];
  violatedPolicies: string[];
  appliedPolicies: string[];
  evaluatedAt: string;
  context: PolicyEvaluationContext;
};

export type PolicyConflict = {
  id: string;
  policies: string[];
  reason: string;
  resolution: string;
};

function readContextField(
  context: PolicyEvaluationContext,
  payload: Record<string, unknown>,
  field: string
): unknown {
  if (field.startsWith("metadata.")) {
    const key = field.replace("metadata.", "");
    return context.metadata?.[key];
  }

  if (field.startsWith("payload.")) {
    const key = field.replace("payload.", "");
    return payload[key];
  }

  return (context as unknown as Record<string, unknown>)[field] ?? payload[field];
}

export function evaluateCondition(
  condition: PolicyCondition,
  context: PolicyEvaluationContext,
  payload: Record<string, unknown>
): boolean {
  const value = readContextField(context, payload, condition.field);

  switch (condition.operator) {
    case "equals":
      return value === condition.value;
    case "not_equals":
      return value !== condition.value;
    case "in":
      return Array.isArray(condition.value) && condition.value.includes(String(value));
    case "not_in":
      return Array.isArray(condition.value) && !condition.value.includes(String(value));
    case "exists":
      return value !== undefined && value !== null && value !== "";
    case "missing":
      return value === undefined || value === null || value === "";
    default:
      return false;
  }
}

export function policyApplies(
  policy: PolicyDefinition,
  context: PolicyEvaluationContext,
  payload: Record<string, unknown>
): boolean {
  if (!policy.enabled) return false;
  if (policy.actionType !== context.actionType) return false;

  if (policy.scope === "region" && policy.region !== context.region) return false;
  if (policy.scope === "org" && policy.orgId !== context.orgId) return false;
  if (policy.scope === "project" && policy.projectId !== context.projectId) return false;
  if (policy.scope === "agent" && policy.agentId !== context.agentId) return false;

  return policy.conditions.every((condition) =>
    evaluateCondition(condition, context, payload)
  );
}

export function scopeRank(scope: PolicyScope): number {
  const ranks: Record<PolicyScope, number> = {
    global: 1,
    region: 2,
    org: 3,
    project: 4,
    agent: 5
  };

  return ranks[scope];
}

export function resolvePolicyOrder(policies: PolicyDefinition[]): PolicyDefinition[] {
  return [...policies].sort((a, b) => {
    if (a.priority !== b.priority) return b.priority - a.priority;
    if (scopeRank(a.scope) !== scopeRank(b.scope)) {
      return scopeRank(b.scope) - scopeRank(a.scope);
    }
    if (a.effect !== b.effect) {
      return a.effect === "deny" ? -1 : 1;
    }
    return a.id.localeCompare(b.id);
  });
}

export function evaluatePolicies(params: {
  policies: PolicyDefinition[];
  context: PolicyEvaluationContext;
  payload?: Record<string, unknown>;
}): PolicyEvaluationResult {
  const payload = params.payload ?? {};
  const ordered = resolvePolicyOrder(params.policies);

  const appliedPolicies: string[] = [];
  const violatedPolicies: string[] = [];
  const reasons: string[] = [];

  for (const policy of ordered) {
    const applies = policyApplies(policy, params.context, payload);
    if (!applies) continue;

    appliedPolicies.push(policy.id);

    if (policy.effect === "deny") {
      violatedPolicies.push(policy.id);
      reasons.push(policy.reason);
    }
  }

  const allowed = violatedPolicies.length === 0;

  return {
    allowed,
    decision: allowed ? "allow" : "deny",
    reasons,
    violatedPolicies: [...new Set(violatedPolicies)],
    appliedPolicies: [...new Set(appliedPolicies)],
    evaluatedAt: new Date().toISOString(),
    context: params.context
  };
}

export function detectPolicyConflicts(policies: PolicyDefinition[]): PolicyConflict[] {
  const conflicts: PolicyConflict[] = [];

  for (const left of policies) {
    for (const right of policies) {
      if (left.id >= right.id) continue;
      if (!left.enabled || !right.enabled) continue;
      if (left.actionType !== right.actionType) continue;
      if (left.effect === right.effect) continue;
      if (left.priority !== right.priority) continue;
      if (left.scope !== right.scope) continue;

      conflicts.push({
        id: `conflict_${left.id}_${right.id}`,
        policies: [left.id, right.id],
        reason:
          "Policies have the same action, priority, and scope but opposite effects.",
        resolution:
          "Fail-safe resolution applies: deny wins until a higher-priority or more-specific policy resolves the conflict."
      });
    }
  }

  return conflicts;
}

export const samplePolicies: PolicyDefinition[] = [
  {
    id: "policy_global_identity_required",
    name: "Identity signature required",
    version: "1.0.0",
    scope: "global",
    priority: 100,
    enabled: true,
    effect: "deny",
    actionType: "execute",
    conditions: [
      {
        field: "identitySignature",
        operator: "missing"
      }
    ],
    reason:
      "Execution is blocked because an identity signature is required for governed actions."
  },
  {
    id: "policy_high_risk_publish_block",
    name: "High-risk publishing requires review",
    version: "1.0.0",
    scope: "global",
    priority: 90,
    enabled: true,
    effect: "deny",
    actionType: "publish",
    conditions: [
      {
        field: "riskLevel",
        operator: "in",
        value: ["high", "critical"]
      }
    ],
    reason:
      "High-risk or critical publishing requires review before distribution."
  },
  {
    id: "policy_us_provider_execution_allowed",
    name: "US provider execution allowed",
    version: "1.0.0",
    scope: "region",
    region: "US",
    priority: 60,
    enabled: true,
    effect: "allow",
    actionType: "provider",
    conditions: [
      {
        field: "region",
        operator: "equals",
        value: "US"
      }
    ],
    reason:
      "Provider execution is allowed for US region when no higher-priority denial applies."
  },
  {
    id: "policy_enterprise_export_requires_org",
    name: "Enterprise export requires organization scope",
    version: "1.0.0",
    scope: "global",
    priority: 95,
    enabled: true,
    effect: "deny",
    actionType: "export",
    conditions: [
      {
        field: "orgId",
        operator: "missing"
      }
    ],
    reason:
      "Enterprise exports require organization scope."
  },
  {
    id: "policy_agent_internal_generation",
    name: "Internal generation allowed for foundation agent",
    version: "1.0.0",
    scope: "agent",
    agentId: "omega_agent_foundation",
    priority: 50,
    enabled: true,
    effect: "allow",
    actionType: "generation",
    conditions: [
      {
        field: "channel",
        operator: "equals",
        value: "internal"
      }
    ],
    reason:
      "Foundation agent may perform internal generation when no denial applies."
  }
];

export const policyEngineControls = [
  {
    area: "Policy registry",
    control:
      "Policies must be versioned, scoped, enabled or disabled, and selected by global, region, org, project, and agent context."
  },
  {
    area: "Policy evaluation",
    control:
      "Runtime evaluation must enforce allow and deny rules deterministically before sensitive actions."
  },
  {
    area: "Region awareness",
    control:
      "Region-scoped rules must overlay global rules for jurisdiction-aware governance."
  },
  {
    area: "Conflict resolution",
    control:
      "Higher priority wins; if priority is equal, more specific scope wins; if still tied, deny wins fail-safe."
  },
  {
    area: "Identity integration",
    control:
      "Governed actions should include identity signatures from the Sovereign Identity Kernel."
  },
  {
    area: "Enforcement hooks",
    control:
      "Pre-execution and post-execution enforcement hooks prepare the system for agent, provider, publishing, and marketplace governance."
  }
];

export const sampleEvaluationContext: PolicyEvaluationContext = {
  region: "US",
  agentId: "omega_agent_foundation",
  channel: "internal",
  actionType: "execute",
  contentType: "text",
  riskLevel: "low",
  identitySignature: "sample_identity_signature",
  orgId: "org_demo",
  projectId: "project_demo",
  metadata: {
    phase: "v6.4 Phase 85"
  }
};
