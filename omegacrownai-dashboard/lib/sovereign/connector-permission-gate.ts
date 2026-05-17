import { getConnectorMarketplaceFoundation } from "@/lib/sovereign/connector-marketplace-foundation";
import { getSampleGitHubConnectorManifest } from "@/lib/sovereign/connector-manifest-validator";

type ConnectorPermissionDecisionInput = {
  connectorId?: string;
  actionId?: string;
  permission?: string;
  requestedGate?: string;
  userApproved?: boolean;
  hasAuditContext?: boolean;
  riskLevel?: string;
};

const blockedPermissions = [
  "connector_financial_action",
  "connector_secret_management",
];

const externalWritePermissions = [
  "connector_external_write",
];

const allowedPermissions = [
  "connector_read",
  "connector_write_draft",
  "connector_external_write",
  "connector_financial_action",
  "connector_secret_management",
];

const allowedGates = [
  "read_only",
  "artifact_generation",
  "workspace_write",
  "external_write",
  "blocked_by_default",
];

export function evaluateConnectorPermissionGate(input: ConnectorPermissionDecisionInput) {
  const permission = input.permission || "connector_read";
  const requestedGate = input.requestedGate || "read_only";
  const riskLevel = input.riskLevel || "low";
  const userApproved = input.userApproved === true;
  const hasAuditContext = input.hasAuditContext === true;

  const reasons: string[] = [];
  const requirements: string[] = [];
  let decision: "allow" | "require_approval" | "block" = "allow";

  if (!allowedPermissions.includes(permission)) {
    decision = "block";
    reasons.push(`Unknown connector permission: ${permission}`);
  }

  if (!allowedGates.includes(requestedGate)) {
    decision = "block";
    reasons.push(`Unknown approval gate: ${requestedGate}`);
  }

  if (blockedPermissions.includes(permission)) {
    decision = "block";
    reasons.push(`${permission} is blocked by default.`);
    requirements.push("Owner safety review required before unlock.");
  }

  if (externalWritePermissions.includes(permission) || requestedGate === "external_write") {
    if (!userApproved) {
      decision = decision === "block" ? "block" : "require_approval";
      reasons.push("External write requires explicit approval.");
      requirements.push("User/admin approval required.");
    }

    if (!hasAuditContext) {
      decision = "block";
      reasons.push("External write requires audit context.");
      requirements.push("Audit context must include actor, action, permission, input hash, output expectation, and rollback/recovery note.");
    }
  }

  if (riskLevel === "blocked_by_default") {
    decision = "block";
    reasons.push("Connector/action risk level is blocked_by_default.");
    requirements.push("Separate owner approval and safety review required.");
  }

  if (riskLevel === "high" && !userApproved) {
    decision = decision === "block" ? "block" : "require_approval";
    reasons.push("High-risk connector action requires approval.");
    requirements.push("Approval gate must be completed before execution.");
  }

  if (requestedGate === "blocked_by_default") {
    decision = "block";
    reasons.push("Requested gate is blocked_by_default.");
  }

  if (reasons.length === 0) {
    reasons.push("Permission gate passed with current scope.");
  }

  return {
    ok: decision === "allow",
    decision,
    connectorId: input.connectorId || "unknown_connector",
    actionId: input.actionId || "unknown_action",
    permission,
    requestedGate,
    riskLevel,
    userApproved,
    hasAuditContext,
    reasons,
    requirements,
    auditRecordPreview: {
      connectorId: input.connectorId || "unknown_connector",
      actionId: input.actionId || "unknown_action",
      permission,
      requestedGate,
      riskLevel,
      decision,
      approvalRequired: decision === "require_approval",
      blocked: decision === "block",
      auditRequired: true,
    },
  };
}

export function getConnectorPermissionGate() {
  const marketplace = getConnectorMarketplaceFoundation();
  const sampleManifest = getSampleGitHubConnectorManifest();

  const sampleReadDecision = evaluateConnectorPermissionGate({
    connectorId: sampleManifest.connectorId,
    actionId: "github.read_issues",
    permission: "connector_read",
    requestedGate: "read_only",
    riskLevel: "low",
    userApproved: false,
    hasAuditContext: true,
  });

  const sampleExternalWriteDecision = evaluateConnectorPermissionGate({
    connectorId: "mailchimp",
    actionId: "mailchimp.publish_campaign",
    permission: "connector_external_write",
    requestedGate: "external_write",
    riskLevel: "high",
    userApproved: false,
    hasAuditContext: true,
  });

  const sampleFinancialDecision = evaluateConnectorPermissionGate({
    connectorId: "stripe",
    actionId: "stripe.charge_card",
    permission: "connector_financial_action",
    requestedGate: "external_write",
    riskLevel: "blocked_by_default",
    userApproved: true,
    hasAuditContext: true,
  });

  return {
    system: "OmegaCrownAI Connector Permission Gate API",
    phase: "v17.7 Phase 197",
    status: "permission_gate_ready",
    purpose:
      "Evaluate connector actions at runtime before execution so read, draft, external-write, financial, and secret-management actions are allowed, approved, or blocked correctly.",
    corePrinciple:
      "Connector install review is not enough. Every connector action must pass a runtime permission gate before execution.",
    permissionTypes: marketplace.permissionModel,
    allowedPermissions,
    allowedGates,
    decisionTypes: [
      {
        decision: "allow",
        meaning: "Action can proceed under current permission scope and audit context.",
      },
      {
        decision: "require_approval",
        meaning: "Action is not blocked but needs explicit user/admin approval before execution.",
      },
      {
        decision: "block",
        meaning: "Action cannot proceed under current rules.",
      },
    ],
    blockedByDefaultRules: [
      "Financial actions are blocked by default.",
      "Secret-management actions are blocked by default unless routed through approved secret storage.",
      "External writes require approval and audit context.",
      "High-risk actions require approval.",
      "Unknown permissions are blocked.",
      "Unknown approval gates are blocked.",
      "blocked_by_default gates always block execution.",
    ],
    auditRequirements: [
      "connectorId",
      "actionId",
      "permission",
      "requestedGate",
      "riskLevel",
      "decision",
      "actor",
      "approval status",
      "input hash",
      "rollback/recovery note when applicable",
    ],
    sampleDecisions: {
      readAllowed: sampleReadDecision,
      externalWriteRequiresApproval: sampleExternalWriteDecision,
      financialBlocked: sampleFinancialDecision,
    },
  };
}
