import { NextResponse } from "next/server";
import {
  evaluateConnectorPermissionGate,
  getConnectorPermissionGate,
} from "@/lib/sovereign/connector-permission-gate";

export async function GET() {
  const gate = getConnectorPermissionGate();

  const readAllowed = evaluateConnectorPermissionGate({
    connectorId: "github",
    actionId: "github.read_issues",
    permission: "connector_read",
    requestedGate: "read_only",
    riskLevel: "low",
    userApproved: false,
    hasAuditContext: true,
  });

  const draftAllowed = evaluateConnectorPermissionGate({
    connectorId: "github",
    actionId: "github.prepare_pull_request",
    permission: "connector_write_draft",
    requestedGate: "workspace_write",
    riskLevel: "medium",
    userApproved: false,
    hasAuditContext: true,
  });

  const externalNeedsApproval = evaluateConnectorPermissionGate({
    connectorId: "mailchimp",
    actionId: "mailchimp.publish_campaign",
    permission: "connector_external_write",
    requestedGate: "external_write",
    riskLevel: "high",
    userApproved: false,
    hasAuditContext: true,
  });

  const externalWithoutAuditBlocked = evaluateConnectorPermissionGate({
    connectorId: "mailchimp",
    actionId: "mailchimp.publish_campaign",
    permission: "connector_external_write",
    requestedGate: "external_write",
    riskLevel: "high",
    userApproved: true,
    hasAuditContext: false,
  });

  const financialBlocked = evaluateConnectorPermissionGate({
    connectorId: "stripe",
    actionId: "stripe.charge_card",
    permission: "connector_financial_action",
    requestedGate: "external_write",
    riskLevel: "blocked_by_default",
    userApproved: true,
    hasAuditContext: true,
  });

  const checks = [
    {
      name: "Permission gate is ready",
      passed: gate.status === "permission_gate_ready",
      detail: gate.status,
    },
    {
      name: "Read action allowed",
      passed: readAllowed.decision === "allow",
      detail: readAllowed.decision,
    },
    {
      name: "Draft action allowed",
      passed: draftAllowed.decision === "allow",
      detail: draftAllowed.decision,
    },
    {
      name: "External write requires approval",
      passed: externalNeedsApproval.decision === "require_approval",
      detail: externalNeedsApproval.decision,
    },
    {
      name: "External write without audit is blocked",
      passed: externalWithoutAuditBlocked.decision === "block",
      detail: externalWithoutAuditBlocked.decision,
    },
    {
      name: "Financial action is blocked",
      passed: financialBlocked.decision === "block",
      detail: financialBlocked.decision,
    },
    {
      name: "Blocked-by-default rules present",
      passed: gate.blockedByDefaultRules.length >= 7,
      detail: `${gate.blockedByDefaultRules.length} rules`,
    },
    {
      name: "Audit requirements present",
      passed: gate.auditRequirements.length >= 10,
      detail: `${gate.auditRequirements.length} audit fields`,
    },
  ];

  const passedChecks = checks.filter((check) => check.passed).length;

  return NextResponse.json({
    ok: checks.every((check) => check.passed),
    phase: "v17.7 Phase 197",
    service: "Connector Permission Gate Smoke Test",
    totalChecks: checks.length,
    passedChecks,
    failedChecks: checks.length - passedChecks,
    decisions: {
      readAllowed,
      draftAllowed,
      externalNeedsApproval,
      externalWithoutAuditBlocked,
      financialBlocked,
    },
    allowedPermissionCount: gate.allowedPermissions.length,
    allowedGateCount: gate.allowedGates.length,
    blockedRuleCount: gate.blockedByDefaultRules.length,
    auditRequirementCount: gate.auditRequirements.length,
    checks,
  });
}
