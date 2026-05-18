import { NextResponse } from "next/server";
import {
  createAuditEventWritePreview,
  getAuditEventWriteApiBlueprint,
} from "@/lib/sovereign/audit-event-write-api";

export async function GET() {
  const auditWrite = getAuditEventWriteApiBlueprint();

  const validWrite = createAuditEventWritePreview({
    eventType: "connector_permission_decision",
    actor: "admin",
    role: "Governance Agent",
    source: "connector_permission_gate",
    riskLevel: "high",
    decision: "require_approval",
    status: "needs_review",
    correlationId: "corr_connector_permission_sample",
    evidence: ["permission gate decision", "approval required", "audit context present"],
    metadata: {
      connectorId: "github",
      actionId: "github.prepare_pull_request",
      inputHash: "input_hash_placeholder",
    },
  });

  const invalidSecretWrite = createAuditEventWritePreview({
    eventType: "connector_install",
    actor: "admin",
    role: "Admin",
    source: "connector_install_store",
    riskLevel: "medium",
    decision: "approved",
    status: "succeeded",
    correlationId: "corr_secret_bad_sample",
    evidence: ["install approved"],
    metadata: {
      token: "bad_raw_token_should_not_be_stored",
    },
  });

  const checks = [
    {
      name: "Audit write API blueprint is ready",
      passed: auditWrite.status === "audit_write_api_blueprint_ready",
      detail: auditWrite.status,
    },
    {
      name: "Allowed event types present",
      passed: auditWrite.allowedEventTypes.length >= 8,
      detail: `${auditWrite.allowedEventTypes.length} event types`,
    },
    {
      name: "Required write fields present",
      passed: auditWrite.requiredWriteFields.length >= 9,
      detail: `${auditWrite.requiredWriteFields.length} required fields`,
    },
    {
      name: "Validation rules present",
      passed: auditWrite.validationRules.length >= 7,
      detail: `${auditWrite.validationRules.length} validation rules`,
    },
    {
      name: "Redaction rules present",
      passed: auditWrite.redactionRules.length >= 6,
      detail: `${auditWrite.redactionRules.length} redaction rules`,
    },
    {
      name: "Valid write passes",
      passed: validWrite.ok === true,
      detail: validWrite.ok ? "valid write accepted" : validWrite.validation.errors.join(", "),
    },
    {
      name: "Secret-like write is rejected",
      passed: invalidSecretWrite.ok === false,
      detail: invalidSecretWrite.validation.errors.join(", "),
    },
    {
      name: "Sample write result is append-only",
      passed: auditWrite.sampleResult.appendOnly === true,
      detail: "append-only preview confirmed",
    },
  ];

  const passedChecks = checks.filter((check) => check.passed).length;

  return NextResponse.json({
    ok: checks.every((check) => check.passed),
    phase: "v18.5 Phase 205",
    service: "Audit Event Write API Smoke Test",
    totalChecks: checks.length,
    passedChecks,
    failedChecks: checks.length - passedChecks,
    eventTypeCount: auditWrite.allowedEventTypes.length,
    requiredFieldCount: auditWrite.requiredWriteFields.length,
    validationRuleCount: auditWrite.validationRules.length,
    redactionRuleCount: auditWrite.redactionRules.length,
    validWriteOk: validWrite.ok,
    invalidSecretRejected: !invalidSecretWrite.ok,
    checks,
  });
}
