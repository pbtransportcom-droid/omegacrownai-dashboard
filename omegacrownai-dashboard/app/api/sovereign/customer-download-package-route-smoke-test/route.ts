import { NextResponse } from "next/server";
import { getCustomerDownloadPackageRoute } from "@/lib/sovereign/customer-download-package-route";

const requiredFiles = [
  "README.md",
  "package.json",
  ".env.example",
  "deployment.md",
  "artifact-manifest.json",
  "validation-report.json",
  "missing-info-report.md",
  "app/page.tsx",
  "app/api/contact/route.ts",
  "app/api/orders/route.ts",
  "app/api/admin/submissions/route.ts",
  "app/admin/page.tsx",
];

const requiredExcludeRules = [
  "Do not include .env.",
  "Do not include real secrets.",
  "Do not include OAuth tokens.",
  "Do not include API keys.",
  "Do not include passwords.",
  "Do not include private keys.",
  "Do not include node_modules.",
  "Do not include .next build cache.",
];

const requiredChecks = [
  "Download route is defined.",
  "Package manifest includes source, reports, env example, deployment guide, backend, schema, admin, and preview files.",
  "Include rules cover full-stack artifact files.",
  "Exclude rules block secrets, node_modules, logs, and build cache.",
  "Validation gate labels customer-ready versus draft downloads.",
  "Response headers use attachment, no-store, and redacted artifact marker.",
  "Download record shape includes score, customerReady, reports, and redaction.",
  "Biscuit shop example includes full-stack downloadable package.",
];

export async function GET() {
  const download = getCustomerDownloadPackageRoute();

  const missingFiles = requiredFiles.filter(
    (file) => !download.downloadPackageManifest.requiredFiles.includes(file)
  );

  const missingExcludeRules = requiredExcludeRules.filter(
    (rule) => !download.downloadExcludeRules.includes(rule)
  );

  const missingChecks = requiredChecks.filter(
    (check) => !download.customerDownloadCompletenessChecks.includes(check)
  );

  const checks = [
    {
      name: "Customer Download Package Route is ready",
      passed: download.status === "customer_download_package_route_ready",
      detail: download.status,
    },
    {
      name: "Download route plan present",
      passed:
        download.routePlan.downloadRoute === "/api/projects/[projectId]/artifacts/[artifactId]/download" &&
        download.routePlan.method === "GET" &&
        download.routePlan.contentType === "application/zip",
      detail: "Download route plan defined.",
    },
    {
      name: "Required package files present",
      passed: missingFiles.length === 0,
      detail: missingFiles.length ? `Missing: ${missingFiles.join(", ")}` : "Core package files present.",
    },
    {
      name: "Download include rules present",
      passed: download.downloadIncludeRules.length >= 12,
      detail: `${download.downloadIncludeRules.length} include rules`,
    },
    {
      name: "Download exclude rules block unsafe files",
      passed: missingExcludeRules.length === 0,
      detail: missingExcludeRules.length
        ? `Missing: ${missingExcludeRules.join(", ")}`
        : "Unsafe files blocked.",
    },
    {
      name: "Validation before download present",
      passed:
        download.validationBeforeDownload.allowedDraftDownload === true &&
        download.validationBeforeDownload.customerReadyRequiresScore === 90 &&
        download.validationBeforeDownload.customerReadyRequiresAllLayers === true &&
        download.validationBeforeDownload.labels.includes("draft_not_customer_ready"),
      detail: download.validationBeforeDownload.rule,
    },
    {
      name: "Response headers plan present",
      passed:
        download.responseHeadersPlan["Content-Disposition"].includes("attachment") &&
        download.responseHeadersPlan["Cache-Control"] === "no-store" &&
        download.responseHeadersPlan["X-OmegaCrownAI-Redacted"] === "true",
      detail: "Download response headers defined.",
    },
    {
      name: "Download record shape present",
      passed:
        Boolean(download.downloadRecordShape.artifactId) &&
        Boolean(download.downloadRecordShape.customerReady) &&
        Boolean(download.downloadRecordShape.completenessScore) &&
        download.downloadRecordShape.redacted === true,
      detail: "Download record shape defined.",
    },
    {
      name: "Biscuit shop download package requires full-stack files",
      passed:
        download.biscuitShopDownloadExample.mustInclude.includes("contact API") &&
        download.biscuitShopDownloadExample.mustInclude.includes("order inquiry API") &&
        download.biscuitShopDownloadExample.mustInclude.includes("MenuItem schema") &&
        download.biscuitShopDownloadExample.mustInclude.includes("validation-report.json") &&
        download.biscuitShopDownloadExample.customerReadyRule.includes("draft_not_customer_ready"),
      detail: `${download.biscuitShopDownloadExample.mustInclude.length} biscuit package requirements`,
    },
    {
      name: "Customer download completeness checks present",
      passed: missingChecks.length === 0,
      detail: missingChecks.length ? `Missing: ${missingChecks.join(", ")}` : "All download checks present.",
    },
    {
      name: "Integration sources present",
      passed:
        download.integrationSources.generatedArtifactBundleWriterStatus === "generated_artifact_bundle_writer_ready" &&
        download.integrationSources.livePreviewArtifactRouteStatus === "live_preview_artifact_route_ready" &&
        download.integrationSources.projectArtifactHistoryStatus === "project_artifact_history_integration_ready" &&
        download.integrationSources.validationRunnerStatus === "website_full_function_validation_runner_ready",
      detail: "Bundle writer, preview, history, and validation linked.",
    },
  ];

  const passedChecks = checks.filter((check) => check.passed).length;

  return NextResponse.json({
    ok: checks.every((check) => check.passed),
    phase: "v24.0 Phase 260",
    service: "Customer Download Package Route Smoke Test",
    totalChecks: checks.length,
    passedChecks,
    failedChecks: checks.length - passedChecks,
    requiredPackageFileCount: download.downloadPackageManifest.requiredFiles.length,
    includeRuleCount: download.downloadIncludeRules.length,
    excludeRuleCount: download.downloadExcludeRules.length,
    draftDownloadAllowed: download.validationBeforeDownload.allowedDraftDownload,
    responseHeaderCount: Object.keys(download.responseHeadersPlan).length,
    biscuitShopMustIncludeCount: download.biscuitShopDownloadExample.mustInclude.length,
    customerDownloadCompletenessCheckCount: download.customerDownloadCompletenessChecks.length,
    checks,
  });
}
