import { NextResponse } from "next/server";
import { getArtifactHistoryUiUpgrade } from "@/lib/sovereign/artifact-history-ui-upgrade";

const requiredSections = [
  "Latest Artifact",
  "Artifact Versions",
  "Validation Evidence",
  "Reports",
  "Lineage",
  "Actions",
];

const requiredActionRules = [
  "Always show validation status.",
  "Show preview link when previewPath exists.",
  "Show admin preview link when adminPreviewPath exists.",
  "Show download link when downloadPath exists.",
  "Label downloads as draft_not_customer_ready when validation is blocked.",
  "Show validation report link for every artifact.",
  "Show missing-info report link for every artifact.",
  "Do not hide failed or draft artifacts.",
  "Do not mark homepage-only artifacts customer-ready.",
];

export async function GET() {
  const ui = getArtifactHistoryUiUpgrade();

  const sectionNames = ui.uiSections.map((section) => section.section);
  const missingSections = requiredSections.filter((item) => !sectionNames.includes(item));
  const missingActionRules = requiredActionRules.filter((item) => !ui.actionRules.includes(item));

  const blockedCard = ui.sampleArtifactCards.find((card) => card.statusBadge === "blocked");
  const readyCard = ui.sampleArtifactCards.find((card) => card.statusBadge === "customer_ready");

  const checks = [
    {
      name: "Artifact History UI Upgrade is ready",
      passed: ui.status === "artifact_history_ui_upgrade_ready",
      detail: ui.status,
    },
    {
      name: "Artifact history card shape present",
      passed:
        Boolean(ui.artifactHistoryCardShape.artifactId) &&
        Boolean(ui.artifactHistoryCardShape.completenessScore) &&
        Boolean(ui.artifactHistoryCardShape.previewPath) &&
        Boolean(ui.artifactHistoryCardShape.downloadPath) &&
        ui.artifactHistoryCardShape.redacted === true,
      detail: "History card shape defined.",
    },
    {
      name: "UI sections present",
      passed: missingSections.length === 0,
      detail: missingSections.length ? `Missing: ${missingSections.join(", ")}` : "All UI sections present.",
    },
    {
      name: "Status badge rules present",
      passed:
        ui.statusBadgeRules.length >= 3 &&
        ui.statusBadgeRules.some((rule) => rule.badge === "customer_ready") &&
        ui.statusBadgeRules.some((rule) => rule.badge === "draft") &&
        ui.statusBadgeRules.some((rule) => rule.badge === "blocked"),
      detail: `${ui.statusBadgeRules.length} badge rules`,
    },
    {
      name: "Action rules present",
      passed: missingActionRules.length === 0,
      detail: missingActionRules.length ? `Missing: ${missingActionRules.join(", ")}` : "All action rules present.",
    },
    {
      name: "Sample cards include blocked and customer-ready artifacts",
      passed:
        Boolean(blockedCard) &&
        Boolean(readyCard) &&
        blockedCard?.customerReady === false &&
        blockedCard?.completenessScore === 15 &&
        readyCard?.customerReady === true &&
        readyCard?.completenessScore === 100,
      detail: "Blocked and ready cards present.",
    },
    {
      name: "Blocked card explains homepage-only failure",
      passed:
        Boolean(blockedCard) &&
        (blockedCard?.blockedReasons.length || 0) > 0 &&
        (blockedCard?.missingLayers.length || 0) >= 8,
      detail: `${blockedCard?.missingLayers.length || 0} missing layers`,
    },
    {
      name: "Customer-ready card has preview/download/report links",
      passed:
        Boolean(readyCard) &&
        Boolean(readyCard?.previewPath) &&
        Boolean(readyCard?.adminPreviewPath) &&
        Boolean(readyCard?.downloadPath) &&
        Boolean(readyCard?.validationReportPath) &&
        Boolean(readyCard?.missingInfoReportPath),
      detail: "Ready artifact links present.",
    },
    {
      name: "Visible history page plan present",
      passed:
        ui.visibleHistoryPagePlan.route === "/projects/[id]/artifacts/history" &&
        ui.visibleHistoryPagePlan.sections.length >= 6,
      detail: ui.visibleHistoryPagePlan.route,
    },
    {
      name: "UI completeness checks present",
      passed: ui.uiCompletenessChecks.length >= 7,
      detail: `${ui.uiCompletenessChecks.length} UI checks`,
    },
    {
      name: "Integration sources present",
      passed:
        ui.integrationSources.projectArtifactHistoryStatus === "project_artifact_history_integration_ready" &&
        ui.integrationSources.fileSystemWriterStatus === "generated_artifact_file_system_writer_ready" &&
        ui.integrationSources.livePreviewArtifactRouteStatus === "live_preview_artifact_route_ready" &&
        ui.integrationSources.customerDownloadPackageRouteStatus === "customer_download_package_route_ready",
      detail: "History, file writer, preview, and download linked.",
    },
  ];

  const passedChecks = checks.filter((check) => check.passed).length;

  return NextResponse.json({
    ok: checks.every((check) => check.passed),
    phase: "v24.5 Phase 265",
    service: "Artifact History UI Upgrade Smoke Test",
    totalChecks: checks.length,
    passedChecks,
    failedChecks: checks.length - passedChecks,
    uiSectionCount: ui.uiSections.length,
    badgeRuleCount: ui.statusBadgeRules.length,
    actionRuleCount: ui.actionRules.length,
    sampleCardCount: ui.sampleArtifactCards.length,
    uiCompletenessCheckCount: ui.uiCompletenessChecks.length,
    checks,
  });
}
