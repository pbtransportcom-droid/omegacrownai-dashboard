import { NextResponse } from "next/server";
import {
  getArtifactStorageRealPrismaWriteImplementation,
  simulateRealPrismaArtifactStorageWrite,
} from "@/lib/sovereign/artifact-storage-real-prisma-write-implementation";

const requiredSafetyRules = [
  "Default to dry_run.",
  "Require DATABASE_URL before any real database write.",
  "Require ENABLE_REAL_PRISMA_ARTIFACT_WRITES=true before any real database write.",
  "Do not persist raw .env values.",
  "Do not persist secrets, tokens, API keys, passwords, private keys, or authorization headers.",
  "Do not persist full customer PII payloads.",
  "Persist redacted IDs, paths, scores, labels, statuses, and correlation IDs only.",
  "Audit events must be append-only.",
  "Artifact versions must not be overwritten in place.",
  "Customer-ready records must be preserved across rebuild and rollback.",
];

export async function GET() {
  const implementation = getArtifactStorageRealPrismaWriteImplementation();

  const dryRun = simulateRealPrismaArtifactStorageWrite({
    projectId: "cmoyy1gl700004mkqn7or7hxr",
    requestedBy: "system",
    writeMode: "dry_run",
  });

  const databaseReady = simulateRealPrismaArtifactStorageWrite({
    projectId: "cmoyy1gl700004mkqn7or7hxr",
    requestedBy: "system",
    writeMode: "database_ready",
  });

  const missingSafetyRules = requiredSafetyRules.filter(
    (rule) => !implementation.prismaSafetyRules.includes(rule)
  );

  const checks = [
    {
      name: "Artifact Storage Real Prisma Write Implementation is ready",
      passed:
        implementation.status === "artifact_storage_real_prisma_write_implementation_ready",
      detail: implementation.status,
    },
    {
      name: "Prisma write contract present",
      passed:
        implementation.prismaWriteContract.defaultMode === "dry_run" &&
        implementation.prismaWriteContract.requiresDatabaseUrl === true &&
        implementation.prismaWriteContract.requiresReleaseGate === true &&
        implementation.prismaWriteContract.requiresEntitlementGate === true &&
        implementation.prismaWriteContract.redacted === true,
      detail: "Prisma write contract defined.",
    },
    {
      name: "Write targets present",
      passed:
        implementation.prismaWriteContract.writeTargets.includes("ArtifactStorageRecord") &&
        implementation.prismaWriteContract.writeTargets.includes("ArtifactHistoryRecord") &&
        implementation.prismaWriteContract.writeTargets.includes("ArtifactExportAuditEvent"),
      detail: `${implementation.prismaWriteContract.writeTargets.length} targets`,
    },
    {
      name: "Prisma write flow present",
      passed: implementation.prismaWriteFlow.length >= 11,
      detail: `${implementation.prismaWriteFlow.length} flow steps`,
    },
    {
      name: "Prisma model write plan present",
      passed:
        implementation.prismaModelWritePlan.length >= 3 &&
        implementation.prismaModelWritePlan.some((item) => item.model === "ArtifactStorageRecord") &&
        implementation.prismaModelWritePlan.some((item) => item.model === "ArtifactHistoryRecord") &&
        implementation.prismaModelWritePlan.some((item) => item.model === "ArtifactExportAuditEvent"),
      detail: `${implementation.prismaModelWritePlan.length} model plans`,
    },
    {
      name: "Prisma safety rules present",
      passed: missingSafetyRules.length === 0,
      detail: missingSafetyRules.length
        ? `Missing: ${missingSafetyRules.join(", ")}`
        : "Safety rules present.",
    },
    {
      name: "Dry run prepares records without real writes",
      passed:
        dryRun.prismaWriteReceipt.writeMode === "dry_run" &&
        dryRun.prismaWriteReceipt.storageRecordPrepared === true &&
        dryRun.prismaWriteReceipt.historyRecordPrepared === true &&
        dryRun.prismaWriteReceipt.auditEventPrepared === true &&
        dryRun.prismaWriteReceipt.storageRecordWritten === false &&
        dryRun.prismaWriteReceipt.redacted === true,
      detail: "Dry run prepared records.",
    },
    {
      name: "Database-ready write remains gated by env and feature flag",
      passed:
        databaseReady.prismaWriteReceipt.writeMode === "database_ready" &&
        databaseReady.prismaWriteReceipt.featureFlagRequired ===
          "ENABLE_REAL_PRISMA_ARTIFACT_WRITES=true" &&
        typeof databaseReady.prismaWriteReceipt.writesEnabled === "boolean",
      detail: `writesEnabled=${databaseReady.prismaWriteReceipt.writesEnabled}`,
    },
    {
      name: "Prisma payloads are redacted and customer-ready",
      passed:
        dryRun.prismaPayloads.artifactStorageRecord.redacted === true &&
        dryRun.prismaPayloads.artifactHistoryRecord.redacted === true &&
        dryRun.prismaPayloads.artifactExportAuditEvent.redacted === true &&
        dryRun.prismaWriteReceipt.customerReady === true &&
        dryRun.prismaWriteReceipt.completenessScore === 100,
      detail: `score ${dryRun.prismaWriteReceipt.completenessScore}`,
    },
    {
      name: "Implementation safety flags pass",
      passed:
        dryRun.implementationSafety.dryRunDefault === true &&
        dryRun.implementationSafety.requiresDatabaseUrl === true &&
        dryRun.implementationSafety.requiresExplicitFeatureFlag === true &&
        dryRun.implementationSafety.doesNotStoreSecrets === true &&
        dryRun.implementationSafety.redacted === true,
      detail: "Implementation safety flags pass.",
    },
    {
      name: "Completeness checks present",
      passed: implementation.prismaWriteCompletenessChecks.length >= 8,
      detail: `${implementation.prismaWriteCompletenessChecks.length} checks`,
    },
    {
      name: "Integration sources present",
      passed:
        implementation.integrationSources.persistentArtifactDatabaseMigrationStatus ===
          "persistent_artifact_database_migration_ready" &&
        implementation.integrationSources.customerArtifactBillingEntitlementGateStatus ===
          "customer_artifact_billing_entitlement_gate_ready",
      detail: "Artifact DB migration and entitlement gate linked.",
    },
  ];

  const passedChecks = checks.filter((check) => check.passed).length;

  return NextResponse.json({
    ok: checks.every((check) => check.passed),
    phase: "v26.3 Phase 283",
    service: "Artifact Storage Real Prisma Write Implementation Smoke Test",
    totalChecks: checks.length,
    passedChecks,
    failedChecks: checks.length - passedChecks,
    writeTargetCount: implementation.prismaWriteContract.writeTargets.length,
    writeFlowStepCount: implementation.prismaWriteFlow.length,
    modelWritePlanCount: implementation.prismaModelWritePlan.length,
    safetyRuleCount: implementation.prismaSafetyRules.length,
    completenessCheckCount: implementation.prismaWriteCompletenessChecks.length,
    dryRunPrepared:
      dryRun.prismaWriteReceipt.storageRecordPrepared &&
      dryRun.prismaWriteReceipt.historyRecordPrepared &&
      dryRun.prismaWriteReceipt.auditEventPrepared,
    dryRunWritesEnabled: dryRun.prismaWriteReceipt.writesEnabled,
    databaseReadyWritesEnabled: databaseReady.prismaWriteReceipt.writesEnabled,
    customerReady: dryRun.prismaWriteReceipt.customerReady,
    score: dryRun.prismaWriteReceipt.completenessScore,
    checks,
  });
}
