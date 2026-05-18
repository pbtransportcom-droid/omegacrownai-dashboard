import { getProjectDistributionLiveDataBinding } from "@/lib/sovereign/project-distribution-live-data-binding";
import { getProductionArtifactWriterExecutionRoute } from "@/lib/sovereign/production-artifact-writer-execution-route";

export function getDistributionPageLiveUiInjection(projectId = "cmoyy1gl700004mkqn7or7hxr") {
  const binding = getProjectDistributionLiveDataBinding(projectId);
  const execution = getProductionArtifactWriterExecutionRoute();

  return {
    system: "OmegaCrownAI Distribution Page Live UI Injection",
    phase: "v25.6 Phase 276",
    status: "distribution_page_live_ui_injection_ready",
    projectId,
    purpose:
      "Inject a visible live artifact panel into the project distribution page so users can see the latest generated artifact, customer-ready score, validation truth, preview/download/history actions, and blocked draft warnings.",
    corePrinciple:
      "The distribution page must display real artifact readiness data, not marketing claims. If an artifact is draft or blocked, the UI must say so clearly.",

    targetPage: {
      route: "/projects/[id]/company/distribution",
      sampleRoute: `/projects/${projectId}/company/distribution`,
      injectionComponent: "DistributionLiveArtifactPanel",
      apiRoute:
        "/api/sovereign/project-distribution-live-data-binding?projectId={projectId}",
    },

    injectedPanelSections: [
      "Latest artifact readiness card",
      "Customer-ready score",
      "Generated layer counts",
      "Preview/admin preview/download/history actions",
      "Validation and missing-info report links",
      "Blocked homepage-only warning",
      "Production writer execution status",
    ],

    injectedActionLinks: [
      binding.latestArtifactCard.previewPath,
      binding.latestArtifactCard.adminPreviewPath,
      binding.latestArtifactCard.downloadPath,
      binding.latestArtifactCard.historyPath,
      binding.latestArtifactCard.distributionPath,
    ],

    latestArtifactViewModel: {
      artifactId: binding.latestArtifactCard.artifactId,
      title: binding.latestArtifactCard.title,
      customerReady: binding.latestArtifactCard.customerReady,
      completenessScore: binding.latestArtifactCard.completenessScore,
      statusBadge: binding.latestArtifactCard.statusBadge,
      validationStatus: binding.latestArtifactCard.validationStatus,
      fileCount: binding.latestArtifactCard.fileCount,
      frontendCount: binding.latestArtifactCard.frontendCount,
      backendCount: binding.latestArtifactCard.backendCount,
      databaseCount: binding.latestArtifactCard.databaseCount,
      adminCount: binding.latestArtifactCard.adminCount,
      previewCount: binding.latestArtifactCard.previewCount,
      deployCount: binding.latestArtifactCard.deployCount,
      previewPath: binding.latestArtifactCard.previewPath,
      adminPreviewPath: binding.latestArtifactCard.adminPreviewPath,
      downloadPath: binding.latestArtifactCard.downloadPath,
      historyPath: binding.latestArtifactCard.historyPath,
      validationReportPath: binding.latestArtifactCard.validationReportPath,
      missingInfoReportPath: binding.latestArtifactCard.missingInfoReportPath,
      redacted: true,
    },

    blockedDraftWarning: {
      visible: true,
      title: "Homepage-only output remains blocked",
      reason:
        "A homepage-only artifact cannot be marked customer-ready because it lacks backend/API, database/schema, admin review, preview, deploy package, validation report, and missing-info report.",
      blockedScore: 15,
      customerReady: false,
    },

    uiInjectionRules: [
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
    ],

    visibleProofRequirements: [
      "Distribution page route returns HTTP 200.",
      "Page contains Full-Function Artifact Live Status text.",
      "Page contains customer-ready score text.",
      "Page contains Preview, Admin Preview, Download ZIP, and Artifact History actions.",
      "Page contains homepage-only blocked warning text.",
      "Smoke test confirms latest artifact score is 100 and customerReady is true.",
    ],

    injectionCompletenessChecks: [
      "Injection target route is defined.",
      "Injected panel sections cover artifact status, score, layers, actions, reports, warning, and execution status.",
      "Latest artifact view model includes score, status, layer counts, links, reports, and redaction.",
      "Blocked draft warning is visible.",
      "UI injection rules prevent false customer-ready claims.",
      "Visible proof requirements verify the distribution page renders the panel.",
      "Integration sources confirm live data binding and production execution route are ready.",
    ],

    integrationSources: {
      projectDistributionLiveDataBindingStatus: binding.status,
      productionArtifactWriterExecutionRouteStatus: execution.status,
    },

    nextImplementationPhases: [
      "Customer Export Audit Persistence",
      "Artifact Storage Database Write API",
      "Rebuild/Rollback Persistence Integration",
      "Full-Function Customer Artifact Release Gate",
      "Production Website/App Generator File Writer",
    ],
  };
}
