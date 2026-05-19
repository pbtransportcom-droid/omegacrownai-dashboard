import { getCustomerExportAuditTrail } from "@/lib/sovereign/customer-export-audit-trail";
import { getPersistentArtifactDatabaseMigration } from "@/lib/sovereign/persistent-artifact-database-migration";
import { getProductionArtifactWriterExecutionRoute } from "@/lib/sovereign/production-artifact-writer-execution-route";
import { getProjectDistributionLiveDataBinding } from "@/lib/sovereign/project-distribution-live-data-binding";

export function getCustomerExportAuditPersistence() {
  const auditTrail = getCustomerExportAuditTrail();
  const migration = getPersistentArtifactDatabaseMigration();
  const execution = getProductionArtifactWriterExecutionRoute();
  const liveBinding = getProjectDistributionLiveDataBinding("cmoyy1gl700004mkqn7or7hxr");

  return {
    system: "OmegaCrownAI Customer Export Audit Persistence",
    phase: "v25.7 Phase 277",
    status: "customer_export_audit_persistence_ready",
    purpose:
      "Define the persistence layer for customer export audit events so artifact generation, validation, export, ZIP downloads, previews, history views, distribution views, rebuilds, rollbacks, and customer-ready labels can be stored as redacted database records.",
    corePrinciple:
      "Customer-facing artifact actions must be persisted in a redacted audit table with correlation IDs, artifact version references, customer-ready labels, scores, and safe paths, without storing secrets or raw environment data.",

    persistentAuditWriteContract: {
      targetModel: "ArtifactExportAuditEvent",
      writeMode: "append_only",
      idempotencyKey:
        "projectId + artifactId + artifactVersion + eventType + correlationId",
      requiredFields: [
        "eventType",
        "eventSource",
        "projectId",
        "artifactId",
        "artifactVersion",
        "artifactType",
        "customerReady",
        "completenessScore",
        "exportLabel",
        "actorId",
        "actorType",
        "correlationId",
        "redacted",
      ],
      persistedPaths: [
        "previewPath",
        "downloadPath",
        "historyPath",
        "distributionPath",
        "validationReportPath",
        "missingInfoReportPath",
      ],
      redacted: true,
    },

    persistentAuditEventTypes: [
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
    ],

    auditWriteFlow: [
      "Receive artifact event from generation/export/download/preview/history/distribution/rebuild/rollback route.",
      "Normalize projectId, artifactId, actorId, actorType, and correlationId.",
      "Attach artifact version, score, customerReady, and exportLabel.",
      "Attach safe preview/download/history/distribution/report paths.",
      "Remove or reject secrets, raw environment values, authorization headers, and full PII payloads.",
      "Mark event redacted.",
      "Append ArtifactExportAuditEvent record.",
      "Return audit persistence receipt.",
    ],

    auditPersistenceReceiptShape: {
      auditId: "created audit event id",
      eventType: "audit event type",
      projectId: "project id",
      artifactId: "artifact id",
      artifactVersion: "number",
      persisted: "boolean",
      correlationId: "correlation id",
      customerReady: "boolean",
      completenessScore: "0-100",
      exportLabel: "export label",
      redacted: true,
    },

    auditReadQueryShape: {
      projectId: "optional project id",
      artifactId: "optional artifact id",
      eventType: "optional event type",
      correlationId: "optional correlation id",
      customerReady: "optional boolean",
      createdAfter: "optional ISO date",
      createdBefore: "optional ISO date",
      limit: "number",
      cursor: "pagination cursor",
    },

    auditRetentionRules: [
      "Preserve customer export audit records by default.",
      "Preserve customer-ready label events permanently unless legal retention policy says otherwise.",
      "Preserve rebuild and rollback events for lineage.",
      "Preserve ZIP download audit events for export accountability.",
      "Allow redacted event pruning only through explicit retention policy.",
      "Never delete audit records as part of artifact rollback.",
      "Never mutate historical audit events in place.",
    ],

    auditSafetyRules: [
      "Do not persist raw .env values.",
      "Do not persist secrets, tokens, API keys, passwords, or private keys.",
      "Do not persist authorization headers.",
      "Do not persist full customer PII payloads.",
      "Persist IDs, labels, scores, safe paths, statuses, and correlation IDs only.",
      "Always set redacted true.",
      "Use append-only writes for audit events.",
      "Do not overwrite historical audit events.",
    ],

    biscuitShopAuditPersistenceExample: {
      projectId: "cmoyy1gl700004mkqn7or7hxr",
      artifactId: liveBinding.latestArtifactCard.artifactId,
      artifactVersion: 2,
      customerReady: true,
      completenessScore: 100,
      exportLabel: "customer_ready_full_function_artifact",
      correlationId: "corr_biscuit_shop_export_v2",
      persistedEventSequence: [
        "artifact_generated",
        "artifact_validated",
        "artifact_customer_ready_labeled",
        "artifact_exported",
        "artifact_distribution_viewed",
        "artifact_preview_opened",
        "artifact_zip_downloaded",
      ],
      safePaths: {
        previewPath: liveBinding.latestArtifactCard.previewPath,
        downloadPath: liveBinding.latestArtifactCard.downloadPath,
        historyPath: liveBinding.latestArtifactCard.historyPath,
        distributionPath: liveBinding.latestArtifactCard.distributionPath,
        validationReportPath: "validation-report.json",
        missingInfoReportPath: "missing-info-report.md",
      },
      redacted: true,
    },

    persistenceCompletenessChecks: [
      "Persistent audit write contract targets ArtifactExportAuditEvent.",
      "Event types cover generation, validation, labels, export, ZIP download, preview, history, distribution, rebuild, and rollback.",
      "Audit write flow normalizes IDs, attaches score/label, redacts unsafe data, and appends records.",
      "Audit receipt shape includes event, artifact, score, label, correlation, persisted flag, and redaction.",
      "Audit read query shape supports project, artifact, event type, correlation, customerReady, dates, and pagination.",
      "Retention rules preserve customer-ready, rebuild, rollback, and ZIP download audit history.",
      "Safety rules block secrets, raw env values, authorization headers, and full PII payloads.",
      "Biscuit shop audit persistence example records customer-ready export sequence.",
      "Integration sources confirm audit trail, database migration, production execution, and live binding are ready.",
    ],

    integrationSources: {
      customerExportAuditTrailStatus: auditTrail.status,
      persistentArtifactDatabaseMigrationStatus: migration.status,
      productionArtifactWriterExecutionRouteStatus: execution.status,
      projectDistributionLiveDataBindingStatus: liveBinding.status,
    },

    nextImplementationPhases: [
      "Artifact Storage Database Write API",
      "Rebuild/Rollback Persistence Integration",
      "Full-Function Customer Artifact Release Gate",
      "Production Website/App Generator File Writer",
      "Customer Artifact Billing/Entitlement Gate",
    ],
  };
}
