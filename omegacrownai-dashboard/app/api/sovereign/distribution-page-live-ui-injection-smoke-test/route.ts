import { NextResponse } from "next/server";
import { getDistributionPageLiveUiInjection } from "@/lib/sovereign/distribution-page-live-ui-injection";

const requiredRules = [
  "Show latest artifact customer-ready status.",
  "Show completeness score visibly.",
  "Show backend/API, database/schema, admin, preview, and deploy counts separately.",
  "Show preview link when previewPath exists.",
  "Show admin preview link when adminPreviewPath exists.",
  "Show download link when downloadPath exists.",
  "Show artifact history link.",
  "Show validation report and missing-info report names.",
  "Show blocked homepage-only warning.",
  "Do not show customer-ready badge when validation fails.",
  "Do not expose secrets or raw environment values.",
];

export async function GET() {
  const injection = getDistributionPageLiveUiInjection("cmoyy1gl700004mkqn7or7hxr");

  const missingRules = requiredRules.filter(
    (rule) => !injection.uiInjectionRules.includes(rule)
  );

  const checks = [
    {
      name: "Distribution Page Live UI Injection is ready",
      passed: injection.status === "distribution_page_live_ui_injection_ready",
      detail: injection.status,
    },
    {
      name: "Target page is defined",
      passed:
        injection.targetPage.route === "/projects/[id]/company/distribution" &&
        injection.targetPage.injectionComponent === "DistributionLiveArtifactPanel",
      detail: injection.targetPage.sampleRoute,
    },
    {
      name: "Injected panel sections present",
      passed: injection.injectedPanelSections.length >= 7,
      detail: `${injection.injectedPanelSections.length} sections`,
    },
    {
      name: "Latest artifact view model is customer-ready",
      passed:
        injection.latestArtifactViewModel.customerReady === true &&
        injection.latestArtifactViewModel.completenessScore === 100 &&
        injection.latestArtifactViewModel.fileCount >= 22 &&
        injection.latestArtifactViewModel.backendCount >= 3 &&
        injection.latestArtifactViewModel.databaseCount >= 3 &&
        injection.latestArtifactViewModel.adminCount >= 3,
      detail: `score ${injection.latestArtifactViewModel.completenessScore}`,
    },
    {
      name: "Latest artifact action links present",
      passed:
        Boolean(injection.latestArtifactViewModel.previewPath) &&
        Boolean(injection.latestArtifactViewModel.adminPreviewPath) &&
        Boolean(injection.latestArtifactViewModel.downloadPath) &&
        Boolean(injection.latestArtifactViewModel.historyPath),
      detail: "Preview/admin/download/history links present.",
    },
    {
      name: "Blocked draft warning visible",
      passed:
        injection.blockedDraftWarning.visible === true &&
        injection.blockedDraftWarning.customerReady === false &&
        injection.blockedDraftWarning.blockedScore === 15,
      detail: injection.blockedDraftWarning.title,
    },
    {
      name: "UI injection rules present",
      passed: missingRules.length === 0,
      detail: missingRules.length ? `Missing: ${missingRules.join(", ")}` : "All UI rules present.",
    },
    {
      name: "Visible proof requirements present",
      passed: injection.visibleProofRequirements.length >= 6,
      detail: `${injection.visibleProofRequirements.length} visible proof requirements`,
    },
    {
      name: "Completeness checks present",
      passed: injection.injectionCompletenessChecks.length >= 7,
      detail: `${injection.injectionCompletenessChecks.length} checks`,
    },
    {
      name: "Integration sources present",
      passed:
        injection.integrationSources.projectDistributionLiveDataBindingStatus === "project_distribution_live_data_binding_ready" &&
        injection.integrationSources.productionArtifactWriterExecutionRouteStatus === "production_artifact_writer_execution_route_ready",
      detail: "Live data binding and production execution linked.",
    },
  ];

  const passedChecks = checks.filter((check) => check.passed).length;

  return NextResponse.json({
    ok: checks.every((check) => check.passed),
    phase: "v25.6 Phase 276",
    service: "Distribution Page Live UI Injection Smoke Test",
    totalChecks: checks.length,
    passedChecks,
    failedChecks: checks.length - passedChecks,
    injectedPanelSectionCount: injection.injectedPanelSections.length,
    actionLinkCount: injection.injectedActionLinks.length,
    uiInjectionRuleCount: injection.uiInjectionRules.length,
    visibleProofRequirementCount: injection.visibleProofRequirements.length,
    completenessCheckCount: injection.injectionCompletenessChecks.length,
    latestScore: injection.latestArtifactViewModel.completenessScore,
    latestCustomerReady: injection.latestArtifactViewModel.customerReady,
    checks,
  });
}
