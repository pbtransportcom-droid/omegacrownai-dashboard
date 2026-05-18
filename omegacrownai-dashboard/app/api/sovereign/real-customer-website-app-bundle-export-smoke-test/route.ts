import { NextResponse } from "next/server";
import { getRealCustomerWebsiteAppBundleExport } from "@/lib/sovereign/real-customer-website-app-bundle-export";

const requiredReports = [
  "README.md",
  "artifact-manifest.json",
  "validation-report.json",
  "missing-info-report.md",
  "deployment.md",
];

const requiredLayers = [
  "frontend",
  "backend_api",
  "database_schema",
  "admin_review",
  "preview_sandbox",
  "deploy_export",
];

const requiredSafetyRules = [
  "Never export .env.",
  "Never export raw secrets, tokens, API keys, passwords, or private keys.",
  "Never export node_modules.",
  "Never export .next build cache.",
  "Never export server or PM2 logs.",
  "Always include .env.example instead of real environment values.",
  "Always include validation-report.json.",
  "Always include missing-info-report.md.",
  "Always label draft exports honestly.",
];

export async function GET() {
  const exportLayer = getRealCustomerWebsiteAppBundleExport();

  const missingReports = requiredReports.filter(
    (item) => !exportLayer.exportPackageContract.requiredReports.includes(item)
  );

  const missingLayers = requiredLayers.filter(
    (item) => !exportLayer.exportPackageContract.requiredSourceLayers.includes(item)
  );

  const missingSafetyRules = requiredSafetyRules.filter(
    (item) => !exportLayer.exportSafetyRules.includes(item)
  );

  const labels = exportLayer.exportLabels.map((item) => item.label);

  const checks = [
    {
      name: "Real Customer Website/App Bundle Export is ready",
      passed: exportLayer.status === "real_customer_website_app_bundle_export_ready",
      detail: exportLayer.status,
    },
    {
      name: "Export package contract includes reports and layers",
      passed: missingReports.length === 0 && missingLayers.length === 0,
      detail:
        missingReports.length || missingLayers.length
          ? `Missing reports: ${missingReports.join(", ")}; missing layers: ${missingLayers.join(", ")}`
          : "Reports and layers present.",
    },
    {
      name: "Export labels present",
      passed:
        labels.includes("customer_ready_full_function_artifact") &&
        labels.includes("draft_not_customer_ready") &&
        labels.includes("blocked_missing_required_functionality"),
      detail: `${labels.length} labels`,
    },
    {
      name: "Export flow present",
      passed: exportLayer.exportFlow.length >= 12,
      detail: `${exportLayer.exportFlow.length} export steps`,
    },
    {
      name: "Customer export receipt shape present",
      passed:
        Boolean(exportLayer.customerExportReceiptShape.exportId) &&
        Boolean(exportLayer.customerExportReceiptShape.packageFilename) &&
        Boolean(exportLayer.customerExportReceiptShape.exportLabel) &&
        Boolean(exportLayer.customerExportReceiptShape.downloadPath) &&
        exportLayer.customerExportReceiptShape.redacted === true,
      detail: "Receipt shape defined.",
    },
    {
      name: "Biscuit shop export is customer-ready",
      passed:
        exportLayer.biscuitShopExportExample.customerReady === true &&
        exportLayer.biscuitShopExportExample.completenessScore === 100 &&
        exportLayer.biscuitShopExportExample.fileCount >= 22 &&
        exportLayer.biscuitShopExportExample.exportLabel === "customer_ready_full_function_artifact",
      detail: `score ${exportLayer.biscuitShopExportExample.completenessScore}`,
    },
    {
      name: "Biscuit shop export has preview/download/history/distribution paths",
      passed:
        Boolean(exportLayer.biscuitShopExportExample.previewPath) &&
        Boolean(exportLayer.biscuitShopExportExample.adminPreviewPath) &&
        Boolean(exportLayer.biscuitShopExportExample.downloadPath) &&
        Boolean(exportLayer.biscuitShopExportExample.historyPath) &&
        Boolean(exportLayer.biscuitShopExportExample.distributionPath),
      detail: "Biscuit shop export paths present.",
    },
    {
      name: "Export safety rules present",
      passed: missingSafetyRules.length === 0,
      detail: missingSafetyRules.length ? `Missing: ${missingSafetyRules.join(", ")}` : "All safety rules present.",
    },
    {
      name: "Export completeness checks present",
      passed: exportLayer.exportCompletenessChecks.length >= 7,
      detail: `${exportLayer.exportCompletenessChecks.length} checks`,
    },
    {
      name: "Integration sources present",
      passed:
        exportLayer.integrationSources.projectDistributionPreviewCardsStatus === "project_distribution_preview_cards_ready" &&
        exportLayer.integrationSources.generatedArtifactFileSystemWriterStatus === "generated_artifact_file_system_writer_ready" &&
        exportLayer.integrationSources.downloadZipWriterStatus === "download_zip_writer_implementation_ready",
      detail: "Distribution, file writer, and ZIP writer linked.",
    },
  ];

  const passedChecks = checks.filter((check) => check.passed).length;

  return NextResponse.json({
    ok: checks.every((check) => check.passed),
    phase: "v24.7 Phase 267",
    service: "Real Customer Website/App Bundle Export Smoke Test",
    totalChecks: checks.length,
    passedChecks,
    failedChecks: checks.length - passedChecks,
    exportLabelCount: exportLayer.exportLabels.length,
    exportFlowStepCount: exportLayer.exportFlow.length,
    requiredReportCount: exportLayer.exportPackageContract.requiredReports.length,
    requiredLayerCount: exportLayer.exportPackageContract.requiredSourceLayers.length,
    safetyRuleCount: exportLayer.exportSafetyRules.length,
    biscuitFileCount: exportLayer.biscuitShopExportExample.fileCount,
    biscuitScore: exportLayer.biscuitShopExportExample.completenessScore,
    biscuitCustomerReady: exportLayer.biscuitShopExportExample.customerReady,
    exportCompletenessCheckCount: exportLayer.exportCompletenessChecks.length,
    checks,
  });
}
