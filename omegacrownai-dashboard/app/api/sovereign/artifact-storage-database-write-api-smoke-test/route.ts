import { NextResponse } from "next/server";
import {
  getArtifactStorageDatabaseWriteApi,
  simulateArtifactStorageDatabaseWrite,
} from "@/lib/sovereign/artifact-storage-database-write-api";

const requiredTargets = [
  "ArtifactStorageRecord",
  "ArtifactHistoryRecord",
  "ArtifactExportAuditEvent",
];

const requiredSafeRules = [
  "Do not write raw .env values.",
  "Do not write secrets, tokens, API keys, passwords, private keys, or authorization headers.",
  "Do not write full customer PII payloads.",
  "Use redacted records only.",
  "Do not overwrite artifact versions in place.",
  "Append audit events only.",
  "Preserve customer-ready storage and history records.",
  "Keep storage, history, and audit records linked by projectId, artifactId, version, and correlationId.",
];

export async function GET() {
  const api = getArtifactStorageDatabaseWriteApi();

  const write = simulateArtifactStorageDatabaseWrite({
    projectId: "cmoyy1gl700004mkqn7or7hxr",
    requestedBy: "system",
  });

  const missingTargets = requiredTargets.filter(
    (target) => !api.databaseWriteTargets.includes(target)
  );

  const missingSafeRules = requiredSafeRules.filter(
    (rule) => !api.safeWriteRules.includes(rule)
  );

  const checks = [
    {
      name: "Artifact Storage Database Write API is ready",
      passed: api.status === "artifact_storage_database_write_api_ready",
      detail: api.status,
    },
    {
      name: "Write API contracts present",
      passed:
        api.writeApiContracts.length >= 3 &&
        api.writeApiContracts.some((route) => route.method === "POST" && route.route.includes("write-storage-records")),
      detail: `${api.writeApiContracts.length} write API contracts`,
    },
    {
      name: "Database write targets present",
      passed: missingTargets.length === 0,
      detail: missingTargets.length ? `Missing: ${missingTargets.join(", ")}` : "Write targets present.",
    },
    {
      name: "Write flow present",
      passed: api.writeFlow.length >= 10,
      detail: `${api.writeFlow.length} write flow steps`,
    },
    {
      name: "Payload validation rules present",
      passed: api.payloadValidationRules.length >= 9,
      detail: `${api.payloadValidationRules.length} payload validation rules`,
    },
    {
      name: "Write receipt shape present",
      passed:
        Boolean(api.writeReceiptShape.writeId) &&
        Boolean(api.writeReceiptShape.correlationId) &&
        api.writeReceiptShape.redacted === true,
      detail: "Write receipt shape defined.",
    },
    {
      name: "Query shape present",
      passed:
        Boolean(api.queryShape.projectId) &&
        Boolean(api.queryShape.artifactId) &&
        Boolean(api.queryShape.eventType) &&
        Boolean(api.queryShape.cursor),
      detail: "Query shape defined.",
    },
    {
      name: "Safe write rules present",
      passed: missingSafeRules.length === 0,
      detail: missingSafeRules.length ? `Missing: ${missingSafeRules.join(", ")}` : "Safe write rules present.",
    },
    {
      name: "Simulated write returns all records",
      passed:
        write.ok === true &&
        write.writeReceipt.storageRecordWritten === true &&
        write.writeReceipt.historyRecordWritten === true &&
        write.writeReceipt.auditEventWritten === true &&
        write.records.storageRecord.redacted === true &&
        write.records.historyRecord.redacted === true &&
        write.records.auditEvent.redacted === true,
      detail: "Storage, history, and audit records returned.",
    },
    {
      name: "Simulated write is customer-ready and safe",
      passed:
        write.writeReceipt.customerReady === true &&
        write.writeReceipt.completenessScore === 100 &&
        write.safety.rawEnvStored === false &&
        write.safety.secretsStored === false &&
        write.safety.fullPiiPayloadStored === false,
      detail: `score ${write.writeReceipt.completenessScore}`,
    },
    {
      name: "Biscuit shop write example passes",
      passed:
        api.biscuitShopWriteExample.storageRecordWritten === true &&
        api.biscuitShopWriteExample.historyRecordWritten === true &&
        api.biscuitShopWriteExample.auditEventWritten === true &&
        api.biscuitShopWriteExample.customerReady === true &&
        api.biscuitShopWriteExample.completenessScore === 100,
      detail: "Biscuit write example customer-ready.",
    },
    {
      name: "Completeness checks present",
      passed: api.writeApiCompletenessChecks.length >= 9,
      detail: `${api.writeApiCompletenessChecks.length} checks`,
    },
    {
      name: "Integration sources present",
      passed:
        api.integrationSources.persistentArtifactDatabaseMigrationStatus === "persistent_artifact_database_migration_ready" &&
        api.integrationSources.persistentArtifactStorageStatus === "persistent_artifact_storage_ready" &&
        api.integrationSources.customerExportAuditPersistenceStatus === "customer_export_audit_persistence_ready",
      detail: "DB migration, persistent storage, and audit persistence linked.",
    },
  ];

  const passedChecks = checks.filter((check) => check.passed).length;

  return NextResponse.json({
    ok: checks.every((check) => check.passed),
    phase: "v25.8 Phase 278",
    service: "Artifact Storage Database Write API Smoke Test",
    totalChecks: checks.length,
    passedChecks,
    failedChecks: checks.length - passedChecks,
    writeApiContractCount: api.writeApiContracts.length,
    databaseWriteTargetCount: api.databaseWriteTargets.length,
    writeFlowStepCount: api.writeFlow.length,
    payloadValidationRuleCount: api.payloadValidationRules.length,
    safeWriteRuleCount: api.safeWriteRules.length,
    completenessCheckCount: api.writeApiCompletenessChecks.length,
    simulatedCustomerReady: write.writeReceipt.customerReady,
    simulatedScore: write.writeReceipt.completenessScore,
    checks,
  });
}
