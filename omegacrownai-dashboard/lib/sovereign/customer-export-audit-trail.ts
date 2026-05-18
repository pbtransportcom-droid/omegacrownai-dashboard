import { getProjectDistributionLiveDataBinding } from "@/lib/sovereign/project-distribution-live-data-binding";
import { getProductionArtifactWriterIntegration } from "@/lib/sovereign/production-artifact-writer-integration";
import { getPersistentArtifactStorage } from "@/lib/sovereign/persistent-artifact-storage";
import { getArtifactRebuildRollbackControls } from "@/lib/sovereign/artifact-rebuild-rollback-controls";
import { getRealCustomerWebsiteAppBundleExport } from "@/lib/sovereign/real-customer-website-app-bundle-export";

export function getCustomerExportAuditTrail() {
  const liveBinding = getProjectDistributionLiveDataBinding("cmoyy1gl700004mkqn7or7hxr");
  const production = getProductionArtifactWriterIntegration();
  const storage = getPersistentArtifactStorage();
  const rebuildRollback = getArtifactRebuildRollbackControls();
  const exportLayer = getRealCustomerWebsiteAppBundleExport();

  return {
    system: "OmegaCrownAI Customer Export Audit Trail",
    phase: "v25.2 Phase 272",
    status: "customer_export_audit_trail_ready",
    purpose:
      "Define the customer export audit trail that records generated artifact exports, ZIP downloads, preview access, rebuilds, rollbacks, customer-ready labels, validation status, and redacted artifact metadata.",
    corePrinciple:
      "Every customer-facing artifact export action must be auditable, redacted, versioned, and linked to the artifact, validation, storage, history, preview, download, and distribution records.",

    auditEventContract: {
      eventSource: "customer_artifact_export_pipeline",
      storageTarget: "audit_event_store",
      redacted: true,
      requiredFields: [
        "eventId",
        "eventType",
        "projectId",
        "artifactId",
        "artifactVersion",
        "artifactType",
        "customerReady",
        "completenessScore",
        "exportLabel",
        "actorId",
        "actorType",
        "createdAt",
        "correlationId",
        "redacted",
      ],
      optionalFields: [
        "downloadPath",
        "previewPath",
        "historyPath",
        "distributionPath",
        "validationReportPath",
        "missingInfoReportPath",
        "rebuildFromArtifactId",
        "rollbackFromArtifactId",
        "blockedReasons",
      ],
    },

    auditEventTypes: [
      {
        type: "artifact_generated",
        description: "A full-stack artifact descriptor was generated.",
      },
      {
        type: "artifact_validated",
        description: "Full-function validation was run and score/verdict were recorded.",
      },
      {
        type: "artifact_exported",
        description: "Customer export package was created or made available.",
      },
      {
        type: "artifact_zip_downloaded",
        description: "Customer ZIP package download route was accessed.",
      },
      {
        type: "artifact_preview_opened",
        description: "Live preview route was opened.",
      },
      {
        type: "artifact_history_viewed",
        description: "Artifact history page or API was viewed.",
      },
      {
        type: "artifact_distribution_viewed",
        description: "Project distribution page displayed artifact status.",
      },
      {
        type: "artifact_rebuilt",
        description: "Artifact rebuild created a new version.",
      },
      {
        type: "artifact_rollback_requested",
        description: "Rollback was requested with reason.",
      },
      {
        type: "artifact_customer_ready_labeled",
        description: "Artifact was labeled customer-ready after passing validation.",
      },
      {
        type: "artifact_draft_labeled",
        description: "Artifact was labeled draft/not customer-ready.",
      },
    ],

    auditPayloadShape: {
      eventId: "audit event id",
      eventType: "audit event type",
      projectId: "project id",
      artifactId: "artifact id",
      artifactVersion: "version number",
      artifactType: "full_stack_website_app",
      customerReady: "boolean",
      completenessScore: "0-100",
      exportLabel:
        "customer_ready_full_function_artifact | draft_not_customer_ready | blocked_missing_required_functionality",
      actorId: "user/admin/system id",
      actorType: "customer | owner | system | agent",
      correlationId: "request/build/export correlation id",
      paths: {
        previewPath: "preview path",
        downloadPath: "download path",
        historyPath: "history path",
        distributionPath: "distribution path",
        validationReportPath: "validation-report.json",
        missingInfoReportPath: "missing-info-report.md",
      },
      redaction: {
        rawSecretsIncluded: false,
        rawEnvIncluded: false,
        apiKeysIncluded: false,
        tokensIncluded: false,
        privateKeysIncluded: false,
      },
      createdAt: "ISO timestamp",
      redacted: true,
    },

    redactionRules: [
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
    ],

    customerReadyAuditRules: [
      "Only emit artifact_customer_ready_labeled when validation passes.",
      "Include completenessScore in every export audit event.",
      "Include exportLabel in every export audit event.",
      "Audit draft_not_customer_ready labels honestly.",
      "Audit blocked_missing_required_functionality when export cannot be promoted.",
      "Preserve previous customer-ready artifact audit events after rebuilds.",
      "Link rebuild/rollback events to source artifact IDs.",
    ],

    exportAuditReceiptShape: {
      auditId: "audit event id",
      projectId: "project id",
      artifactId: "artifact id",
      eventType: "artifact_exported",
      exportLabel: "export label",
      customerReady: "boolean",
      completenessScore: "0-100",
      zipDownloadAudited: "boolean",
      previewAudited: "boolean",
      historyAudited: "boolean",
      distributionAudited: "boolean",
      correlationId: "correlation id",
      redacted: true,
    },

    biscuitShopAuditExample: {
      projectId: "cmoyy1gl700004mkqn7or7hxr",
      artifactId: liveBinding.latestArtifactCard.artifactId,
      artifactVersion: 2,
      eventSequence: [
        "artifact_generated",
        "artifact_validated",
        "artifact_customer_ready_labeled",
        "artifact_exported",
        "artifact_distribution_viewed",
        "artifact_preview_opened",
        "artifact_zip_downloaded",
      ],
      customerReady: liveBinding.latestArtifactCard.customerReady,
      completenessScore: liveBinding.latestArtifactCard.completenessScore,
      exportLabel: "customer_ready_full_function_artifact",
      previewPath: liveBinding.latestArtifactCard.previewPath,
      downloadPath: liveBinding.latestArtifactCard.downloadPath,
      historyPath: liveBinding.latestArtifactCard.historyPath,
      distributionPath: liveBinding.latestArtifactCard.distributionPath,
      redacted: true,
    },

    auditTrailCompletenessChecks: [
      "Audit event contract includes projectId, artifactId, version, score, label, actor, correlation, and redaction.",
      "Audit event types cover generation, validation, export, download, preview, history, distribution, rebuild, rollback, and labels.",
      "Payload shape includes redacted paths and report links.",
      "Redaction rules block secrets, tokens, authorization headers, and raw environment values.",
      "Customer-ready audit rules prevent false customer-ready labels.",
      "Export audit receipt shape includes ZIP, preview, history, distribution, score, label, and redaction.",
      "Biscuit shop audit example records a full customer-ready export sequence.",
      "Integration sources confirm live binding, production writer, storage, rebuild/rollback, and export layers are ready.",
    ],

    integrationSources: {
      projectDistributionLiveDataBindingStatus: liveBinding.status,
      productionArtifactWriterIntegrationStatus: production.status,
      persistentArtifactStorageStatus: storage.status,
      artifactRebuildRollbackControlsStatus: rebuildRollback.status,
      realCustomerBundleExportStatus: exportLayer.status,
    },

    nextImplementationPhases: [
      "Persistent Artifact Database Migration",
      "Rebuild/Rollback API Implementation",
      "Production Artifact Writer Execution Route",
      "Distribution Page Live UI Injection",
      "Customer Export Audit Persistence",
    ],
  };
}
