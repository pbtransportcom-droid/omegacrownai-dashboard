import { NextResponse } from "next/server";
import { getRealConnectorDatabaseMigration } from "@/lib/sovereign/real-connector-database-migration";

const requiredModels = [
  "ConnectorInstall",
  "ConnectorPermissionGrant",
  "ConnectorSelectedResource",
  "ConnectorHealthcheck",
  "ConnectorDisconnectEvent",
];

const requiredStatuses = [
  "ready_for_review",
  "validation_failed",
  "approval_required",
  "approved_for_install",
  "installed_limited",
  "installed_active",
  "healthcheck_failed",
  "disconnected",
  "blocked",
];

const requiredCredentialRules = [
  "Do not store raw OAuth tokens.",
  "Do not store API keys.",
  "Do not store passwords.",
  "Do not store bearer authorization headers.",
  "Do not store private keys.",
  "Do not store webhook secrets.",
];

export async function GET() {
  const migration = getRealConnectorDatabaseMigration();

  const modelNames = migration.prismaModels.map((model) => model.model);
  const missingModels = requiredModels.filter((model) => !modelNames.includes(model));
  const missingStatuses = requiredStatuses.filter(
    (status) => !migration.installStatuses.includes(status)
  );
  const missingCredentialRules = requiredCredentialRules.filter(
    (rule) => !migration.credentialReferencePolicy.includes(rule)
  );

  const totalIndexCount = migration.prismaModels.reduce(
    (sum, model) => sum + model.indexes.length,
    0
  );

  const totalRelationshipCount = migration.prismaModels.reduce(
    (sum, model) => sum + (model.relationships?.length || 0),
    0
  );

  const checks = [
    {
      name: "Connector database migration blueprint is ready",
      passed: migration.status === "connector_database_migration_blueprint_ready",
      detail: migration.status,
    },
    {
      name: "Migration order present",
      passed: migration.migrationOrder.length >= 5,
      detail: `${migration.migrationOrder.length} migration steps`,
    },
    {
      name: "Required Prisma models present",
      passed: missingModels.length === 0,
      detail: missingModels.length ? `Missing: ${missingModels.join(", ")}` : "All required models present.",
    },
    {
      name: "Indexes present",
      passed: totalIndexCount >= 18,
      detail: `${totalIndexCount} model indexes`,
    },
    {
      name: "Relationships present",
      passed: totalRelationshipCount >= 8,
      detail: `${totalRelationshipCount} relationships`,
    },
    {
      name: "Install statuses present",
      passed: missingStatuses.length === 0,
      detail: missingStatuses.length ? `Missing: ${missingStatuses.join(", ")}` : "All statuses present.",
    },
    {
      name: "Credential reference policy present",
      passed: missingCredentialRules.length === 0,
      detail: missingCredentialRules.length
        ? `Missing: ${missingCredentialRules.join(", ")}`
        : "Core credential rules present.",
    },
    {
      name: "Selected resource policy present",
      passed: migration.selectedResourcePolicy.length >= 5,
      detail: `${migration.selectedResourcePolicy.length} selected resource rules`,
    },
    {
      name: "Rollback plan present",
      passed: migration.rollbackPlan.length >= 6,
      detail: `${migration.rollbackPlan.length} rollback steps`,
    },
    {
      name: "Implementation steps present",
      passed: migration.implementationSteps.length >= 9,
      detail: `${migration.implementationSteps.length} implementation steps`,
    },
  ];

  const passedChecks = checks.filter((check) => check.passed).length;

  return NextResponse.json({
    ok: checks.every((check) => check.passed),
    phase: "v20.0 Phase 220",
    service: "Real Connector Database Migration Smoke Test",
    totalChecks: checks.length,
    passedChecks,
    failedChecks: checks.length - passedChecks,
    migrationStepCount: migration.migrationOrder.length,
    modelCount: migration.prismaModels.length,
    indexCount: totalIndexCount,
    relationshipCount: totalRelationshipCount,
    installStatusCount: migration.installStatuses.length,
    credentialRuleCount: migration.credentialReferencePolicy.length,
    selectedResourceRuleCount: migration.selectedResourcePolicy.length,
    rollbackStepCount: migration.rollbackPlan.length,
    implementationStepCount: migration.implementationSteps.length,
    checks,
  });
}
