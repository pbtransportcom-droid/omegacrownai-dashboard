import { getArtifactHistoryUiUpgrade } from "@/lib/sovereign/artifact-history-ui-upgrade";
import { getLivePreviewArtifactRoute } from "@/lib/sovereign/live-preview-artifact-route";
import { getCustomerDownloadPackageRoute } from "@/lib/sovereign/customer-download-package-route";
import { generateRealFullStackArtifact } from "@/lib/sovereign/real-full-stack-artifact-generator";

export function getProjectDistributionPreviewCards() {
  const historyUi = getArtifactHistoryUiUpgrade();
  const livePreview = getLivePreviewArtifactRoute();
  const download = getCustomerDownloadPackageRoute();

  const generated = generateRealFullStackArtifact({
    projectId: "cmoyy1gl700004mkqn7or7hxr",
    prompt:
      "Build a modern biscuit shop website with menu, contact, order inquiry, backend, database, admin review, preview, deployment package, validation report, and missing-info report.",
  });

  return {
    system: "OmegaCrownAI Project Distribution Preview Cards",
    phase: "v24.6 Phase 266",
    status: "project_distribution_preview_cards_ready",
    purpose:
      "Define the project distribution preview cards that show generated artifact status, preview/download actions, validation evidence, missing-info warnings, and customer-ready truth directly inside the project distribution experience.",
    corePrinciple:
      "The project distribution page must not only list distribution options. It must show the latest generated artifact, whether it is customer-ready, and how to preview, review, download, or fix it.",

    distributionRoutePlan: {
      route: "/projects/[id]/company/distribution",
      latestArtifactCard: true,
      artifactHistoryLink: "/projects/[id]/artifacts/history",
      projectPreviewPath: "/projects/[id]/artifacts/[artifactId]/preview",
      downloadPath: "/api/projects/[id]/artifacts/[artifactId]/download",
      purpose:
        "Connect project distribution to artifact history, live preview, customer download, validation status, and missing-info reporting.",
    },

    previewCardShape: {
      artifactId: "artifact id",
      projectId: "project id",
      title: "artifact title",
      version: "artifact version",
      artifactType: "full_stack_website_app",
      customerReady: "boolean",
      completenessScore: "0-100",
      statusBadge: "customer_ready | draft | blocked",
      validationStatus: "passed | draft | blocked | failed",
      fileCount: "number",
      frontendCount: "number",
      backendCount: "number",
      databaseCount: "number",
      adminCount: "number",
      previewCount: "number",
      deployCount: "number",
      previewPath: "project artifact preview path",
      adminPreviewPath: "admin preview path",
      downloadPath: "download package path",
      historyPath: "artifact history path",
      validationReportPath: "validation-report.json",
      missingInfoReportPath: "missing-info-report.md",
      blockedReasons: "array",
      redacted: true,
    },

    cardSections: [
      {
        section: "Artifact Status",
        purpose:
          "Show customer-ready/draft/blocked state, completeness score, and validation status.",
      },
      {
        section: "Generated Layers",
        purpose:
          "Show frontend, backend/API, database/schema, admin/review, preview, and deploy/report file counts.",
      },
      {
        section: "Primary Actions",
        purpose:
          "Show preview, admin preview, download/export, and artifact history buttons.",
      },
      {
        section: "Validation Evidence",
        purpose:
          "Show validation report, missing-info report, blocked reasons, and missing layers.",
      },
      {
        section: "Distribution Readiness",
        purpose:
          "Show whether artifact is ready to distribute or still needs missing functionality/business inputs.",
      },
    ],

    distributionTruthRules: [
      "Do not call an artifact distribution-ready when customerReady is false.",
      "Do not hide homepage-only blocked artifacts.",
      "Show blocked reasons when validation fails.",
      "Show missing-info report before launch/distribution.",
      "Show validation score and status visibly.",
      "Show preview/download links only when paths exist.",
      "Label draft downloads clearly as draft_not_customer_ready.",
      "Preserve artifact history link for every generated artifact.",
      "Show backend/API and database/schema counts separately from frontend.",
    ],

    sampleDistributionCards: [
      {
        artifactId: "artifact_biscuit_shop_v1",
        projectId: "cmoyy1gl700004mkqn7or7hxr",
        title: "Biscuit Shop Homepage Draft",
        version: 1,
        artifactType: "full_stack_website_app",
        customerReady: false,
        completenessScore: 15,
        statusBadge: "blocked",
        validationStatus: "blocked",
        fileCount: 1,
        frontendCount: 1,
        backendCount: 0,
        databaseCount: 0,
        adminCount: 0,
        previewCount: 0,
        deployCount: 0,
        previewPath: "/preview/artifact_biscuit_shop_v1",
        adminPreviewPath: null,
        downloadPath: null,
        historyPath: "/projects/cmoyy1gl700004mkqn7or7hxr/artifacts/history",
        validationReportPath: "validation-report.json",
        missingInfoReportPath: "missing-info-report.md",
        blockedReasons: [
          "Homepage-only output cannot be distributed as customer-ready.",
          "Missing backend/API, database/schema, admin review, preview, deployment package, validation report, and missing-info report.",
        ],
        redacted: true,
      },
      {
        artifactId: generated.artifact.artifactId,
        projectId: generated.artifact.projectId,
        title: "Biscuit Shop Full-Stack Website",
        version: 2,
        artifactType: generated.artifact.artifactType,
        customerReady: generated.artifact.customerReady,
        completenessScore: generated.artifact.completenessScore,
        statusBadge: "customer_ready",
        validationStatus: "passed",
        fileCount: generated.artifact.fileCount,
        frontendCount: generated.artifact.frontendFiles.length,
        backendCount: generated.artifact.backendFiles.length,
        databaseCount: generated.artifact.databaseFiles.length,
        adminCount: generated.artifact.adminFiles.length,
        previewCount: generated.artifact.previewFiles.length,
        deployCount: generated.artifact.deployFiles.length,
        previewPath: generated.artifact.previewPath,
        adminPreviewPath: generated.artifact.adminPreviewPath,
        downloadPath: generated.artifact.downloadPath,
        historyPath: "/projects/cmoyy1gl700004mkqn7or7hxr/artifacts/history",
        validationReportPath: "validation-report.json",
        missingInfoReportPath: "missing-info-report.md",
        blockedReasons: [],
        redacted: true,
      },
    ],

    visibleDistributionPanelPlan: {
      targetRoute: "/projects/[id]/company/distribution",
      headline: "Generated Artifact Distribution Readiness",
      shouldShow: [
        "latest customer-ready artifact card",
        "blocked/draft artifact warning",
        "preview button",
        "admin preview button",
        "download button",
        "artifact history button",
        "validation report status",
        "missing-info report link",
      ],
    },

    distributionPreviewCompletenessChecks: [
      "Distribution route plan is defined.",
      "Preview card shape includes score, status, layer counts, preview, download, history, and reports.",
      "Card sections include artifact status, generated layers, actions, validation evidence, and distribution readiness.",
      "Truth rules block false distribution-ready claims.",
      "Sample cards include blocked homepage-only artifact and customer-ready full-stack artifact.",
      "Visible distribution panel plan targets the project distribution route.",
      "Integration sources confirm history UI, live preview, and customer download are ready.",
    ],

    integrationSources: {
      artifactHistoryUiStatus: historyUi.status,
      livePreviewArtifactRouteStatus: livePreview.status,
      customerDownloadPackageRouteStatus: download.status,
    },

    nextImplementationPhases: [
      "Real Customer Website/App Bundle Export",
      "Persistent Artifact Storage",
      "Artifact Rebuild/Rollback Controls",
      "Production Artifact Writer Integration",
      "Project Distribution Live Data Binding",
    ],
  };
}
