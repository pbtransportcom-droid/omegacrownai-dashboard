import { NextResponse } from "next/server";
import {
  createAuditEventPersistencePreview,
  getAuditEventWritePersistenceBlueprint,
} from "@/lib/sovereign/audit-event-write-persistence";

export async function GET() {
  const persistence = getAuditEventWritePersistenceBlueprint();

  const validExecutionWrite = createAuditEventPersistencePreview({
    eventType: "execution_action_run",
    actor: "admin",
    role: "Execution Agent",
    source: "execution_runner",
    riskLevel: "medium",
    decision: "allow",
    status: "succeeded",
    correlationId: "corr_phase_212_execution",
    evidence: ["build passed", "route checks passed", "pm2 online"],
    metadata: {
      actionId: "deployment.next_build",
      inputHash: "input_hash_placeholder",
    },
  });

  const validConnectorWrite = createAuditEventPersistencePreview({
    eventType: "connector_permission_decision",
    actor: "admin",
    role: "Governance Agent",
    source: "connector_permission_gate",
    riskLevel: "high",
    decision: "require_approval",
    status: "needs_review",
    correlationId: "corr_phase_212_connector",
    evidence: ["permission gate decision", "approval required"],
    metadata: {
      connectorId: "github",
      actionId: "github.prepare_pull_request",
    },
  });

  const rejectedSecretWrite = createAuditEventPersistencePreview({
    eventType: "connector_install",
    actor: "admin",
    role: "Admin",
    source: "connector_install_store",
    riskLevel: "medium",
    decision: "approved",
    status: "succeeded",
    correlationId: "corr_phase_212_secret",
    evidence: ["install approved"],
    metadata: {
      token: "raw_token_should_not_persist",
    },
  });

  const checks = [
    {
      name: "Audit write persistence blueprint is ready",
      passed: persistence.status === "audit_write_persistence_blueprint_ready",
      detail: persistence.status,
    },
    {
      name: "Persistence flow present",
      passed: persistence.persistenceFlow.length >= 8,
      detail: `${persistence.persistenceFlow.length} flow steps`,
    },
    {
      name: "Prisma write plan present",
      passed:
        persistence.prismaWritePlan.parentTable === "audit_events" &&
        persistence.prismaWritePlan.transactionRequired === true &&
        persistence.prismaWritePlan.appendOnly === true,
      detail: "Prisma write plan defined.",
    },
    {
      name: "Child record routes present",
      passed: persistence.childRecordRoutes.length >= 6,
      detail: `${persistence.childRecordRoutes.length} child routes`,
    },
    {
      name: "Validation-before-insert rules present",
      passed: persistence.requiredValidationBeforeInsert.length >= 10,
      detail: `${persistence.requiredValidationBeforeInsert.length} validation rules`,
    },
    {
      name: "No-secret persistence rules present",
      passed: persistence.noSecretPersistenceRules.length >= 8,
      detail: `${persistence.noSecretPersistenceRules.length} no-secret rules`,
    },
    {
      name: "Valid execution write would persist",
      passed:
        validExecutionWrite.ok === true &&
        validExecutionWrite.wouldInsert === true &&
        validExecutionWrite.childRecordInsert?.table === "execution_action_runs",
      detail: validExecutionWrite.writeResultShape.childRecordTable || "missing child route",
    },
    {
      name: "Valid connector write would persist",
      passed:
        validConnectorWrite.ok === true &&
        validConnectorWrite.wouldInsert === true &&
        validConnectorWrite.childRecordInsert?.table === "connector_audit_events",
      detail: validConnectorWrite.writeResultShape.childRecordTable || "missing child route",
    },
    {
      name: "Secret-like write is rejected before insert",
      passed: rejectedSecretWrite.ok === false && rejectedSecretWrite.wouldInsert === false,
      detail: rejectedSecretWrite.validation.errors.join(", "),
    },
  ];

  const passedChecks = checks.filter((check) => check.passed).length;

  return NextResponse.json({
    ok: checks.every((check) => check.passed),
    phase: "v19.2 Phase 212",
    service: "Audit Event Write Persistence Smoke Test",
    totalChecks: checks.length,
    passedChecks,
    failedChecks: checks.length - passedChecks,
    persistenceFlowStepCount: persistence.persistenceFlow.length,
    childRecordRouteCount: persistence.childRecordRoutes.length,
    validationRuleCount: persistence.requiredValidationBeforeInsert.length,
    noSecretRuleCount: persistence.noSecretPersistenceRules.length,
    validExecutionWouldInsert: validExecutionWrite.wouldInsert,
    validConnectorWouldInsert: validConnectorWrite.wouldInsert,
    secretWriteRejected: !rejectedSecretWrite.ok,
    checks,
  });
}
