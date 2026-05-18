import {
  createAuditEventWritePreview,
  validateAuditEventWrite,
} from "@/lib/sovereign/audit-event-write-api";

type AuditPersistenceInput = {
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
  childRecordType?: string;
};

const childRecordRoutes = [
  {
    eventType: "connector_permission_decision",
    childTable: "connector_audit_events",
    purpose: "Persist connector permission gate and connector action evidence.",
  },
  {
    eventType: "connector_install",
    childTable: "connector_audit_events",
    purpose: "Persist connector install, approval, healthcheck, and disconnect audit evidence.",
  },
  {
    eventType: "execution_action_run",
    childTable: "execution_action_runs",
    purpose: "Persist execution runner action status, evidence, error, and rollback references.",
  },
  {
    eventType: "memory_write",
    childTable: "memory_audit_events",
    purpose: "Persist memory write/correction/forget audit records.",
  },
  {
    eventType: "deployment",
    childTable: "deployment_audit_events",
    purpose: "Persist build, PM2, route smoke test, commit, and rollback evidence.",
  },
  {
    eventType: "incident",
    childTable: "incident_events",
    purpose: "Persist reliability incidents, severity, root cause, and prevention rules.",
  },
];

export function createAuditEventPersistencePreview(input: AuditPersistenceInput) {
  const validation = validateAuditEventWrite(input);
  const writePreview = createAuditEventWritePreview(input);

  const route = childRecordRoutes.find((item) => item.eventType === input.eventType);

  return {
    ok: validation.ok,
    mode: "persistence_blueprint_preview",
    appendOnly: true,
    wouldInsert: validation.ok,
    auditEventInsert: {
      table: "audit_events",
      data: {
        id: writePreview.auditId,
        eventType: input.eventType || "unknown_event",
        actor: input.actor || "unknown_actor",
        role: input.role || "unknown_role",
        source: input.source || "unknown_source",
        riskLevel: input.riskLevel || "unknown_risk",
        decision: input.decision || "unknown_decision",
        status: input.status || "unknown_status",
        correlationId: input.correlationId || "missing_correlation",
        evidenceJson: input.evidence || [],
        metadataRef: input.metadata ? "metadata_hash_or_ref_placeholder" : null,
        redacted: true,
      },
    },
    childRecordRoute: route || null,
    childRecordInsert:
      route && validation.ok
        ? {
            table: route.childTable,
            auditEventId: writePreview.auditId,
            mode: "route_to_specialized_child_record",
          }
        : null,
    validation,
    writeResultShape: {
      ok: validation.ok,
      auditId: writePreview.auditId,
      correlationId: input.correlationId || "missing_correlation",
      eventType: input.eventType || "unknown_event",
      persisted: validation.ok,
      childRecordTable: route?.childTable || null,
      redacted: true,
      appendOnly: true,
    },
  };
}

export function getAuditEventWritePersistenceBlueprint() {
  const sampleValidWrite = createAuditEventPersistencePreview({
    eventType: "execution_action_run",
    actor: "admin",
    role: "Execution Agent",
    source: "execution_runner",
    riskLevel: "medium",
    decision: "allow",
    status: "succeeded",
    correlationId: "corr_phase_212_sample",
    evidence: ["build passed", "route smoke tests passed", "pm2 online"],
    metadata: {
      actionId: "deployment.next_build",
      inputHash: "input_hash_placeholder",
      outputHash: "output_hash_placeholder",
    },
  });

  const sampleRejectedWrite = createAuditEventPersistencePreview({
    eventType: "connector_install",
    actor: "admin",
    role: "Admin",
    source: "connector_install_store",
    riskLevel: "medium",
    decision: "approved",
    status: "succeeded",
    correlationId: "corr_phase_212_secret_reject",
    evidence: ["install approved"],
    metadata: {
      token: "bad_raw_token_should_be_rejected",
    },
  });

  return {
    system: "OmegaCrownAI Audit Event Write Persistence",
    phase: "v19.2 Phase 212",
    status: "audit_write_persistence_blueprint_ready",
    purpose:
      "Define how the Audit Event Write API becomes database-backed while preserving append-only behavior, validation, no-secret policy, redaction, correlation IDs, and specialized child-record routing.",
    corePrinciple:
      "No audit event should be persisted unless it passes validation, contains no raw secrets, includes a correlation ID, stores safe evidence only, and writes append-only records.",

    persistenceFlow: [
      "Receive audit write request.",
      "Validate event type, actor, role, source, risk, decision, status, correlationId, and evidence.",
      "Reject secret-like payloads before database insert.",
      "Normalize and redact metadata.",
      "Insert canonical audit_events parent record.",
      "Route specialized event types to child tables where applicable.",
      "Return redacted write result with auditId and correlationId.",
      "Never update existing audit events except future soft-retention/admin review metadata.",
    ],

    prismaWritePlan: {
      parentTable: "audit_events",
      parentCreateMethod: "prisma.auditEvent.create",
      childRouting:
        "After parent insert succeeds, route eventType to connector_audit_events, execution_action_runs, memory_audit_events, deployment_audit_events, or incident_events.",
      transactionRequired: true,
      appendOnly: true,
      redacted: true,
    },

    childRecordRoutes,

    requiredValidationBeforeInsert: [
      "eventType must be allowed.",
      "actor is required.",
      "role is required.",
      "source is required.",
      "riskLevel must be valid.",
      "decision must be valid.",
      "status must be valid.",
      "correlationId is required.",
      "evidence must include at least one item.",
      "secret-like content must be rejected.",
    ],

    noSecretPersistenceRules: [
      "Reject raw OAuth tokens.",
      "Reject API keys.",
      "Reject passwords.",
      "Reject bearer authorization headers.",
      "Reject private keys.",
      "Reject webhook secrets.",
      "Store metadataRef instead of raw metadata when metadata is sensitive or large.",
      "Persist redacted=true by default.",
    ],

    writeResultShape: {
      ok: "boolean",
      auditId: "created audit event id",
      correlationId: "trace/replay id",
      eventType: "allowed event type",
      persisted: "boolean",
      childRecordTable: "specialized child table or null",
      redacted: true,
      appendOnly: true,
    },

    sampleValidWrite,
    sampleRejectedWrite,

    nextImplementationPhases: [
      "Audit Event Query Persistence",
      "Audit Review UI Page",
      "Correlation Replay UI Page",
      "Audit Export Download Route",
      "Execution Runner Audit Write Integration",
    ],
  };
}
