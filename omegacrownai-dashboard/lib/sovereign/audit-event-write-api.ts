type AuditEventWriteInput = {
  eventType?: string;
  actor?: string;
  role?: string;
  source?: string;
  riskLevel?: string;
  decision?: string;
  status?: string;
  correlationId?: string;
  evidence?: string[];
  metadata?: Record<string, unknown>;
};

const allowedEventTypes = [
  "connector_permission_decision",
  "connector_install",
  "connector_disconnect",
  "execution_action_run",
  "memory_write",
  "deployment",
  "incident",
  "governance_decision",
];

const allowedRiskLevels = ["low", "medium", "high", "blocked_by_default"];

const allowedDecisions = [
  "allow",
  "require_approval",
  "block",
  "approved",
  "denied",
  "not_required",
];

const allowedStatuses = [
  "planned",
  "queued",
  "running",
  "succeeded",
  "failed",
  "blocked",
  "cancelled",
  "rolled_back",
  "needs_review",
];

const secretLikePatterns = [
  "token",
  "secret",
  "password",
  "api_key",
  "apikey",
  "authorization",
  "bearer",
  "private_key",
];

function containsSecretLikeValue(value: unknown): boolean {
  const text = JSON.stringify(value || {}).toLowerCase();
  return secretLikePatterns.some((pattern) => text.includes(pattern));
}

function stableAuditId(input: AuditEventWriteInput) {
  const eventType = input.eventType || "unknown_event";
  const correlationId = input.correlationId || "no_correlation";
  return `audit_write_${eventType}_${correlationId}`.replace(/[^a-zA-Z0-9_]/g, "_");
}

export function validateAuditEventWrite(input: AuditEventWriteInput) {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!input.eventType || !allowedEventTypes.includes(input.eventType)) {
    errors.push("eventType is required and must be an allowed audit event type.");
  }

  if (!input.actor) errors.push("actor is required.");
  if (!input.role) errors.push("role is required.");
  if (!input.source) errors.push("source is required.");

  if (!input.riskLevel || !allowedRiskLevels.includes(input.riskLevel)) {
    errors.push("riskLevel is required and must be valid.");
  }

  if (!input.decision || !allowedDecisions.includes(input.decision)) {
    errors.push("decision is required and must be valid.");
  }

  if (!input.status || !allowedStatuses.includes(input.status)) {
    errors.push("status is required and must be valid.");
  }

  if (!input.correlationId) {
    errors.push("correlationId is required for replay and traceability.");
  }

  if (!Array.isArray(input.evidence) || input.evidence.length === 0) {
    errors.push("evidence must include at least one evidence item.");
  }

  if (containsSecretLikeValue(input)) {
    errors.push("Audit write payload appears to contain secret-like content.");
  }

  if (input.metadata && Object.keys(input.metadata).length > 20) {
    warnings.push("Large metadata payload should be stored by reference instead of inline.");
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
}

export function createAuditEventWritePreview(input: AuditEventWriteInput) {
  const validation = validateAuditEventWrite(input);

  return {
    ok: validation.ok,
    auditId: stableAuditId(input),
    appendOnly: true,
    writeMode: "blueprint_preview",
    eventType: input.eventType || "unknown_event",
    actor: input.actor || "unknown_actor",
    role: input.role || "unknown_role",
    source: input.source || "unknown_source",
    riskLevel: input.riskLevel || "unknown_risk",
    decision: input.decision || "unknown_decision",
    status: input.status || "unknown_status",
    correlationId: input.correlationId || "missing_correlation",
    evidence: input.evidence || [],
    metadataRef: input.metadata ? "metadata_hash_or_ref_placeholder" : null,
    validation,
    createdAt: new Date().toISOString(),
  };
}

export function getAuditEventWriteApiBlueprint() {
  const sampleWrite = {
    eventType: "execution_action_run",
    actor: "admin",
    role: "Execution Agent",
    source: "execution_runner",
    riskLevel: "medium",
    decision: "allow",
    status: "succeeded",
    correlationId: "corr_phase_205_sample",
    evidence: [
      "permission gate passed",
      "input hash recorded",
      "output hash recorded",
      "rollback note present",
    ],
    metadata: {
      actionId: "deployment.next_build",
      runMode: "approved_live_run",
      inputHash: "input_hash_placeholder",
      outputHash: "output_hash_placeholder",
    },
  };

  const sampleResult = createAuditEventWritePreview(sampleWrite);

  return {
    system: "OmegaCrownAI Audit Event Write API Blueprint",
    phase: "v18.5 Phase 205",
    status: "audit_write_api_blueprint_ready",
    purpose:
      "Define a safe append-only audit write API contract for execution, connector, memory, deployment, incident, and governance events.",
    corePrinciple:
      "Audit writes must be append-only, validated, correlation-linked, replayable, and redacted so no raw secrets or sensitive payloads are stored.",
    allowedEventTypes,
    allowedRiskLevels,
    allowedDecisions,
    allowedStatuses,
    requiredWriteFields: [
      "eventType",
      "actor",
      "role",
      "source",
      "riskLevel",
      "decision",
      "status",
      "correlationId",
      "evidence",
    ],
    validationRules: [
      "eventType must be allowed.",
      "actor, role, source, riskLevel, decision, status, and correlationId are required.",
      "evidence must include at least one evidence item.",
      "raw secrets, tokens, passwords, API keys, and authorization headers are rejected.",
      "large payloads should be stored by hash/reference instead of inline.",
      "audit writes are append-only.",
      "correlationId is required for replay and traceability.",
    ],
    redactionRules: [
      "Do not store raw OAuth tokens.",
      "Do not store API keys.",
      "Do not store passwords.",
      "Do not store bearer authorization headers.",
      "Do not store private keys.",
      "Use hashes or opaque references for payloads.",
    ],
    sampleWrite,
    sampleResult,
    nextImplementationPhases: [
      "Audit Event Database Migration",
      "Audit Event Write Persistence",
      "Audit Event Query API",
      "Audit Event Review UI",
      "Execution Runner Audit Integration",
    ],
  };
}
