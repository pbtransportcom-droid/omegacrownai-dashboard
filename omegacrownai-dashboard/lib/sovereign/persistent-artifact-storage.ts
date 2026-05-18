import { getRealCustomerWebsiteAppBundleExport } from "@/lib/sovereign/real-customer-website-app-bundle-export";
import { getGeneratedArtifactFileSystemWriter } from "@/lib/sovereign/generated-artifact-file-system-writer";
import { getArtifactHistoryUiUpgrade } from "@/lib/sovereign/artifact-history-ui-upgrade";
import { getProjectDistributionPreviewCards } from "@/lib/sovereign/project-distribution-preview-cards";

export function getPersistentArtifactStorage() {
  const exportLayer = getRealCustomerWebsiteAppBundleExport();
  const fileWriter = getGeneratedArtifactFileSystemWriter();
  const historyUi = getArtifactHistoryUiUpgrade();
  const distribution = getProjectDistributionPreviewCards();

  return {
    system: "OmegaCrownAI Persistent Artifact Storage",
    phase: "v24.8 Phase 268",
    status: "persistent_artifact_storage_ready",
    purpose:
      "Define the persistent artifact storage layer that keeps generated website/app bundles, source files, reports, ZIP packages, preview metadata, history records, and distribution links durable across rebuilds and restarts.",
    corePrinciple:
      "Generated customer artifacts must not be temporary-only. A paid/customer artifact needs durable storage metadata, source/report paths, ZIP path, validation status, and recovery references.",

    storageContract: {
      storageType: "project_scoped_artifact_storage",
      rootPattern: "public/uploads/projects/{projectId}/artifacts/{artifactId}",
      databaseRecord: "ArtifactStorageRecord",
      requiredStoredAssets: [
        "source file tree",
        "download ZIP",
        "artifact-manifest.json",
        "validation-report.json",
        "missing-info-report.md",
        "deployment.md",
        "README.md",
        ".env.example",
      ],
      requiredStoredMetadata: [
        "projectId",
        "artifactId",
        "version",
        "artifactType",
        "customerReady",
        "completenessScore",
        "exportLabel",
        "storageRoot",
        "zipPath",
        "previewPath",
        "downloadPath",
        "historyPath",
        "distributionPath",
        "createdAt",
        "updatedAt",
        "redacted",
      ],
    },

    artifactStorageRecordShape: {
      id: "storage record id",
      projectId: "project id",
      artifactId: "artifact id",
      version: "integer",
      artifactType: "full_stack_website_app",
      title: "artifact title",
      customerReady: "boolean",
      completenessScore: "0-100",
      exportLabel:
        "customer_ready_full_function_artifact | draft_not_customer_ready | blocked_missing_required_functionality",
      storageRoot: "project-scoped artifact root",
      sourceRoot: "source file tree path",
      zipPath: "download zip path",
      manifestPath: "artifact-manifest.json path",
      validationReportPath: "validation-report.json path",
      missingInfoReportPath: "missing-info-report.md path",
      deploymentGuidePath: "deployment.md path",
      previewPath: "preview URL",
      adminPreviewPath: "admin preview URL",
      downloadPath: "download URL",
      historyPath: "history URL",
      distributionPath: "distribution URL",
      createdAt: "ISO timestamp",
      updatedAt: "ISO timestamp",
      redacted: true,
    },

    persistenceFlow: [
      "Generate full-stack artifact.",
      "Run validation.",
      "Create file-system write plan.",
      "Create ZIP package.",
      "Write source files to project artifact root.",
      "Write reports to artifact root.",
      "Write ZIP package to artifact root.",
      "Create artifact storage record.",
      "Create artifact history record.",
      "Expose preview/download/history/distribution links.",
      "Preserve previous versions.",
      "Return persistent storage receipt.",
    ],

    retentionRules: [
      "Preserve customer-ready artifacts by default.",
      "Preserve blocked/draft artifacts for audit and rebuild history.",
      "Never overwrite artifact versions in place.",
      "Allow cleanup only through explicit retention policy.",
      "Do not delete reports needed to explain validation or missing information.",
      "Do not delete ZIP packages for customer-ready exports unless archived elsewhere.",
      "Keep rebuild/rollback lineage references.",
    ],

    safeStorageRules: [
      "Storage root must be project-scoped.",
      "Artifact paths must be normalized.",
      "Path traversal must be blocked.",
      "Absolute write paths must be blocked.",
      "Do not store raw .env.",
      "Do not store secrets, tokens, API keys, passwords, or private keys.",
      "Do not store node_modules.",
      "Do not store .next cache.",
      "Do not store PM2 or server logs.",
      "Store .env.example only.",
      "Mark storage records as redacted.",
    ],

    biscuitShopStorageExample: {
      projectId: "cmoyy1gl700004mkqn7or7hxr",
      artifactId:
        exportLayer.biscuitShopExportExample.artifactId,
      title: "Biscuit Shop Full-Stack Website Export",
      customerReady: exportLayer.biscuitShopExportExample.customerReady,
      completenessScore: exportLayer.biscuitShopExportExample.completenessScore,
      exportLabel: exportLayer.biscuitShopExportExample.exportLabel,
      storageRoot:
        "public/uploads/projects/cmoyy1gl700004mkqn7or7hxr/artifacts/{artifactId}",
      requiredStoredAssets: [
        "source file tree",
        "download ZIP",
        "README.md",
        ".env.example",
        "deployment.md",
        "artifact-manifest.json",
        "validation-report.json",
        "missing-info-report.md",
      ],
      previewPath: exportLayer.biscuitShopExportExample.previewPath,
      adminPreviewPath: exportLayer.biscuitShopExportExample.adminPreviewPath,
      downloadPath: exportLayer.biscuitShopExportExample.downloadPath,
      historyPath: exportLayer.biscuitShopExportExample.historyPath,
      distributionPath: exportLayer.biscuitShopExportExample.distributionPath,
      redacted: true,
    },

    storageReceiptShape: {
      storageId: "storage record id",
      projectId: "project id",
      artifactId: "artifact id",
      stored: "boolean",
      storedAssetCount: "number",
      customerReady: "boolean",
      completenessScore: "0-100",
      exportLabel: "export label",
      storageRoot: "storage root",
      zipPath: "zip path",
      previewPath: "preview path",
      downloadPath: "download path",
      historyPath: "history path",
      distributionPath: "distribution path",
      redacted: true,
    },

    persistentStorageCompletenessChecks: [
      "Storage contract exists.",
      "Storage record shape includes source, ZIP, reports, preview, download, history, and distribution paths.",
      "Persistence flow stores files, ZIP, reports, history, and receipt.",
      "Retention rules preserve customer-ready and draft history.",
      "Safe storage rules block secrets and unsafe runtime folders.",
      "Biscuit shop storage example is customer-ready and full-stack.",
      "Storage receipt shape includes status, score, paths, and redaction.",
      "Integration sources confirm export, file writer, history UI, and distribution preview are ready.",
    ],

    integrationSources: {
      realCustomerBundleExportStatus: exportLayer.status,
      generatedArtifactFileSystemWriterStatus: fileWriter.status,
      artifactHistoryUiStatus: historyUi.status,
      projectDistributionPreviewCardsStatus: distribution.status,
    },

    nextImplementationPhases: [
      "Artifact Rebuild/Rollback Controls",
      "Production Artifact Writer Integration",
      "Project Distribution Live Data Binding",
      "Customer Export Audit Trail",
      "Persistent Artifact Database Migration",
    ],
  };
}
