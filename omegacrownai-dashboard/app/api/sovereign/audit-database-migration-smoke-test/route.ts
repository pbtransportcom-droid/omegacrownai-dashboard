import { NextResponse } from "next/server";
import { getAuditDatabaseMigrationBlueprint } from "@/lib/sovereign/audit-database-migration-blueprint";

const requiredModels = [
  "AuditEvent",
  "ConnectorAuditEvent",
  "ExecutionActionRun",
  "ExecutionActionPayload",
  "ExecutionActionEvidence",
  "ExecutionActionError",
  "ExecutionActionRollback",
  "MemoryAuditEvent",
  "DeploymentAuditEvent",
  "IncidentEvent",
];

const requiredNoSecretRules = [
  "No column may store raw OAuth tokens.",
  "No column may store API keys.",
  "No column may store passwords.",
  "No column may store bearer authorization headers.",
  "No column may store private keys.",
  "No column may store webhook secrets.",
];

export async function GET() {
  const migration = getAuditDatabaseMigrationBlueprint();

  const modelNames = migration.prismaModels.map((model) => model.model);
  const missingModels = requiredModels.filter((model) => !modelNames.includes(model));
  const missingNoSecretRules = requiredNoSecretRules.filter(
    (rule) => !migration.noSecretColumnPolicy.includes(rule)
  );

  const totalIndexCount = migration.prismaModels.reduce(
    (sum, model) => sum + model.indexes.length,
    0
  );

  const checks = [
    {
      name: "Audit migration blueprint is ready",
      passed: migration.status === "audit_database_migration_blueprint_ready",
      detail: migration.status,
    },
    {
      name: "Migration order present",
      passed: migration.migrationOrder.length >= 10,
      detail: `${migration.migrationOrder.length} migration steps`,
    },
    {
      name: "Required Prisma models present",
      passed: missingModels.length === 0,
      detail: missingModels.length ? `Missing: ${missingModels.join(", ")}` : "All required models present.",
    },
    {
      name: "Indexes present",
      passed: totalIndexCount >= 20,
      detail: `${totalIndexCount} model indexes`,
    },
    {
      name: "No-secret column policy present",
      passed: missingNoSecretRules.length === 0,
      detail: missingNoSecretRules.length
        ? `Missing: ${missingNoSecretRules.join(", ")}`
        : "Core no-secret rules present.",
    },
    {
      name: "Relationship rules present",
      passed: migration.relationshipRules.length >= 5,
      detail: `${migration.relationshipRules.length} relationship rules`,
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
    phase: "v19.1 Phase 211",
    service: "Audit Database Migration Smoke Test",
    totalChecks: checks.length,
    passedChecks,
    failedChecks: checks.length - passedChecks,
    migrationStepCount: migration.migrationOrder.length,
    modelCount: migration.prismaModels.length,
    indexCount: totalIndexCount,
    noSecretRuleCount: migration.noSecretColumnPolicy.length,
    relationshipRuleCount: migration.relationshipRules.length,
    rollbackStepCount: migration.rollbackPlan.length,
    implementationStepCount: migration.implementationSteps.length,
    checks,
  });
}
