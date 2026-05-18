export function getPersistentAuditDatabaseSchema() {
  return {
    system: "OmegaCrownAI Persistent Audit Database Schema",
    phase: "v18.1 Phase 201",
    status: "schema_blueprint_ready",
    purpose:
      "Define durable database tables for connector decisions, execution actions, memory writes, deployments, incidents, and enterprise audit evidence.",
    corePrinciple:
      "Every high-value OmegaCrownAI action should be persistable, replayable, reviewable, and safe to audit without exposing secrets.",

    tables: [
      {
        name: "audit_events",
        purpose: "Canonical event table for all audit records.",
        fields: [
          "id",
          "event_type",
          "actor",
          "role",
          "source",
          "risk_level",
          "decision",
          "status",
          "correlation_id",
          "created_at",
        ],
      },
      {
        name: "connector_audit_events",
        purpose: "Stores connector permission-gate decisions and connector action evidence.",
        fields: [
          "id",
          "audit_event_id",
          "connector_id",
          "action_id",
          "permission",
          "requested_gate",
          "approval_required",
          "blocked",
          "user_approved",
          "input_hash",
          "output_hash",
          "rollback_note",
        ],
      },
      {
        name: "execution_audit_events",
        purpose: "Stores execution runner plans, dry-runs, approvals, results, and rollback evidence.",
        fields: [
          "id",
          "audit_event_id",
          "action_id",
          "execution_category",
          "approval_gate",
          "sandbox_mode",
          "result",
          "error_class",
          "rollback_available",
          "evidence_json",
        ],
      },
      {
        name: "memory_audit_events",
        purpose: "Stores governed memory writes, corrections, confidence labels, and forget/delete actions.",
        fields: [
          "id",
          "audit_event_id",
          "memory_id",
          "partition",
          "source_confidence",
          "write_reason",
          "previous_value_hash",
          "new_value_hash",
          "review_required",
        ],
      },
      {
        name: "deployment_audit_events",
        purpose: "Stores build, PM2, route smoke test, commit, and production verification evidence.",
        fields: [
          "id",
          "audit_event_id",
          "commit_hash",
          "build_status",
          "pm2_status",
          "route_checks_json",
          "log_check_status",
          "rollback_commit",
        ],
      },
      {
        name: "incident_events",
        purpose: "Stores reliability incidents, severity, root cause, recovery, and prevention notes.",
        fields: [
          "id",
          "audit_event_id",
          "severity",
          "service",
          "route",
          "error_class",
          "started_at",
          "resolved_at",
          "root_cause",
          "prevention_rule",
        ],
      },
    ],

    indexes: [
      "audit_events(event_type, created_at)",
      "audit_events(correlation_id)",
      "connector_audit_events(connector_id, action_id)",
      "execution_audit_events(action_id, result)",
      "memory_audit_events(memory_id, partition)",
      "deployment_audit_events(commit_hash)",
      "incident_events(severity, service, started_at)",
    ],

    retentionPolicy: [
      "Do not store raw secrets, tokens, passwords, API keys, or private credentials.",
      "Store hashes or references instead of sensitive payloads.",
      "Connector and execution audit events should be retained for enterprise review.",
      "Operational incident records should preserve root cause and prevention rules.",
      "User-requested deletion/forget flows must be respected where applicable.",
    ],

    migrationPlan: [
      "Create schema blueprint first.",
      "Add Prisma or SQL migration in a later phase.",
      "Add database-backed write APIs after schema approval.",
      "Backfill blueprint API events only if safe and useful.",
      "Add dashboard views after persistence is active.",
    ],

    nextImplementationPhases: [
      "Real Connector Install Store",
      "GitHub OAuth Connector Implementation",
      "Execution Runner Persistent Action Log",
      "Audit Event Write API",
      "Audit Event Review UI",
    ],
  };
}
