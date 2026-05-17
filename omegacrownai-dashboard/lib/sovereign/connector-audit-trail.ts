import { evaluateConnectorPermissionGate } from "@/lib/sovereign/connector-permission-gate";

type ConnectorAuditInput = {
  connectorId?: string;
  actionId?: string;
  permission?: string;
  requestedGate?: string;
  riskLevel?: string;
  userApproved?: boolean;
  hasAuditContext?: boolean;
  actor?: string;
  role?: string;
  inputHash?: string;
  outputHash?: string;
  rollbackNote?: string;
};

function stableAuditId(input: ConnectorAuditInput) {
  const connector = input.connectorId || "unknown";
  const action = input.actionId || "unknown";
  const permission = input.permission || "connector_read";
  return `audit_${connector}_${action}_${permission}`.replace(/[^a-zA-Z0-9_]/g, "_");
}

export function createConnectorAuditRecord(input: ConnectorAuditInput) {
  const decision = evaluateConnectorPermissionGate(input);

  return {
    auditId: stableAuditId(input),
    phase: "v17.8 Phase 198",
    service: "Connector Audit Trail Integration",
    actor: input.actor || "system_or_admin",
    role: input.role || "Governance Agent",
    connectorId: decision.connectorId,
    actionId: decision.actionId,
    permission: decision.permission,
    requestedGate: decision.requestedGate,
    riskLevel: decision.riskLevel,
    decision: decision.decision,
    ok: decision.ok,
    approvalRequired: decision.decision === "require_approval",
    blocked: decision.decision === "block",
    userApproved: decision.userApproved,
    hasAuditContext: decision.hasAuditContext,
    inputHash: input.inputHash || "input_hash_placeholder",
    outputHash: input.outputHash || "output_hash_placeholder",
    rollbackAvailable: Boolean(input.rollbackNote),
    rollbackNote:
      input.rollbackNote ||
      "Rollback/recovery note required before external write, destructive action, or high-risk connector execution.",
    reasons: decision.reasons,
    requirements: decision.requirements,
    evidence: [
      "permission gate decision",
      "connector id",
      "action id",
      "permission used",
      "requested approval gate",
      "risk level",
      "approval status",
      "audit context status",
    ],
    timestamp: new Date().toISOString(),
  };
}

export function getConnectorAuditTrailIntegration() {
  const readAudit = createConnectorAuditRecord({
    connectorId: "github",
    actionId: "github.read_issues",
    permission: "connector_read",
    requestedGate: "read_only",
    riskLevel: "low",
    userApproved: false,
    hasAuditContext: true,
    actor: "admin",
    role: "Admin",
    rollbackNote: "Read-only action; rollback not required.",
  });

  const approvalAudit = createConnectorAuditRecord({
    connectorId: "mailchimp",
    actionId: "mailchimp.publish_campaign",
    permission: "connector_external_write",
    requestedGate: "external_write",
    riskLevel: "high",
    userApproved: false,
    hasAuditContext: true,
    actor: "admin",
    role: "Owner",
    rollbackNote: "Campaign must remain draft until approval is completed.",
  });

  const blockedAudit = createConnectorAuditRecord({
    connectorId: "stripe",
    actionId: "stripe.charge_card",
    permission: "connector_financial_action",
    requestedGate: "external_write",
    riskLevel: "blocked_by_default",
    userApproved: true,
    hasAuditContext: true,
    actor: "admin",
    role: "Owner",
    rollbackNote: "Financial action blocked; separate safety review required before any unlock.",
  });

  return {
    system: "OmegaCrownAI Connector Audit Trail Integration",
    phase: "v17.8 Phase 198",
    status: "audit_trail_ready",
    purpose:
      "Create audit-ready records for connector permission-gate decisions so every connector action can be reviewed, traced, approved, blocked, or recovered.",
    corePrinciple:
      "Every connector action decision should leave an audit trail with actor, role, connector, action, permission, risk, decision, evidence, and rollback/recovery context.",
    auditRecordShape: {
      auditId: "stable audit record id",
      actor: "user/admin/agent that requested the action",
      role: "role used for the action",
      connectorId: "connector identifier",
      actionId: "connector action identifier",
      permission: "connector permission used",
      requestedGate: "approval gate requested",
      riskLevel: "low | medium | high | blocked_by_default",
      decision: "allow | require_approval | block",
      approvalRequired: "boolean",
      blocked: "boolean",
      userApproved: "boolean",
      hasAuditContext: "boolean",
      inputHash: "hash or placeholder for action input",
      outputHash: "hash or placeholder for expected output",
      rollbackAvailable: "boolean",
      rollbackNote: "rollback/recovery statement",
      evidence: "decision evidence list",
      timestamp: "ISO timestamp",
    },
    requiredAuditFields: [
      "auditId",
      "actor",
      "role",
      "connectorId",
      "actionId",
      "permission",
      "requestedGate",
      "riskLevel",
      "decision",
      "approvalRequired",
      "blocked",
      "inputHash",
      "outputHash",
      "rollbackNote",
      "evidence",
      "timestamp",
    ],
    auditPolicies: [
      "Read-only connector actions should still record actor, connector, action, and decision.",
      "External writes must include approval status and audit context.",
      "Blocked actions must include reason and required safety review.",
      "Financial actions must be blocked by default and audited.",
      "Secret-management actions must be audited and routed through secret storage.",
      "High-risk connector actions must include rollback/recovery note.",
      "Audit records must not include secrets, tokens, passwords, or raw sensitive payloads.",
    ],
    sampleAuditRecords: {
      readAllowed: readAudit,
      externalWriteNeedsApproval: approvalAudit,
      financialBlocked: blockedAudit,
    },
  };
}
