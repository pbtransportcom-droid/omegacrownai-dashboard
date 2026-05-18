import { NextResponse } from "next/server";
import {
  getRebuildRollbackApiImplementation,
  simulateArtifactRebuild,
  simulateArtifactRollback,
} from "@/lib/sovereign/rebuild-rollback-api-implementation";

const requiredValidationRules = [
  "Normalize projectId and artifactId.",
  "Require rollback reason for rollback requests.",
  "Limit prompt and reason length.",
  "Reject null bytes.",
  "Do not accept raw secrets in request body.",
  "Do not allow rebuild to overwrite source artifact.",
  "Do not allow rollback to delete newer artifact versions.",
  "Always return redacted receipts.",
];

const requiredSafetyRules = [
  "Rebuild creates a new version.",
  "Rollback creates a rollback record/version.",
  "Source artifacts are preserved.",
  "Newer artifacts are preserved.",
  "Customer-ready status is never assumed.",
  "Validation reports remain linked.",
  "Missing-info reports remain linked.",
  "Audit event references are included.",
  "Receipts are redacted.",
];

export async function GET() {
  const implementation = getRebuildRollbackApiImplementation();

  const rebuild = simulateArtifactRebuild({
    projectId: "cmoyy1gl700004mkqn7or7hxr",
    artifactId: "artifact_biscuit_shop_v1",
    rebuildPrompt:
      "Rebuild as full-stack with backend, database, admin, preview, download, validation, and missing-info report.",
    requestedBy: "system",
  });

  const rollback = simulateArtifactRollback({
    projectId: "cmoyy1gl700004mkqn7or7hxr",
    artifactId: rebuild.receipt.newArtifactId,
    targetArtifactId: "artifact_biscuit_shop_v1",
    rollbackReason: "Review original draft.",
    requestedBy: "system",
  });

  const missingValidationRules = requiredValidationRules.filter(
    (rule) => !implementation.requestValidationRules.includes(rule)
  );

  const missingSafetyRules = requiredSafetyRules.filter(
    (rule) => !implementation.implementationSafetyRules.includes(rule)
  );

  const checks = [
    {
      name: "Rebuild/Rollback API Implementation is ready",
      passed: implementation.status === "rebuild_rollback_api_implementation_ready",
      detail: implementation.status,
    },
    {
      name: "API routes are defined",
      passed:
        implementation.apiRoutes.length >= 3 &&
        implementation.apiRoutes.some((route) => route.route.includes("/rebuild")) &&
        implementation.apiRoutes.some((route) => route.route.includes("/rollback")),
      detail: `${implementation.apiRoutes.length} routes`,
    },
    {
      name: "Request validation rules present",
      passed: missingValidationRules.length === 0,
      detail: missingValidationRules.length ? `Missing: ${missingValidationRules.join(", ")}` : "Validation rules present.",
    },
    {
      name: "Rebuild flow present",
      passed: implementation.rebuildImplementationFlow.length >= 9,
      detail: `${implementation.rebuildImplementationFlow.length} rebuild steps`,
    },
    {
      name: "Rollback flow present",
      passed: implementation.rollbackImplementationFlow.length >= 9,
      detail: `${implementation.rollbackImplementationFlow.length} rollback steps`,
    },
    {
      name: "Implementation safety rules present",
      passed: missingSafetyRules.length === 0,
      detail: missingSafetyRules.length ? `Missing: ${missingSafetyRules.join(", ")}` : "Safety rules present.",
    },
    {
      name: "Simulated rebuild returns customer-ready receipt",
      passed:
        rebuild.ok === true &&
        rebuild.receipt.customerReady === true &&
        rebuild.receipt.completenessScore === 100 &&
        rebuild.receipt.rebuildFromArtifactId === "artifact_biscuit_shop_v1" &&
        rebuild.receipt.redacted === true,
      detail: `score ${rebuild.receipt.completenessScore}`,
    },
    {
      name: "Simulated rollback returns safe receipt",
      passed:
        rollback.ok === true &&
        rollback.receipt.targetArtifactId === "artifact_biscuit_shop_v1" &&
        rollback.receipt.newerArtifactsPreserved === true &&
        rollback.receipt.rollbackReason.length > 0 &&
        rollback.receipt.redacted === true,
      detail: `score ${rollback.receipt.completenessScore}`,
    },
    {
      name: "Biscuit shop API example present",
      passed:
        implementation.biscuitShopApiExample.rebuildCustomerReady === true &&
        implementation.biscuitShopApiExample.rebuildScore === 100 &&
        implementation.biscuitShopApiExample.rollbackPreservesNewerArtifacts === true,
      detail: "Biscuit rebuild/rollback example passes.",
    },
    {
      name: "Completeness checks present",
      passed: implementation.apiCompletenessChecks.length >= 9,
      detail: `${implementation.apiCompletenessChecks.length} checks`,
    },
    {
      name: "Integration sources present",
      passed:
        implementation.integrationSources.artifactRebuildRollbackControlsStatus === "artifact_rebuild_rollback_controls_ready" &&
        implementation.integrationSources.persistentArtifactDatabaseMigrationStatus === "persistent_artifact_database_migration_ready" &&
        implementation.integrationSources.customerExportAuditTrailStatus === "customer_export_audit_trail_ready",
      detail: "Controls, database migration, and audit trail linked.",
    },
  ];

  const passedChecks = checks.filter((check) => check.passed).length;

  return NextResponse.json({
    ok: checks.every((check) => check.passed),
    phase: "v25.4 Phase 274",
    service: "Rebuild/Rollback API Implementation Smoke Test",
    totalChecks: checks.length,
    passedChecks,
    failedChecks: checks.length - passedChecks,
    apiRouteCount: implementation.apiRoutes.length,
    validationRuleCount: implementation.requestValidationRules.length,
    rebuildFlowStepCount: implementation.rebuildImplementationFlow.length,
    rollbackFlowStepCount: implementation.rollbackImplementationFlow.length,
    safetyRuleCount: implementation.implementationSafetyRules.length,
    rebuildScore: rebuild.receipt.completenessScore,
    rebuildCustomerReady: rebuild.receipt.customerReady,
    rollbackScore: rollback.receipt.completenessScore,
    rollbackNewerArtifactsPreserved: rollback.receipt.newerArtifactsPreserved,
    checks,
  });
}
