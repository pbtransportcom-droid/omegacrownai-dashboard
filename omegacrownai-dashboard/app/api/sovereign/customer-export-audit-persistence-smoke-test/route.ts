import { NextResponse } from "next/server";
import { getCustomerExportAuditPersistence } from "@/lib/sovereign/customer-export-audit-persistence";

const requiredEventTypes = [
  "artifact_generated",
  "artifact_validated",
  "artifact_customer_ready_labeled",
  "artifact_draft_labeled",
  "artifact_exported",
  "artifact_zip_downloaded",
  "artifact_preview_opened",
  "artifact_history_viewed",
  "artifact_distribution_viewed",
  "artifact_rebuilt",
  "artifact_rollback_requested",
];

const requiredSafetyRules = [
  "Do not persist raw .env values.",
  "Do not persist secrets, tokens, API keys, passwords, or private keys.",
  "Do not persist authorization headers.",
  "Do not persist full customer PII payloads.",
  "Persist IDs, labels, scores, safe paths, statuses, and correlation IDs only.",
  "Always set redacted true.",
  "Use append-only writes for audit events.",
  "Do not overwrite historical audit events.",
];

export async function GET() {
  const persistence = getCustomerExportAuditPersistence();

  const missingEventTypes = requiredEventTypes.filter(
    (eventType) => !persistence.persistentAuditEventTypes.includes(eventType)
  );

  const missingSafetyRules = requiredSafetyRules.filter(
    (rule) => !persistence.auditSafetyRules.includes(rule)
  );

  const checks = [
    {
      name: "Customer Export Audit Persistence is ready",
      passed: persistence.status === "customer_export_audit_persistence_ready",
      detail: persistence.status,
    },
    {
      name: "Persistent audit write contract present",
      passed:
        persistence.persistentAuditWriteContract.targetModel === "ArtifactExportAuditEvent" &&
        persistence.persistentAuditWriteContract.writeMode === "append_only" &&
        persistence.persistentAuditWriteContract.requiredFields.includes("correlationId") &&
        persistence.persistentAuditWriteContract.redacted === true,
      detail: persistence.persistentAuditWriteContract.targetModel,
    },
    {
      name: "Required persistent audit event types present",
      passed: missingEventTypes.length === 0,
      detail: missingEventTypes.length ? `Missing: ${missingEventTypes.join(", ")}` : "All event types present.",
    },
    {
      name: "Audit write flow present",
      passed: persistence.auditWriteFlow.length >= 8,
      detail: `${persistence.auditWriteFlow.length} write flow steps`,
    },
    {
      name: "Audit persistence receipt shape present",
      passed:
        Boolean(persistence.auditPersistenceReceiptShape.auditId) &&
        Boolean(persistence.auditPersistenceReceiptShape.correlationId) &&
        Boolean(persistence.auditPersistenceReceiptShape.exportLabel) &&
        persistence.auditPersistenceReceiptShape.redacted === true,
      detail: "Receipt shape present.",
    },
    {
      name: "Audit read query shape present",
      passed:
        Boolean(persistence.auditReadQueryShape.projectId) &&
        Boolean(persistence.auditReadQueryShape.artifactId) &&
        Boolean(persistence.auditReadQueryShape.eventType) &&
        Boolean(persistence.auditReadQueryShape.cursor),
      detail: "Read query shape present.",
    },
    {
      name: "Audit retention rules present",
      passed: persistence.auditRetentionRules.length >= 7,
      detail: `${persistence.auditRetentionRules.length} retention rules`,
    },
    {
      name: "Audit safety rules present",
      passed: missingSafetyRules.length === 0,
      detail: missingSafetyRules.length ? `Missing: ${missingSafetyRules.join(", ")}` : "Safety rules present.",
    },
    {
      name: "Biscuit shop audit persistence example is customer-ready and redacted",
      passed:
        persistence.biscuitShopAuditPersistenceExample.customerReady === true &&
        persistence.biscuitShopAuditPersistenceExample.completenessScore === 100 &&
        persistence.biscuitShopAuditPersistenceExample.persistedEventSequence.includes("artifact_zip_downloaded") &&
        persistence.biscuitShopAuditPersistenceExample.redacted === true,
      detail: `${persistence.biscuitShopAuditPersistenceExample.persistedEventSequence.length} events`,
    },
    {
      name: "Persistence completeness checks present",
      passed: persistence.persistenceCompletenessChecks.length >= 9,
      detail: `${persistence.persistenceCompletenessChecks.length} checks`,
    },
    {
      name: "Integration sources present",
      passed:
        persistence.integrationSources.customerExportAuditTrailStatus === "customer_export_audit_trail_ready" &&
        persistence.integrationSources.persistentArtifactDatabaseMigrationStatus === "persistent_artifact_database_migration_ready" &&
        persistence.integrationSources.productionArtifactWriterExecutionRouteStatus === "production_artifact_writer_execution_route_ready" &&
        persistence.integrationSources.projectDistributionLiveDataBindingStatus === "project_distribution_live_data_binding_ready",
      detail: "Audit trail, DB migration, production execution, and live binding linked.",
    },
  ];

  const passedChecks = checks.filter((check) => check.passed).length;

  return NextResponse.json({
    ok: checks.every((check) => check.passed),
    phase: "v25.7 Phase 277",
    service: "Customer Export Audit Persistence Smoke Test",
    totalChecks: checks.length,
    passedChecks,
    failedChecks: checks.length - passedChecks,
    persistentEventTypeCount: persistence.persistentAuditEventTypes.length,
    auditWriteFlowStepCount: persistence.auditWriteFlow.length,
    auditRetentionRuleCount: persistence.auditRetentionRules.length,
    auditSafetyRuleCount: persistence.auditSafetyRules.length,
    persistedBiscuitEventCount:
      persistence.biscuitShopAuditPersistenceExample.persistedEventSequence.length,
    persistenceCompletenessCheckCount: persistence.persistenceCompletenessChecks.length,
    checks,
  });
}
