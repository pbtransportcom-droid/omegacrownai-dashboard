import { NextResponse } from "next/server";
import { getBuilderUiFullFunctionOutputPanel } from "@/lib/sovereign/builder-ui-full-function-output-panel";

const requiredSections = [
  "Customer-Ready Score",
  "Generated Layer Counts",
  "Preview and Download Actions",
  "Validation Report",
  "Missing Information Report",
  "Homepage-Only Block Warning",
];

const requiredUiRules = [
  "Show customer-ready status honestly.",
  "Show score out of 100.",
  "Show backend/API count separately from frontend count.",
  "Show database/schema count separately.",
  "Show admin/review count separately.",
  "Show preview and download links when present.",
  "Show missing business inputs before launch.",
  "Block or label homepage-only output as draft_not_customer_ready.",
  "Do not claim full production readiness when validation fails.",
  "Do not hide missing required functionality.",
];

export async function GET() {
  const panel = getBuilderUiFullFunctionOutputPanel();

  const sectionNames = panel.panelSections.map((item) => item.section);
  const missingSections = requiredSections.filter((item) => !sectionNames.includes(item));

  const missingRules = requiredUiRules.filter((item) => !panel.uiRules.includes(item));

  const example = panel.biscuitShopPanelExample;

  const checks = [
    {
      name: "Builder UI Full-Function Output Panel is ready",
      passed: panel.status === "builder_ui_full_function_output_panel_ready",
      detail: panel.status,
    },
    {
      name: "Required panel sections present",
      passed: missingSections.length === 0,
      detail: missingSections.length ? `Missing: ${missingSections.join(", ")}` : "All panel sections present.",
    },
    {
      name: "Output panel data shape present",
      passed:
        Boolean(panel.outputPanelDataShape.artifactId) &&
        Boolean(panel.outputPanelDataShape.customerReady) &&
        Boolean(panel.outputPanelDataShape.completenessScore) &&
        Boolean(panel.outputPanelDataShape.downloadPath),
      detail: "Output panel data shape defined.",
    },
    {
      name: "UI truth rules present",
      passed: missingRules.length === 0,
      detail: missingRules.length ? `Missing: ${missingRules.join(", ")}` : "All UI truth rules present.",
    },
    {
      name: "Biscuit shop panel example is full-stack",
      passed:
        example.customerReady === true &&
        example.completenessScore === 100 &&
        example.fileCount >= 22 &&
        example.frontendCount >= 4 &&
        example.backendCount >= 3 &&
        example.databaseCount >= 3 &&
        example.adminCount >= 3 &&
        example.previewCount >= 3 &&
        example.deployCount >= 6,
      detail: `${example.fileCount} files, score ${example.completenessScore}`,
    },
    {
      name: "Preview and download paths present",
      passed:
        example.previewPath.includes("/projects/") &&
        example.downloadPath.includes("/api/projects/") &&
        example.adminPreviewPath.includes("/preview/"),
      detail: "Preview/download/admin preview paths present.",
    },
    {
      name: "Missing business inputs are visible",
      passed: example.missingBusinessInputCount >= 6,
      detail: `${example.missingBusinessInputCount} missing business inputs`,
    },
    {
      name: "Homepage-only warning is blocked",
      passed:
        panel.homepageOnlyBlockedExample.customerReady === false &&
        panel.homepageOnlyBlockedExample.completenessScore === 15 &&
        panel.homepageOnlyBlockedExample.blockedReason.includes("Homepage-only output is not customer-ready"),
      detail: panel.homepageOnlyBlockedExample.blockedReason,
    },
    {
      name: "Integration sources present",
      passed:
        panel.integrationSources.livePreviewArtifactRouteStatus === "live_preview_artifact_route_ready" &&
        panel.integrationSources.customerDownloadPackageRouteStatus === "customer_download_package_route_ready",
      detail: "Preview and download linked.",
    },
  ];

  const passedChecks = checks.filter((check) => check.passed).length;

  return NextResponse.json({
    ok: checks.every((check) => check.passed),
    phase: "v24.2 Phase 262",
    service: "Builder UI Full-Function Output Panel Smoke Test",
    totalChecks: checks.length,
    passedChecks,
    failedChecks: checks.length - passedChecks,
    panelSectionCount: panel.panelSections.length,
    uiRuleCount: panel.uiRules.length,
    biscuitFileCount: example.fileCount,
    biscuitScore: example.completenessScore,
    biscuitCustomerReady: example.customerReady,
    missingBusinessInputCount: example.missingBusinessInputCount,
    homepageOnlyCustomerReady: panel.homepageOnlyBlockedExample.customerReady,
    checks,
  });
}
