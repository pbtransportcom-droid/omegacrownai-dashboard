import { NextResponse } from "next/server";
import { getProjectDistributionPreviewCards } from "@/lib/sovereign/project-distribution-preview-cards";

const requiredSections = [
  "Artifact Status",
  "Generated Layers",
  "Primary Actions",
  "Validation Evidence",
  "Distribution Readiness",
];

const requiredTruthRules = [
  "Do not call an artifact distribution-ready when customerReady is false.",
  "Do not hide homepage-only blocked artifacts.",
  "Show blocked reasons when validation fails.",
  "Show missing-info report before launch/distribution.",
  "Show validation score and status visibly.",
  "Show preview/download links only when paths exist.",
  "Label draft downloads clearly as draft_not_customer_ready.",
  "Preserve artifact history link for every generated artifact.",
  "Show backend/API and database/schema counts separately from frontend.",
];

export async function GET() {
  const cards = getProjectDistributionPreviewCards();

  const sectionNames = cards.cardSections.map((section) => section.section);
  const missingSections = requiredSections.filter((item) => !sectionNames.includes(item));
  const missingRules = requiredTruthRules.filter((item) => !cards.distributionTruthRules.includes(item));

  const blockedCard = cards.sampleDistributionCards.find((card) => card.statusBadge === "blocked");
  const readyCard = cards.sampleDistributionCards.find((card) => card.statusBadge === "customer_ready");

  const checks = [
    {
      name: "Project Distribution Preview Cards are ready",
      passed: cards.status === "project_distribution_preview_cards_ready",
      detail: cards.status,
    },
    {
      name: "Distribution route plan present",
      passed:
        cards.distributionRoutePlan.route === "/projects/[id]/company/distribution" &&
        cards.distributionRoutePlan.latestArtifactCard === true &&
        cards.distributionRoutePlan.artifactHistoryLink === "/projects/[id]/artifacts/history",
      detail: "Distribution route plan defined.",
    },
    {
      name: "Preview card shape present",
      passed:
        Boolean(cards.previewCardShape.artifactId) &&
        Boolean(cards.previewCardShape.customerReady) &&
        Boolean(cards.previewCardShape.completenessScore) &&
        Boolean(cards.previewCardShape.downloadPath) &&
        cards.previewCardShape.redacted === true,
      detail: "Preview card shape defined.",
    },
    {
      name: "Required card sections present",
      passed: missingSections.length === 0,
      detail: missingSections.length ? `Missing: ${missingSections.join(", ")}` : "All card sections present.",
    },
    {
      name: "Distribution truth rules present",
      passed: missingRules.length === 0,
      detail: missingRules.length ? `Missing: ${missingRules.join(", ")}` : "All truth rules present.",
    },
    {
      name: "Blocked homepage-only card is visible",
      passed:
        Boolean(blockedCard) &&
        blockedCard?.customerReady === false &&
        blockedCard?.completenessScore === 15 &&
        (blockedCard?.blockedReasons.length || 0) >= 2 &&
        blockedCard?.backendCount === 0 &&
        blockedCard?.databaseCount === 0,
      detail: "Blocked homepage-only card present.",
    },
    {
      name: "Customer-ready full-stack card is visible",
      passed:
        Boolean(readyCard) &&
        readyCard?.customerReady === true &&
        readyCard?.completenessScore === 100 &&
        (readyCard?.fileCount || 0) >= 22 &&
        (readyCard?.backendCount || 0) >= 3 &&
        (readyCard?.databaseCount || 0) >= 3 &&
        (readyCard?.adminCount || 0) >= 3,
      detail: "Customer-ready full-stack card present.",
    },
    {
      name: "Ready card has preview/download/history links",
      passed:
        Boolean(readyCard?.previewPath) &&
        Boolean(readyCard?.adminPreviewPath) &&
        Boolean(readyCard?.downloadPath) &&
        Boolean(readyCard?.historyPath) &&
        Boolean(readyCard?.validationReportPath) &&
        Boolean(readyCard?.missingInfoReportPath),
      detail: "Ready card links present.",
    },
    {
      name: "Visible distribution panel plan present",
      passed:
        cards.visibleDistributionPanelPlan.targetRoute === "/projects/[id]/company/distribution" &&
        cards.visibleDistributionPanelPlan.shouldShow.length >= 8,
      detail: `${cards.visibleDistributionPanelPlan.shouldShow.length} visible items`,
    },
    {
      name: "Completeness checks present",
      passed: cards.distributionPreviewCompletenessChecks.length >= 7,
      detail: `${cards.distributionPreviewCompletenessChecks.length} checks`,
    },
    {
      name: "Integration sources present",
      passed:
        cards.integrationSources.artifactHistoryUiStatus === "artifact_history_ui_upgrade_ready" &&
        cards.integrationSources.livePreviewArtifactRouteStatus === "live_preview_artifact_route_ready" &&
        cards.integrationSources.customerDownloadPackageRouteStatus === "customer_download_package_route_ready",
      detail: "History UI, preview, and download linked.",
    },
  ];

  const passedChecks = checks.filter((check) => check.passed).length;

  return NextResponse.json({
    ok: checks.every((check) => check.passed),
    phase: "v24.6 Phase 266",
    service: "Project Distribution Preview Cards Smoke Test",
    totalChecks: checks.length,
    passedChecks,
    failedChecks: checks.length - passedChecks,
    cardSectionCount: cards.cardSections.length,
    truthRuleCount: cards.distributionTruthRules.length,
    sampleCardCount: cards.sampleDistributionCards.length,
    visiblePanelItemCount: cards.visibleDistributionPanelPlan.shouldShow.length,
    completenessCheckCount: cards.distributionPreviewCompletenessChecks.length,
    checks,
  });
}
