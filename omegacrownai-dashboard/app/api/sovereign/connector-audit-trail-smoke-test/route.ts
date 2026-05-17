import { NextResponse } from "next/server";
import {
  createConnectorAuditRecord,
  getConnectorAuditTrailIntegration,
} from "@/lib/sovereign/connector-audit-trail";

export async function GET() {
  const audit = getConnectorAuditTrailIntegration();

  const readRecord = createConnectorAuditRecord({
    connectorId: "github",
    actionId: "github.read_issues",
    permission: "connector_read",
    requestedGate: "read_only",
    riskLevel: "low",
    hasAuditContext: true,
    rollbackNote: "Read-only action; rollback not required.",
  });

  const externalRecord = createConnectorAuditRecord({
    connectorId: "mailchimp",
    actionId: "mailchimp.publish_campaign",
    permission: "connector_external_write",
    requestedGate: "external_write",
    riskLevel: "high",
    userApproved: false,
    hasAuditContext: true,
    rollbackNote: "Keep campaign in draft until approval.",
  });

  const blockedRecord = createConnectorAuditRecord({
    connectorId: "stripe",
    actionId: "stripe.charge_card",
    permission: "connector_financial_action",
    requestedGate: "external_write",
    riskLevel: "blocked_by_default",
    userApproved: true,
    hasAuditContext: true,
    rollbackNote: "Blocked. Separate financial safety review required.",
  });

  const checks = [
    {
      name: "Audit trail is ready",
      passed: audit.status === "audit_trail_ready",
      detail: audit.status,
    },
    {
      name: "Required audit fields present",
      passed: audit.requiredAuditFields.length >= 16,
      detail: `${audit.requiredAuditFields.length} fields`,
    },
    {
      name: "Audit policies present",
      passed: audit.auditPolicies.length >= 7,
      detail: `${audit.auditPolicies.length} policies`,
    },
    {
      name: "Read action audit is allowed",
      passed: readRecord.decision === "allow" && readRecord.ok === true,
      detail: readRecord.decision,
    },
    {
      name: "External write audit requires approval",
      passed: externalRecord.decision === "require_approval",
      detail: externalRecord.decision,
    },
    {
      name: "Financial action audit is blocked",
      passed: blockedRecord.decision === "block" && blockedRecord.blocked === true,
      detail: blockedRecord.decision,
    },
    {
      name: "Audit evidence exists",
      passed:
        readRecord.evidence.length >= 8 &&
        externalRecord.evidence.length >= 8 &&
        blockedRecord.evidence.length >= 8,
      detail: "Evidence lists present.",
    },
    {
      name: "Rollback notes present",
      passed:
        Boolean(readRecord.rollbackNote) &&
        Boolean(externalRecord.rollbackNote) &&
        Boolean(blockedRecord.rollbackNote),
      detail: "Rollback/recovery notes present.",
    },
  ];

  const passedChecks = checks.filter((check) => check.passed).length;

  return NextResponse.json({
    ok: checks.every((check) => check.passed),
    phase: "v17.8 Phase 198",
    service: "Connector Audit Trail Smoke Test",
    totalChecks: checks.length,
    passedChecks,
    failedChecks: checks.length - passedChecks,
    requiredAuditFieldCount: audit.requiredAuditFields.length,
    auditPolicyCount: audit.auditPolicies.length,
    sampleRecordCount: Object.keys(audit.sampleAuditRecords).length,
    decisions: {
      read: readRecord.decision,
      external: externalRecord.decision,
      blocked: blockedRecord.decision,
    },
    checks,
  });
}
