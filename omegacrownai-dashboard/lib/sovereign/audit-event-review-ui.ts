export function getAuditEventReviewUiBlueprint() {
  return {
    system: "OmegaCrownAI Audit Event Review UI Blueprint",
    phase: "v18.7 Phase 207",
    status: "audit_review_ui_blueprint_ready",
    purpose:
      "Define the customer/admin UI for reviewing audit events, filtering events, inspecting evidence, following correlation replay links, and confirming redacted safe audit records.",
    corePrinciple:
      "Audit events must be easy to review, filter, trace, export, and understand without exposing raw secrets or sensitive payloads.",

    reviewPanels: [
      {
        panel: "Audit Timeline",
        purpose:
          "Displays audit event cards ordered by createdAt with event type, actor, role, source, status, decision, risk, and correlation id.",
        requiredElements: [
          "event type badge",
          "risk badge",
          "status badge",
          "decision badge",
          "actor/role line",
          "created timestamp",
          "correlation id link",
        ],
      },
      {
        panel: "Filter Controls",
        purpose:
          "Allows review by event type, actor, role, source, risk level, decision, status, correlation id, and date range.",
        requiredElements: [
          "event type filter",
          "actor filter",
          "role filter",
          "source filter",
          "risk filter",
          "decision filter",
          "status filter",
          "correlation id search",
          "date range",
        ],
      },
      {
        panel: "Evidence Drawer",
        purpose:
          "Shows safe evidence labels and metadata references for the selected audit event.",
        requiredElements: [
          "evidence list",
          "metadata ref",
          "redaction status",
          "safe payload note",
          "no raw secret warning",
        ],
      },
      {
        panel: "Correlation Replay",
        purpose:
          "Groups events with the same correlation id so execution, connector, deployment, memory, and incident events can be traced together.",
        requiredElements: [
          "correlation id",
          "event sequence",
          "related events",
          "replay-safe timeline",
          "export link",
        ],
      },
      {
        panel: "Approval and Blocked Actions",
        purpose:
          "Highlights approval-required events, denied events, blocked events, and policy blocks.",
        requiredElements: [
          "approval required marker",
          "blocked marker",
          "policy reason",
          "review required marker",
          "next action",
        ],
      },
      {
        panel: "Export / Review Path",
        purpose:
          "Provides redacted audit export package for enterprise review or customer support.",
        requiredElements: [
          "redacted export",
          "selected filters summary",
          "correlation export",
          "reviewer notes",
          "download/export path",
        ],
      },
    ],

    auditCardShape: {
      auditId: "audit event id",
      eventType: "connector_permission_decision | execution_action_run | deployment | incident | memory_write | governance_decision",
      title: "human readable audit title",
      actor: "actor label",
      role: "role label",
      source: "source subsystem",
      riskLevel: "low | medium | high | blocked_by_default",
      decision: "allow | require_approval | block | approved | denied | not_required",
      status: "planned | succeeded | failed | blocked | needs_review",
      correlationId: "trace/replay id",
      redacted: true,
      evidenceCount: "number",
      createdAt: "ISO timestamp",
    },

    filters: [
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
    ],

    displayRules: [
      "Always show redaction badge.",
      "Never render raw secrets, tokens, passwords, API keys, authorization headers, or private keys.",
      "Show blocked_by_default risk with critical styling.",
      "Show require_approval decision with review-needed styling.",
      "Show correlation id as a replay link.",
      "Show evidence as safe labels and references only.",
      "Show export as redacted export only.",
      "Show broad-query warning when filters are empty.",
    ],

    sampleTimelineCards: [
      {
        auditId: "audit_write_execution_action_run_corr_phase_205_sample",
        eventType: "execution_action_run",
        title: "Execution action succeeded",
        actor: "admin",
        role: "Execution Agent",
        source: "execution_runner",
        riskLevel: "medium",
        decision: "allow",
        status: "succeeded",
        correlationId: "corr_phase_205_sample",
        redacted: true,
        evidenceCount: 4,
        createdAt: "2026-05-18T00:00:00.000Z",
      },
      {
        auditId: "audit_write_connector_permission_decision_corr_connector_permission_sample",
        eventType: "connector_permission_decision",
        title: "Connector action requires approval",
        actor: "admin",
        role: "Governance Agent",
        source: "connector_permission_gate",
        riskLevel: "high",
        decision: "require_approval",
        status: "needs_review",
        correlationId: "corr_connector_permission_sample",
        redacted: true,
        evidenceCount: 3,
        createdAt: "2026-05-18T00:00:01.000Z",
      },
      {
        auditId: "audit_connector_stripe_charge_card_blocked",
        eventType: "connector_permission_decision",
        title: "Financial connector action blocked",
        actor: "admin",
        role: "Owner",
        source: "connector_permission_gate",
        riskLevel: "blocked_by_default",
        decision: "block",
        status: "blocked",
        correlationId: "corr_financial_block_sample",
        redacted: true,
        evidenceCount: 5,
        createdAt: "2026-05-18T00:00:02.000Z",
      },
    ],

    sampleExportPackage: {
      exportType: "redacted_audit_review_package",
      includes: [
        "selected filters",
        "redacted audit cards",
        "safe evidence labels",
        "metadata references",
        "correlation ids",
        "review notes",
      ],
      excludes: [
        "raw tokens",
        "API keys",
        "passwords",
        "authorization headers",
        "private keys",
        "raw sensitive payloads",
      ],
    },

    nextImplementationPhases: [
      "Audit Event Review UI Page",
      "Correlation Replay View",
      "Audit Export API",
      "Incident Timeline Review",
      "Execution Action Review UI",
    ],
  };
}
