import { NextResponse } from "next/server";
import { getPersistentArtifactDatabaseMigration } from "@/lib/sovereign/persistent-artifact-database-migration";

const requiredModels = [
  "ArtifactStorageRecord",
  "ArtifactHistoryRecord",
  "ArtifactExportAuditEvent",
];

const requiredSafeRules = [
  "Do not store raw .env values.",
  "Do not store secrets, tokens, API keys, passwords, or private keys.",
  "Do not store full customer PII payloads in audit events.",
  "Store IDs, paths, statuses, scores, labels, and redacted metadata only.",
  "Use JSON fields only for blocked reasons and missing layers, not secrets.",
  "Mark all artifact/export audit records as redacted.",
  "Preserve customer-ready records across rebuilds and rollbacks.",
  "Do not overwrite artifact versions in place.",
];

export async function GET() {
  const migration = getPersistentArtifactDatabaseMigration();

  const modelNames = migration.migrationModels.map((model) => model.model);
  const missingModels = requiredModels.filter((model) => !modelNames.includes(model));

  const missingSafeRules = requiredSafeRules.filter(
    (rule) => !migration.safeDatabaseRules.includes(rule)
  );

  const checks = [
    {
      name: "Persistent Artifact Database Migration is ready",
      passed: migration.status === "persistent_artifact_database_migration_ready",
      detail: migration.status,
    },
    {
      name: "Required migration models present",
      passed: missingModels.length === 0,
      detail: missingModels.length ? `Missing: ${missingModels.join(", ")}` : "All models present.",
    },
    {
      name: "Migration models have meaningful fields",
      passed: migration.migrationModels.every((model) => model.fields.length >= 20),
      detail: `${migration.migrationModels.length} models`,
    },
    {
      name: "Relationship plan present",
      passed: migration.relationshipPlan.length >= 7,
      detail: `${migration.relationshipPlan.length} relationships`,
    },
    {
      name: "Index plan present",
      passed:
        migration.indexPlan.length >= 3 &&
        migration.indexPlan.every((item) => item.indexes.length >= 6),
      detail: `${migration.indexPlan.length} model index groups`,
    },
    {
      name: "Migration rollout plan present",
      passed: migration.migrationRolloutPlan.length >= 8,
      detail: `${migration.migrationRolloutPlan.length} rollout steps`,
    },
    {
      name: "Rollback plan present",
      passed: migration.rollbackPlan.length >= 6,
      detail: `${migration.rollbackPlan.length} rollback steps`,
    },
    {
      name: "Safe database rules present",
      passed: missingSafeRules.length === 0,
      detail: missingSafeRules.length ? `Missing: ${missingSafeRules.join(", ")}` : "Safe database rules present.",
    },
    {
      name: "Prisma model blueprint present",
      passed:
        Boolean(migration.prismaModelBlueprint.ArtifactStorageRecord) &&
        Boolean(migration.prismaModelBlueprint.ArtifactHistoryRecord) &&
        Boolean(migration.prismaModelBlueprint.ArtifactExportAuditEvent),
      detail: "Prisma model blueprint defined.",
    },
    {
      name: "Biscuit shop migration example is customer-ready and redacted",
      passed:
        migration.biscuitShopMigrationExample.storageRecord.customerReady === true &&
        migration.biscuitShopMigrationExample.storageRecord.completenessScore === 100 &&
        migration.biscuitShopMigrationExample.storageRecord.redacted === true &&
        migration.biscuitShopMigrationExample.auditEvent.redacted === true,
      detail: `score ${migration.biscuitShopMigrationExample.storageRecord.completenessScore}`,
    },
    {
      name: "Completeness checks present",
      passed: migration.databaseMigrationCompletenessChecks.length >= 9,
      detail: `${migration.databaseMigrationCompletenessChecks.length} checks`,
    },
    {
      name: "Integration sources present",
      passed:
        migration.integrationSources.persistentArtifactStorageStatus === "persistent_artifact_storage_ready" &&
        migration.integrationSources.customerExportAuditTrailStatus === "customer_export_audit_trail_ready" &&
        migration.integrationSources.productionArtifactWriterIntegrationStatus === "production_artifact_writer_integration_ready" &&
        migration.integrationSources.artifactRebuildRollbackControlsStatus === "artifact_rebuild_rollback_controls_ready",
      detail: "Storage, audit, production writer, and rebuild/rollback linked.",
    },
  ];

  const passedChecks = checks.filter((check) => check.passed).length;

  return NextResponse.json({
    ok: checks.every((check) => check.passed),
    phase: "v25.3 Phase 273",
    service: "Persistent Artifact Database Migration Smoke Test",
    totalChecks: checks.length,
    passedChecks,
    failedChecks: checks.length - passedChecks,
    migrationModelCount: migration.migrationModels.length,
    relationshipCount: migration.relationshipPlan.length,
    indexGroupCount: migration.indexPlan.length,
    rolloutStepCount: migration.migrationRolloutPlan.length,
    rollbackStepCount: migration.rollbackPlan.length,
    safeDatabaseRuleCount: migration.safeDatabaseRules.length,
    databaseMigrationCompletenessCheckCount: migration.databaseMigrationCompletenessChecks.length,
    checks,
  });
}
