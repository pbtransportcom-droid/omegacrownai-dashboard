import { NextResponse } from "next/server";
import { getRebuildRollbackPersistenceIntegration } from "@/lib/sovereign/rebuild-rollback-persistence-integration";

const requiredLineageRules = [
  "Rebuild persistence must set rebuildFromArtifactId.",
  "Rollback persistence must set rollbackFromArtifactId.",
  "Previous versions must not be overwritten.",
  "New rebuild versions must receive their own artifactId.",
  "Rollback must create a rollback record/version rather than deleting newer artifacts.",
  "History records must include source and target artifact references.",
  "Audit events must include correlationId and artifact version.",
];

const requiredSafetyRules = [
  "Do not overwrite source artifact records.",
  "Do not delete newer artifacts during rollback.",
  "Do not relabel draft rollback targets customer-ready.",
  "Do not persist secrets or raw environment values.",
  "Persist audit events as redacted append-only records.",
  "Keep validation and missing-info report links for every version.",
  "Preserve customer-ready rebuild downloads after rollback.",
];

export async function GET() {
  const integration = getRebuildRollbackPersistenceIntegration();

  const missingLineageRules = requiredLineageRules.filter(
    (rule) => !integration.lineagePersistenceRules.includes(rule)
  );

  const missingSafetyRules = requiredSafetyRules.filter(
    (rule) => !integration.integrationSafetyRules.includes(rule)
  );

  const checks = [
    {
      name: "Rebuild/Rollback Persistence Integration is ready",
      passed: integration.status === "rebuild_rollback_persistence_integration_ready",
      detail: integration.status,
    },
    {
      name: "Rebuild persistence contract present",
      passed:
        integration.rebuildPersistenceContract.preservesSourceArtifact === true &&
        integration.rebuildPersistenceContract.createsNewVersion === true &&
        integration.rebuildPersistenceContract.writeTargets.includes("ArtifactStorageRecord") &&
        integration.rebuildPersistenceContract.writeTargets.includes("ArtifactHistoryRecord") &&
        integration.rebuildPersistenceContract.writeTargets.includes("ArtifactExportAuditEvent"),
      detail: "Rebuild persistence contract defined.",
    },
    {
      name: "Rollback persistence contract present",
      passed:
        integration.rollbackPersistenceContract.preservesCurrentArtifact === true &&
        integration.rollbackPersistenceContract.preservesNewerArtifacts === true &&
        integration.rollbackPersistenceContract.requiresRollbackReason === true &&
        integration.rollbackPersistenceContract.writeTargets.includes("ArtifactHistoryRecord") &&
        integration.rollbackPersistenceContract.writeTargets.includes("ArtifactExportAuditEvent"),
      detail: "Rollback persistence contract defined.",
    },
    {
      name: "Persistence flow present",
      passed: integration.persistenceFlow.length >= 9,
      detail: `${integration.persistenceFlow.length} persistence steps`,
    },
    {
      name: "Lineage persistence rules present",
      passed: missingLineageRules.length === 0,
      detail: missingLineageRules.length ? `Missing: ${missingLineageRules.join(", ")}` : "Lineage rules present.",
    },
    {
      name: "Customer-ready preservation rules present",
      passed: integration.customerReadyPreservationRules.length >= 6,
      detail: `${integration.customerReadyPreservationRules.length} preservation rules`,
    },
    {
      name: "Persistence receipt shape present",
      passed:
        Boolean(integration.persistenceReceiptShape.persistenceId) &&
        Boolean(integration.persistenceReceiptShape.actionType) &&
        Boolean(integration.persistenceReceiptShape.exportLabel) &&
        integration.persistenceReceiptShape.redacted === true,
      detail: "Persistence receipt shape present.",
    },
    {
      name: "Biscuit rebuild persistence is customer-ready and written",
      passed:
        integration.biscuitShopPersistenceExample.rebuild.customerReady === true &&
        integration.biscuitShopPersistenceExample.rebuild.completenessScore === 100 &&
        integration.biscuitShopPersistenceExample.rebuild.storageRecordWritten === true &&
        integration.biscuitShopPersistenceExample.rebuild.historyRecordWritten === true &&
        integration.biscuitShopPersistenceExample.rebuild.auditEventWritten === true,
      detail: `score ${integration.biscuitShopPersistenceExample.rebuild.completenessScore}`,
    },
    {
      name: "Biscuit rollback persistence preserves newer artifacts",
      passed:
        integration.biscuitShopPersistenceExample.rollback.targetArtifactId === "artifact_biscuit_shop_v1" &&
        integration.biscuitShopPersistenceExample.rollback.newerArtifactsPreserved === true &&
        integration.biscuitShopPersistenceExample.rollback.customerReady === false &&
        integration.biscuitShopPersistenceExample.rollback.completenessScore === 15,
      detail: `rollback score ${integration.biscuitShopPersistenceExample.rollback.completenessScore}`,
    },
    {
      name: "Integration safety rules present",
      passed: missingSafetyRules.length === 0,
      detail: missingSafetyRules.length ? `Missing: ${missingSafetyRules.join(", ")}` : "Safety rules present.",
    },
    {
      name: "Completeness checks present",
      passed: integration.integrationCompletenessChecks.length >= 8,
      detail: `${integration.integrationCompletenessChecks.length} checks`,
    },
    {
      name: "Integration sources present",
      passed:
        integration.integrationSources.rebuildRollbackApiStatus === "rebuild_rollback_api_implementation_ready" &&
        integration.integrationSources.artifactStorageDatabaseWriteApiStatus === "artifact_storage_database_write_api_ready" &&
        integration.integrationSources.customerExportAuditPersistenceStatus === "customer_export_audit_persistence_ready",
      detail: "Rebuild/rollback API, storage write API, and audit persistence linked.",
    },
  ];

  const passedChecks = checks.filter((check) => check.passed).length;

  return NextResponse.json({
    ok: checks.every((check) => check.passed),
    phase: "v25.9 Phase 279",
    service: "Rebuild/Rollback Persistence Integration Smoke Test",
    totalChecks: checks.length,
    passedChecks,
    failedChecks: checks.length - passedChecks,
    persistenceFlowStepCount: integration.persistenceFlow.length,
    lineageRuleCount: integration.lineagePersistenceRules.length,
    preservationRuleCount: integration.customerReadyPreservationRules.length,
    safetyRuleCount: integration.integrationSafetyRules.length,
    completenessCheckCount: integration.integrationCompletenessChecks.length,
    rebuildScore: integration.biscuitShopPersistenceExample.rebuild.completenessScore,
    rollbackScore: integration.biscuitShopPersistenceExample.rollback.completenessScore,
    rollbackPreservesNewerArtifacts:
      integration.biscuitShopPersistenceExample.rollback.newerArtifactsPreserved,
    checks,
  });
}
