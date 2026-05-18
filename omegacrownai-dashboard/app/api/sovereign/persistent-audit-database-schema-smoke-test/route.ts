import { NextResponse } from "next/server";
import { getPersistentAuditDatabaseSchema } from "@/lib/sovereign/persistent-audit-database-schema";

const requiredTables = [
  "audit_events",
  "connector_audit_events",
  "execution_audit_events",
  "memory_audit_events",
  "deployment_audit_events",
  "incident_events",
];

export async function GET() {
  const schema = getPersistentAuditDatabaseSchema();
  const tableNames = schema.tables.map((table) => table.name);
  const missingTables = requiredTables.filter((table) => !tableNames.includes(table));

  const checks = [
    {
      name: "Schema blueprint is ready",
      passed: schema.status === "schema_blueprint_ready",
      detail: schema.status,
    },
    {
      name: "Required audit tables present",
      passed: missingTables.length === 0,
      detail: missingTables.length ? `Missing: ${missingTables.join(", ")}` : "All required tables present.",
    },
    {
      name: "Indexes present",
      passed: schema.indexes.length >= 7,
      detail: `${schema.indexes.length} indexes`,
    },
    {
      name: "Retention policy present",
      passed: schema.retentionPolicy.length >= 5,
      detail: `${schema.retentionPolicy.length} retention rules`,
    },
    {
      name: "Migration plan present",
      passed: schema.migrationPlan.length >= 5,
      detail: `${schema.migrationPlan.length} migration steps`,
    },
  ];

  const passedChecks = checks.filter((check) => check.passed).length;

  return NextResponse.json({
    ok: checks.every((check) => check.passed),
    phase: "v18.1 Phase 201",
    service: "Persistent Audit Database Schema Smoke Test",
    totalChecks: checks.length,
    passedChecks,
    failedChecks: checks.length - passedChecks,
    tableCount: schema.tables.length,
    indexCount: schema.indexes.length,
    retentionRuleCount: schema.retentionPolicy.length,
    migrationStepCount: schema.migrationPlan.length,
    checks,
  });
}
