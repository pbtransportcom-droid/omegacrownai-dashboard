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

const allowedQueryFilters = [
  "eventType",
  "actor",
  "role",
  "source",
  "riskLevel",
  "decision",
  "status",
  "correlationId",
  "createdFrom",
  "createdTo",
];

const allowedSortFields = ["createdAt", "eventType", "riskLevel", "status"];

type AuditEventQueryInput = {
  eventType?: string;
  actor?: string;
  role?: string;
  source?: string;
  riskLevel?: string;
  decision?: string;
  status?: string;
  correlationId?: string;
  createdFrom?: string;
  createdTo?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: string;
};

function safePageSize(pageSize?: number) {
  if (!pageSize || Number.isNaN(pageSize)) return 25;
  return Math.min(Math.max(pageSize, 1), 100);
}

export function validateAuditEventQuery(input: AuditEventQueryInput) {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (input.eventType && !allowedEventTypes.includes(input.eventType)) {
    errors.push(`Unsupported eventType: ${input.eventType}`);
  }

  if (input.sortBy && !allowedSortFields.includes(input.sortBy)) {
    errors.push(`Unsupported sortBy field: ${input.sortBy}`);
  }

  if (
    input.sortDirection &&
    !["asc", "desc"].includes(input.sortDirection.toLowerCase())
  ) {
    errors.push("sortDirection must be asc or desc.");
  }

  if (input.pageSize && input.pageSize > 100) {
    warnings.push("pageSize capped at 100.");
  }

  if (!input.correlationId && !input.eventType && !input.actor && !input.source) {
    warnings.push("Broad query requested; production implementation should require pagination and access control.");
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    normalized: {
      ...input,
      page: input.page && input.page > 0 ? input.page : 1,
      pageSize: safePageSize(input.pageSize),
      sortBy: input.sortBy || "createdAt",
      sortDirection: input.sortDirection || "desc",
    },
  };
}

export function createAuditEventQueryPreview(input: AuditEventQueryInput) {
  const validation = validateAuditEventQuery(input);

  const sampleEvents = [
    {
      auditId: "audit_write_execution_action_run_corr_phase_205_sample",
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
      metadataRef: "metadata_hash_or_ref_placeholder",
      redacted: true,
      createdAt: "2026-05-18T00:00:00.000Z",
    },
    {
      auditId: "audit_write_connector_permission_decision_corr_connector_permission_sample",
      eventType: "connector_permission_decision",
      actor: "admin",
      role: "Governance Agent",
      source: "connector_permission_gate",
      riskLevel: "high",
      decision: "require_approval",
      status: "needs_review",
      correlationId: "corr_connector_permission_sample",
      evidence: [
        "permission gate decision",
        "approval required",
        "audit context present",
      ],
      metadataRef: "metadata_hash_or_ref_placeholder",
      redacted: true,
      createdAt: "2026-05-18T00:00:01.000Z",
    },
  ];

  return {
    ok: validation.ok,
    queryMode: "blueprint_preview",
    appendOnlyRead: true,
    filters: validation.normalized,
    validation,
    pagination: {
      page: validation.normalized.page,
      pageSize: validation.normalized.pageSize,
      totalItems: sampleEvents.length,
      totalPages: 1,
      hasNextPage: false,
    },
    results: sampleEvents,
    responseRules: [
      "Return redacted events only.",
      "Return metadata references, not raw payloads.",
      "Never return raw secrets, tokens, passwords, API keys, or authorization headers.",
      "Preserve correlationId for replay and traceability.",
      "Apply access control before returning tenant/workspace records.",
    ],
  };
}

export function getAuditEventQueryApiBlueprint() {
  const sampleQuery = {
    eventType: "execution_action_run",
    source: "execution_runner",
    status: "succeeded",
    correlationId: "corr_phase_205_sample",
    page: 1,
    pageSize: 25,
    sortBy: "createdAt",
    sortDirection: "desc",
  };

  const sampleResult = createAuditEventQueryPreview(sampleQuery);

  return {
    system: "OmegaCrownAI Audit Event Query API Blueprint",
    phase: "v18.6 Phase 206",
    status: "audit_query_api_blueprint_ready",
    purpose:
      "Define safe audit read/query behavior for execution, connector, memory, deployment, incident, and governance events.",
    corePrinciple:
      "Audit query responses must be filtered, paginated, redacted, access-controlled, and traceable by correlation ID without exposing secrets or raw sensitive payloads.",
    allowedEventTypes,
    allowedQueryFilters,
    allowedSortFields,
    paginationShape: {
      page: "positive integer",
      pageSize: "1-100",
      totalItems: "integer",
      totalPages: "integer",
      hasNextPage: "boolean",
    },
    redactedAuditEventShape: {
      auditId: "audit event id",
      eventType: "allowed audit event type",
      actor: "actor id or label",
      role: "role used",
      source: "source subsystem",
      riskLevel: "low | medium | high | blocked_by_default",
      decision: "allow | require_approval | block | approved | denied | not_required",
      status: "planned | queued | running | succeeded | failed | blocked | cancelled | rolled_back | needs_review",
      correlationId: "replay/trace id",
      evidence: "safe evidence labels",
      metadataRef: "hash/ref only, no raw sensitive payload",
      redacted: "true",
      createdAt: "ISO timestamp",
    },
    queryValidationRules: [
      "eventType must be allowed when provided.",
      "sortBy must be an allowed sort field.",
      "sortDirection must be asc or desc.",
      "pageSize must be capped at 100.",
      "Broad queries must be paginated.",
      "Tenant/workspace access control must be applied before returning records.",
      "Responses must be redacted.",
      "Raw secrets must never be returned.",
    ],
    sampleQuery,
    sampleResult,
    nextImplementationPhases: [
      "Audit Event Database Migration",
      "Audit Event Query Persistence",
      "Audit Event Review UI",
      "Correlation Replay View",
      "Incident Timeline Query API",
    ],
  };
}
