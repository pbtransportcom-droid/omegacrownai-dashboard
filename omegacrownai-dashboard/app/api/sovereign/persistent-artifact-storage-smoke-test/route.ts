import { NextResponse } from "next/server";
import { getPersistentArtifactStorage } from "@/lib/sovereign/persistent-artifact-storage";

const requiredAssets = [
  "source file tree",
  "download ZIP",
  "artifact-manifest.json",
  "validation-report.json",
  "missing-info-report.md",
  "deployment.md",
  "README.md",
  ".env.example",
];

const requiredMetadata = [
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
];

const requiredSafeRules = [
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
];

export async function GET() {
  const storage = getPersistentArtifactStorage();

  const missingAssets = requiredAssets.filter(
    (item) => !storage.storageContract.requiredStoredAssets.includes(item)
  );

  const missingMetadata = requiredMetadata.filter(
    (item) => !storage.storageContract.requiredStoredMetadata.includes(item)
  );

  const missingSafeRules = requiredSafeRules.filter(
    (item) => !storage.safeStorageRules.includes(item)
  );

  const checks = [
    {
      name: "Persistent Artifact Storage is ready",
      passed: storage.status === "persistent_artifact_storage_ready",
      detail: storage.status,
    },
    {
      name: "Storage contract includes required assets and metadata",
      passed: missingAssets.length === 0 && missingMetadata.length === 0,
      detail:
        missingAssets.length || missingMetadata.length
          ? `Missing assets: ${missingAssets.join(", ")}; missing metadata: ${missingMetadata.join(", ")}`
          : "Assets and metadata present.",
    },
    {
      name: "Artifact storage record shape present",
      passed:
        Boolean(storage.artifactStorageRecordShape.artifactId) &&
        Boolean(storage.artifactStorageRecordShape.zipPath) &&
        Boolean(storage.artifactStorageRecordShape.validationReportPath) &&
        Boolean(storage.artifactStorageRecordShape.downloadPath) &&
        storage.artifactStorageRecordShape.redacted === true,
      detail: "Storage record shape defined.",
    },
    {
      name: "Persistence flow present",
      passed: storage.persistenceFlow.length >= 12,
      detail: `${storage.persistenceFlow.length} persistence steps`,
    },
    {
      name: "Retention rules present",
      passed: storage.retentionRules.length >= 7,
      detail: `${storage.retentionRules.length} retention rules`,
    },
    {
      name: "Safe storage rules present",
      passed: missingSafeRules.length === 0,
      detail: missingSafeRules.length ? `Missing: ${missingSafeRules.join(", ")}` : "Safe storage rules present.",
    },
    {
      name: "Biscuit shop storage example is full-stack and customer-ready",
      passed:
        storage.biscuitShopStorageExample.customerReady === true &&
        storage.biscuitShopStorageExample.completenessScore === 100 &&
        storage.biscuitShopStorageExample.requiredStoredAssets.includes("download ZIP") &&
        storage.biscuitShopStorageExample.requiredStoredAssets.includes("validation-report.json") &&
        storage.biscuitShopStorageExample.redacted === true,
      detail: `score ${storage.biscuitShopStorageExample.completenessScore}`,
    },
    {
      name: "Storage receipt shape present",
      passed:
        Boolean(storage.storageReceiptShape.storageId) &&
        Boolean(storage.storageReceiptShape.zipPath) &&
        Boolean(storage.storageReceiptShape.downloadPath) &&
        storage.storageReceiptShape.redacted === true,
      detail: "Storage receipt shape defined.",
    },
    {
      name: "Completeness checks present",
      passed: storage.persistentStorageCompletenessChecks.length >= 8,
      detail: `${storage.persistentStorageCompletenessChecks.length} checks`,
    },
    {
      name: "Integration sources present",
      passed:
        storage.integrationSources.realCustomerBundleExportStatus === "real_customer_website_app_bundle_export_ready" &&
        storage.integrationSources.generatedArtifactFileSystemWriterStatus === "generated_artifact_file_system_writer_ready" &&
        storage.integrationSources.artifactHistoryUiStatus === "artifact_history_ui_upgrade_ready" &&
        storage.integrationSources.projectDistributionPreviewCardsStatus === "project_distribution_preview_cards_ready",
      detail: "Export, file writer, history UI, and distribution preview linked.",
    },
  ];

  const passedChecks = checks.filter((check) => check.passed).length;

  return NextResponse.json({
    ok: checks.every((check) => check.passed),
    phase: "v24.8 Phase 268",
    service: "Persistent Artifact Storage Smoke Test",
    totalChecks: checks.length,
    passedChecks,
    failedChecks: checks.length - passedChecks,
    requiredAssetCount: storage.storageContract.requiredStoredAssets.length,
    requiredMetadataCount: storage.storageContract.requiredStoredMetadata.length,
    persistenceFlowStepCount: storage.persistenceFlow.length,
    retentionRuleCount: storage.retentionRules.length,
    safeStorageRuleCount: storage.safeStorageRules.length,
    storageCompletenessCheckCount: storage.persistentStorageCompletenessChecks.length,
    biscuitCustomerReady: storage.biscuitShopStorageExample.customerReady,
    biscuitScore: storage.biscuitShopStorageExample.completenessScore,
    checks,
  });
}
