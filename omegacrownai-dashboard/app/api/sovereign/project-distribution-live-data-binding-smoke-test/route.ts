import { NextResponse } from "next/server";
import { getProjectDistributionLiveDataBinding } from "@/lib/sovereign/project-distribution-live-data-binding";

const requiredBoundFields = [
  "projectId",
  "latestArtifact",
  "artifactTimeline",
  "customerReady",
  "completenessScore",
  "statusBadge",
  "previewPath",
  "adminPreviewPath",
  "downloadPath",
  "historyPath",
  "distributionPath",
  "validationReportPath",
  "missingInfoReportPath",
  "blockedReasons",
];

const requiredBindingRules = [
  "Distribution page must bind to projectId.",
  "Latest artifact card must come from generated artifact data.",
  "Customer-ready status must come from validation result.",
  "Completeness score must be visible.",
  "Preview link must use generated preview path.",
  "Download link must use generated customer download path.",
  "History link must use project artifact history path.",
  "Blocked artifacts must remain visible.",
  "Homepage-only artifacts must stay blocked.",
  "Do not show customer-ready distribution actions when validation fails.",
  "Do not expose secrets or raw environment values.",
];

export async function GET() {
  const binding = getProjectDistributionLiveDataBinding("cmoyy1gl700004mkqn7or7hxr");

  const missingBoundFields = requiredBoundFields.filter(
    (field) => !binding.distributionLiveDataContract.requiredBoundFields.includes(field)
  );

  const missingBindingRules = requiredBindingRules.filter(
    (rule) => !binding.distributionBindingRules.includes(rule)
  );

  const blockedDraft = binding.artifactTimeline.find(
    (artifact) => artifact.statusBadge === "blocked"
  );

  const customerReady = binding.artifactTimeline.find(
    (artifact) => artifact.statusBadge === "customer_ready"
  );

  const checks = [
    {
      name: "Project Distribution Live Data Binding is ready",
      passed: binding.status === "project_distribution_live_data_binding_ready",
      detail: binding.status,
    },
    {
      name: "Live data contract contains required bound fields",
      passed: missingBoundFields.length === 0,
      detail: missingBoundFields.length ? `Missing: ${missingBoundFields.join(", ")}` : "Bound fields present.",
    },
    {
      name: "Live binding flow present",
      passed: binding.liveBindingFlow.length >= 10,
      detail: `${binding.liveBindingFlow.length} flow steps`,
    },
    {
      name: "Latest artifact card is full-stack and customer-ready",
      passed:
        binding.latestArtifactCard.customerReady === true &&
        binding.latestArtifactCard.completenessScore === 100 &&
        binding.latestArtifactCard.fileCount >= 22 &&
        binding.latestArtifactCard.backendCount >= 3 &&
        binding.latestArtifactCard.databaseCount >= 3 &&
        binding.latestArtifactCard.adminCount >= 3,
      detail: `score ${binding.latestArtifactCard.completenessScore}`,
    },
    {
      name: "Latest artifact has live paths",
      passed:
        Boolean(binding.latestArtifactCard.previewPath) &&
        Boolean(binding.latestArtifactCard.adminPreviewPath) &&
        Boolean(binding.latestArtifactCard.downloadPath) &&
        Boolean(binding.latestArtifactCard.historyPath) &&
        Boolean(binding.latestArtifactCard.distributionPath),
      detail: "Latest artifact paths present.",
    },
    {
      name: "Timeline includes blocked draft and customer-ready artifact",
      passed:
        Boolean(blockedDraft) &&
        Boolean(customerReady) &&
        blockedDraft?.customerReady === false &&
        blockedDraft?.completenessScore === 15 &&
        customerReady?.customerReady === true &&
        customerReady?.completenessScore === 100,
      detail: `${binding.artifactTimeline.length} timeline items`,
    },
    {
      name: "Distribution binding rules present",
      passed: missingBindingRules.length === 0,
      detail: missingBindingRules.length ? `Missing: ${missingBindingRules.join(", ")}` : "Binding rules present.",
    },
    {
      name: "Live distribution UI sections present",
      passed: binding.liveDistributionUiSections.length >= 7,
      detail: `${binding.liveDistributionUiSections.length} UI sections`,
    },
    {
      name: "Biscuit shop live binding example present",
      passed:
        binding.biscuitShopLiveBindingExample.latestCustomerReady === true &&
        binding.biscuitShopLiveBindingExample.latestScore === 100 &&
        binding.biscuitShopLiveBindingExample.timelineCount === 2 &&
        binding.biscuitShopLiveBindingExample.expectedVisibleActions.length >= 6,
      detail: "Biscuit shop live binding example passes.",
    },
    {
      name: "Completeness checks present",
      passed: binding.liveBindingCompletenessChecks.length >= 7,
      detail: `${binding.liveBindingCompletenessChecks.length} checks`,
    },
    {
      name: "Integration sources present",
      passed:
        binding.integrationSources.productionArtifactWriterIntegrationStatus === "production_artifact_writer_integration_ready" &&
        binding.integrationSources.projectDistributionPreviewCardsStatus === "project_distribution_preview_cards_ready" &&
        binding.integrationSources.persistentArtifactStorageStatus === "persistent_artifact_storage_ready" &&
        binding.integrationSources.artifactHistoryUiStatus === "artifact_history_ui_upgrade_ready",
      detail: "Production writer, preview cards, storage, and history linked.",
    },
  ];

  const passedChecks = checks.filter((check) => check.passed).length;

  return NextResponse.json({
    ok: checks.every((check) => check.passed),
    phase: "v25.1 Phase 271",
    service: "Project Distribution Live Data Binding Smoke Test",
    totalChecks: checks.length,
    passedChecks,
    failedChecks: checks.length - passedChecks,
    boundFieldCount: binding.distributionLiveDataContract.requiredBoundFields.length,
    bindingFlowStepCount: binding.liveBindingFlow.length,
    timelineCount: binding.artifactTimeline.length,
    bindingRuleCount: binding.distributionBindingRules.length,
    uiSectionCount: binding.liveDistributionUiSections.length,
    visibleActionCount: binding.biscuitShopLiveBindingExample.expectedVisibleActions.length,
    latestScore: binding.latestArtifactCard.completenessScore,
    latestCustomerReady: binding.latestArtifactCard.customerReady,
    checks,
  });
}
