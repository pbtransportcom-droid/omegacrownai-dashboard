import { NextResponse } from "next/server";
import { getCustomerExportAuditTrail } from "@/lib/sovereign/customer-export-audit-trail";

const requiredEventTypes = [
  "artifact_generated",
  "artifact_validated",
  "artifact_exported",
  "artifact_zip_downloaded",
  "artifact_preview_opened",
  "artifact_history_viewed",
  "artifact_distribution_viewed",
  "artifact_rebuilt",
  "artifact_rollback_requested",
  "artifact_customer_ready_labeled",
  "artifact_draft_labeled",
];

const requiredRedactionRules = [
  "Do not audit raw .env values.",
  "Do not audit raw secrets.",
  "Do not audit OAuth tokens.",
  "Do not audit API keys.",
  "Do not audit passwords.",
  "Do not audit private keys.",
  "Do not audit authorization headers.",
  "Do not audit full customer PII payloads.",
  "Store IDs, statuses, scores, paths, and labels only.",
  "Mark audit payloads redacted.",
];

const requiredCustomerReadyRules = [
  "Only emit artifact_customer_ready_labeled when validation passes.",
  "Include completenessScore in every export audit event.",
  "Include exportLabel in every export audit event.",
  "Audit draft_not_customer_ready labels honestly.",
  "Audit blocked_missing_required_functionality when export cannot be promoted.",
  "Preserve previous customer-ready artifact audit events after rebuilds.",
  "Link rebuild/rollback events to source artifact IDs.",
];

export async function GET() {
  const auditTrail = getCustomerExportAuditTrail();

  const eventTypes = auditTrail.auditEventTypes.map((event) => event.type);

  const missingEventTypes = requiredEventTypes.filter(
    (item) => !eventTypes.includes(item)
  );

  const missingRedactionRules = requiredRedactionRules.filter(
    (item) => !auditTrail.redactionRules.includes(item)
  );

  const missingCustomerReadyRules = requiredCustomerReadyRules.filter(
    (item) => !auditTrail.customerReadyAuditRules.includes(item)
  );

  const checks = [
    {
      name: "Customer Export Audit Trail is ready",
      passed: auditTrail.status === "customer_export_audit_trail_ready",
      detail: auditTrail.status,
    },
    {
      name: "Audit event contract includes required fields",
      passed:
        auditTrail.auditEventContract.requiredFields.includes("projectId") &&
        auditTrail.auditEventContract.requiredFields.includes("artifactId") &&
        auditTrail.auditEventContract.requiredFields.includes("completenessScore") &&
        auditTrail.auditEventContract.requiredFields.includes("exportLabel") &&
        auditTrail.auditEventContract.requiredFields.includes("correlationId") &&
        auditTrail.auditEventContract.redacted === true,
      detail: `${auditTrail.auditEventContract.requiredFields.length} required fields`,
    },
    {
      name: "Required audit event types present",
      passed: missingEventTypes.length === 0,
      detail: missingEventTypes.length ? `Missing: ${missingEventTypes.join(", ")}` : "All event types present.",
    },
    {
      name: "Audit payload shape is redacted",
      passed:
        Boolean(auditTrail.auditPayloadShape.eventId) &&
        Boolean(auditTrail.auditPayloadShape.paths.downloadPath) &&
        auditTrail.auditPayloadShape.redaction.rawSecretsIncluded === false &&
        auditTrail.auditPayloadShape.redaction.rawEnvIncluded === false &&
        auditTrail.auditPayloadShape.redaction.apiKeysIncluded === false &&
        auditTrail.auditPayloadShape.redacted === true,
      detail: "Payload shape redacted.",
    },
    {
      name: "Redaction rules present",
      passed: missingRedactionRules.length === 0,
      detail: missingRedactionRules.length ? `Missing: ${missingRedactionRules.join(", ")}` : "All redaction rules present.",
    },
    {
      name: "Customer-ready audit rules present",
      passed: missingCustomerReadyRules.length === 0,
      detail: missingCustomerReadyRules.length
        ? `Missing: ${missingCustomerReadyRules.join(", ")}`
        : "Customer-ready audit rules present.",
    },
    {
      name: "Export audit receipt shape present",
      passed:
        Boolean(auditTrail.exportAuditReceiptShape.auditId) &&
        Boolean(auditTrail.exportAuditReceiptShape.exportLabel) &&
        Boolean(auditTrail.exportAuditReceiptShape.correlationId) &&
        auditTrail.exportAuditReceiptShape.redacted === true,
      detail: "Export audit receipt shape defined.",
    },
    {
      name: "Biscuit shop audit example is customer-ready and sequenced",
      passed:
        auditTrail.biscuitShopAuditExample.customerReady === true &&
        auditTrail.biscuitShopAuditExample.completenessScore === 100 &&
        auditTrail.biscuitShopAuditExample.eventSequence.includes("artifact_exported") &&
        auditTrail.biscuitShopAuditExample.eventSequence.includes("artifact_zip_downloaded") &&
        auditTrail.biscuitShopAuditExample.redacted === true,
      detail: `${auditTrail.biscuitShopAuditExample.eventSequence.length} event sequence`,
    },
    {
      name: "Audit trail completeness checks present",
      passed: auditTrail.auditTrailCompletenessChecks.length >= 8,
      detail: `${auditTrail.auditTrailCompletenessChecks.length} checks`,
    },
    {
      name: "Integration sources present",
      passed:
        auditTrail.integrationSources.projectDistributionLiveDataBindingStatus === "project_distribution_live_data_binding_ready" &&
        auditTrail.integrationSources.productionArtifactWriterIntegrationStatus === "production_artifact_writer_integration_ready" &&
        auditTrail.integrationSources.persistentArtifactStorageStatus === "persistent_artifact_storage_ready" &&
        auditTrail.integrationSources.artifactRebuildRollbackControlsStatus === "artifact_rebuild_rollback_controls_ready" &&
        auditTrail.integrationSources.realCustomerBundleExportStatus === "real_customer_website_app_bundle_export_ready",
      detail: "Live binding, production writer, storage, rebuild/rollback, and export linked.",
    },
  ];

  const passedChecks = checks.filter((check) => check.passed).length;

  return NextResponse.json({
    ok: checks.every((check) => check.passed),
    phase: "v25.2 Phase 272",
    service: "Customer Export Audit Trail Smoke Test",
    totalChecks: checks.length,
    passedChecks,
    failedChecks: checks.length - passedChecks,
    requiredFieldCount: auditTrail.auditEventContract.requiredFields.length,
    eventTypeCount: auditTrail.auditEventTypes.length,
    redactionRuleCount: auditTrail.redactionRules.length,
    customerReadyAuditRuleCount: auditTrail.customerReadyAuditRules.length,
    biscuitAuditEventCount: auditTrail.biscuitShopAuditExample.eventSequence.length,
    auditTrailCompletenessCheckCount: auditTrail.auditTrailCompletenessChecks.length,
    checks,
  });
}
