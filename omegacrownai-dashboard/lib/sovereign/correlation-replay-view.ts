export function getCorrelationReplayViewBlueprint() {
  return {
    system: "OmegaCrownAI Correlation Replay View Blueprint",
    phase: "v18.8 Phase 208",
    status: "correlation_replay_blueprint_ready",
    purpose:
      "Define how OmegaCrownAI replays related audit, execution, connector, deployment, memory, incident, and governance events by correlation id without exposing secrets.",
    corePrinciple:
      "Every important workflow should be traceable through a correlation id so customers/admins can understand what happened, why it happened, what evidence exists, and what recovery path is available.",

    correlationModel: {
      correlationId: "stable trace id linking related events",
      workflowName: "human-readable workflow name",
      startedAt: "ISO timestamp",
      completedAt: "ISO timestamp or null",
      status: "succeeded | failed | blocked | needs_review | partial",
      riskLevel: "low | medium | high | blocked_by_default",
      eventCount: "number of linked events",
      redacted: true,
    },

    replayPanels: [
      {
        panel: "Replay Header",
        purpose:
          "Shows correlation id, workflow name, status, risk, start/end timestamps, event count, and redaction state.",
        requiredElements: [
          "correlation id",
          "workflow name",
          "status badge",
          "risk badge",
          "event count",
          "redaction badge",
        ],
      },
      {
        panel: "Event Sequence Timeline",
        purpose:
          "Shows the chronological event sequence across execution, connector, deployment, incident, memory, and governance records.",
        requiredElements: [
          "sequence number",
          "timestamp",
          "event type",
          "source",
          "decision",
          "status",
          "evidence count",
        ],
      },
      {
        panel: "Evidence Chain",
        purpose:
          "Shows safe evidence labels, references, hashes, smoke-test results, route checks, and audit links.",
        requiredElements: [
          "safe evidence labels",
          "metadata references",
          "input/output hashes",
          "smoke-test evidence",
          "route evidence",
          "audit event references",
        ],
      },
      {
        panel: "Approval / Blocked Markers",
        purpose:
          "Highlights approval-required, denied, blocked, and blocked-by-default events.",
        requiredElements: [
          "approval required",
          "approved or denied",
          "blocked marker",
          "policy reason",
          "next action",
        ],
      },
      {
        panel: "Recovery / Rollback",
        purpose:
          "Shows rollback availability, recovery notes, known-good commit, safe retry path, and owner review requirement.",
        requiredElements: [
          "rollback available",
          "rollback reference",
          "recovery note",
          "safe retry path",
          "owner review requirement",
        ],
      },
      {
        panel: "Redacted Export",
        purpose:
          "Exports the correlation replay package for support, enterprise review, compliance, or incident reporting.",
        requiredElements: [
          "redacted timeline",
          "safe evidence chain",
          "correlation summary",
          "reviewer notes",
          "secret exclusions",
        ],
      },
    ],

    eventTypes: [
      "connector_permission_decision",
      "connector_install",
      "connector_disconnect",
      "execution_action_run",
      "memory_write",
      "deployment",
      "incident",
      "governance_decision",
    ],

    replayEventShape: {
      sequence: "integer",
      auditId: "audit event id",
      eventType: "allowed event type",
      source: "source subsystem",
      actor: "actor label",
      role: "role label",
      decision: "allow | require_approval | block | approved | denied | not_required",
      status: "planned | running | succeeded | failed | blocked | needs_review",
      riskLevel: "low | medium | high | blocked_by_default",
      evidence: "safe evidence labels only",
      metadataRef: "hash/reference only",
      redacted: true,
      createdAt: "ISO timestamp",
    },

    sampleReplay: {
      correlationId: "corr_phase_208_sample",
      workflowName: "GitHub PR draft preparation with audit review",
      status: "needs_review",
      riskLevel: "medium",
      redacted: true,
      events: [
        {
          sequence: 1,
          auditId: "audit_connector_install_github",
          eventType: "connector_install",
          source: "connector_install_store",
          actor: "admin",
          role: "Admin",
          decision: "approved",
          status: "succeeded",
          riskLevel: "medium",
          evidence: ["manifest validation passed", "install review approved"],
          metadataRef: "metadata_ref_connector_install",
          redacted: true,
          createdAt: "2026-05-18T00:00:00.000Z",
        },
        {
          sequence: 2,
          auditId: "audit_permission_gate_github_pr",
          eventType: "connector_permission_decision",
          source: "connector_permission_gate",
          actor: "admin",
          role: "Governance Agent",
          decision: "allow",
          status: "succeeded",
          riskLevel: "medium",
          evidence: ["permission connector_write_draft", "workspace_write gate"],
          metadataRef: "metadata_ref_permission_gate",
          redacted: true,
          createdAt: "2026-05-18T00:00:01.000Z",
        },
        {
          sequence: 3,
          auditId: "audit_execution_github_pr_draft",
          eventType: "execution_action_run",
          source: "execution_runner",
          actor: "admin",
          role: "Execution Agent",
          decision: "allow",
          status: "needs_review",
          riskLevel: "medium",
          evidence: ["draft generated", "audit context present", "no merge performed"],
          metadataRef: "metadata_ref_execution",
          redacted: true,
          createdAt: "2026-05-18T00:00:02.000Z",
        },
      ],
    },

    replayRules: [
      "Replay must be grouped by correlationId.",
      "Replay events must be ordered by createdAt and sequence.",
      "Replay must show redacted records only.",
      "Replay must preserve event type, source, decision, status, and risk.",
      "Replay must show evidence labels and metadata references only.",
      "Replay must never show raw secrets, tokens, passwords, API keys, authorization headers, or private keys.",
      "Blocked and approval-required events must be visually marked.",
      "Rollback/recovery notes must be visible when available.",
      "Export package must be redacted.",
    ],

    exportPackageShape: {
      exportType: "redacted_correlation_replay_package",
      correlationId: "workflow trace id",
      workflowSummary: "safe summary",
      events: "redacted replay events",
      evidenceChain: "safe evidence labels and references",
      recoveryNotes: "rollback or next action",
      excludedSensitiveData: [
        "raw OAuth tokens",
        "API keys",
        "passwords",
        "authorization headers",
        "private keys",
        "raw sensitive payloads",
      ],
    },

    nextImplementationPhases: [
      "Correlation Replay API Persistence",
      "Correlation Replay UI Page",
      "Audit Export API",
      "Execution Action Review UI",
      "Incident Timeline Review",
    ],
  };
}
