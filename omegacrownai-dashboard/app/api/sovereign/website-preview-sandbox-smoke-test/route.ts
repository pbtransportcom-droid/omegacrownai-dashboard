import { NextResponse } from "next/server";
import { getWebsitePreviewSandbox } from "@/lib/sovereign/website-preview-sandbox";

const requiredCoverage = [
  "Frontend Preview",
  "Backend/API Preview",
  "Database/Data Preview",
  "Admin Preview",
  "Validation Preview",
  "Export Preview",
];

const requiredFiles = [
  "app/preview/[artifactId]/page.tsx",
  "app/preview/[artifactId]/admin/page.tsx",
  "app/preview/[artifactId]/download/route.ts",
  "components/preview/PreviewBanner.tsx",
  "components/preview/PreviewValidationPanel.tsx",
  "components/preview/PreviewMissingInfoPanel.tsx",
  "lib/generated/preview-data.ts",
  "lib/generated/preview-store.ts",
];

const requiredChecks = [
  "Preview route exists.",
  "Admin preview route exists.",
  "Preview banner labels sandbox/demo mode.",
  "Generated forms connect to preview backend handlers or safe adapters.",
  "Admin preview can review demo submissions.",
  "Missing-info panel is visible.",
  "Validation panel is visible.",
  "Download/export preview route exists.",
  "No secrets are exposed in preview.",
];

export async function GET() {
  const preview = getWebsitePreviewSandbox();

  const coverageNames = preview.requiredPreviewCoverage.map((item) => item.area);
  const missingCoverage = requiredCoverage.filter((item) => !coverageNames.includes(item));
  const missingFiles = requiredFiles.filter((item) => !preview.generatedPreviewFileManifest.includes(item));
  const missingChecks = requiredChecks.filter((item) => !preview.previewCompletenessChecks.includes(item));

  const checks = [
    {
      name: "Website Preview Sandbox is ready",
      passed: preview.status === "website_preview_sandbox_ready",
      detail: preview.status,
    },
    {
      name: "Preview route plan present",
      passed:
        preview.previewRoutePlan.routePattern === "/preview/[artifactId]" &&
        preview.previewRoutePlan.adminRoutePattern === "/preview/[artifactId]/admin" &&
        preview.previewRoutePlan.downloadRoutePattern === "/preview/[artifactId]/download",
      detail: "Preview route plan defined.",
    },
    {
      name: "Required preview coverage present",
      passed: missingCoverage.length === 0,
      detail: missingCoverage.length ? `Missing: ${missingCoverage.join(", ")}` : "All coverage present.",
    },
    {
      name: "Preview mode rules present",
      passed: preview.previewModeRules.length >= 8,
      detail: `${preview.previewModeRules.length} preview mode rules`,
    },
    {
      name: "Sandbox isolation rules present",
      passed: preview.sandboxIsolationRules.length >= 6,
      detail: `${preview.sandboxIsolationRules.length} isolation rules`,
    },
    {
      name: "Generated preview file manifest present",
      passed: missingFiles.length === 0,
      detail: missingFiles.length ? `Missing: ${missingFiles.join(", ")}` : "Core preview files present.",
    },
    {
      name: "Preview validation gate present",
      passed:
        preview.previewValidationGate.minimumCustomerReadyScore === 90 &&
        preview.previewValidationGate.requiredPreviewChecks.length >= 8 &&
        preview.previewValidationGate.customerReadyRule.includes("Do not mark generated artifact customer-ready"),
      detail: `${preview.previewValidationGate.requiredPreviewChecks.length} gate checks`,
    },
    {
      name: "Biscuit shop preview requires public/admin/demo/export coverage",
      passed:
        preview.biscuitShopPreviewExample.publicPreview.length >= 5 &&
        preview.biscuitShopPreviewExample.adminPreview.length >= 5 &&
        preview.biscuitShopPreviewExample.demoData.length >= 5 &&
        preview.biscuitShopPreviewExample.customerReadyRule.includes("not customer-ready"),
      detail: "Biscuit shop preview coverage defined.",
    },
    {
      name: "Preview completeness checks present",
      passed: missingChecks.length === 0,
      detail: missingChecks.length ? `Missing: ${missingChecks.join(", ")}` : "All preview checks present.",
    },
    {
      name: "Runtime/backend/database/admin integration present",
      passed:
        preview.integrationSources.fullStackRuntimeStatus === "full_stack_builder_runtime_foundation_ready" &&
        preview.integrationSources.backendGeneratorStatus === "website_backend_api_generator_ready" &&
        preview.integrationSources.databaseGeneratorStatus === "website_database_schema_generator_ready" &&
        preview.integrationSources.adminGeneratorStatus === "website_admin_panel_generator_ready" &&
        preview.integrationSources.minimumCustomerReadyScore === 90,
      detail: "Runtime, backend, database, and admin linked.",
    },
  ];

  const passedChecks = checks.filter((check) => check.passed).length;

  return NextResponse.json({
    ok: checks.every((check) => check.passed),
    phase: "v23.4 Phase 254",
    service: "Website Preview Sandbox Smoke Test",
    totalChecks: checks.length,
    passedChecks,
    failedChecks: checks.length - passedChecks,
    previewCoverageCount: preview.requiredPreviewCoverage.length,
    previewModeRuleCount: preview.previewModeRules.length,
    sandboxIsolationRuleCount: preview.sandboxIsolationRules.length,
    previewManifestFileCount: preview.generatedPreviewFileManifest.length,
    validationGateCheckCount: preview.previewValidationGate.requiredPreviewChecks.length,
    previewCompletenessCheckCount: preview.previewCompletenessChecks.length,
    checks,
  });
}
