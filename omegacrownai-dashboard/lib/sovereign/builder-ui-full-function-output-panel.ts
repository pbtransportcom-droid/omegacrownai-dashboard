import { generateRealFullStackArtifact } from "@/lib/sovereign/real-full-stack-artifact-generator";
import { getLivePreviewArtifactRoute } from "@/lib/sovereign/live-preview-artifact-route";
import { getCustomerDownloadPackageRoute } from "@/lib/sovereign/customer-download-package-route";

export function getBuilderUiFullFunctionOutputPanel() {
  const biscuitArtifact = generateRealFullStackArtifact({
    projectId: "cmoyy1gl700004mkqn7or7hxr",
    prompt:
      "Build a modern biscuit shop website with menu, about, contact, warm colors, order call-to-action, backend, database, admin review, preview, and deploy package.",
  });

  const homepageOnlyArtifact = {
    artifactId: "homepage_only_blocked_example",
    customerReady: false,
    completenessScore: 15,
    blockedReason:
      "Homepage-only output is not customer-ready because backend/API, database/schema, admin review, preview, export, deployment, validation, and missing-info reporting are missing.",
  };

  const preview = getLivePreviewArtifactRoute();
  const download = getCustomerDownloadPackageRoute();

  return {
    system: "OmegaCrownAI Builder UI Full-Function Output Panel",
    phase: "v24.2 Phase 262",
    status: "builder_ui_full_function_output_panel_ready",
    purpose:
      "Define the visible builder/project panel that shows generated full-stack artifact status, file layer counts, customer-ready score, preview/download links, validation status, missing-info report, and blocked homepage-only warning.",
    corePrinciple:
      "The project builder UI must show the truth: generated artifacts are customer-ready only when full-stack validation passes. Front-page-only output must be visibly blocked or labeled draft.",

    panelSections: [
      {
        section: "Customer-Ready Score",
        purpose:
          "Show completeness score, required threshold, and customer-ready/draft status.",
      },
      {
        section: "Generated Layer Counts",
        purpose:
          "Show frontend, backend/API, database/schema, admin/review, preview, and deploy/report file counts.",
      },
      {
        section: "Preview and Download Actions",
        purpose:
          "Show live preview, admin preview, and download/export package links when available.",
      },
      {
        section: "Validation Report",
        purpose:
          "Show validation verdict, passed layers, missing layers, and blocked reasons.",
      },
      {
        section: "Missing Information Report",
        purpose:
          "Show missing business inputs and assumptions used to continue building.",
      },
      {
        section: "Homepage-Only Block Warning",
        purpose:
          "Warn that homepage-only or frontend-only output cannot be labeled customer-ready.",
      },
    ],

    outputPanelDataShape: {
      artifactId: "generated artifact id",
      projectId: "source project id",
      prompt: "original build prompt",
      projectType: "classified project type",
      customerReady: "boolean",
      completenessScore: "0-100",
      fileCount: "total generated file descriptors",
      frontendCount: "number",
      backendCount: "number",
      databaseCount: "number",
      adminCount: "number",
      previewCount: "number",
      deployCount: "number",
      previewPath: "live preview path",
      adminPreviewPath: "admin preview path",
      downloadPath: "download/export path",
      missingBusinessInputs: "array",
      validationVerdict: "validation verdict",
    },

    uiRules: [
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
    ],

    biscuitShopPanelExample: {
      artifactId: biscuitArtifact.artifact.artifactId,
      projectId: biscuitArtifact.artifact.projectId,
      projectType: biscuitArtifact.artifact.projectType,
      customerReady: biscuitArtifact.artifact.customerReady,
      completenessScore: biscuitArtifact.artifact.completenessScore,
      fileCount: biscuitArtifact.artifact.fileCount,
      frontendCount: biscuitArtifact.artifact.frontendFiles.length,
      backendCount: biscuitArtifact.artifact.backendFiles.length,
      databaseCount: biscuitArtifact.artifact.databaseFiles.length,
      adminCount: biscuitArtifact.artifact.adminFiles.length,
      previewCount: biscuitArtifact.artifact.previewFiles.length,
      deployCount: biscuitArtifact.artifact.deployFiles.length,
      previewPath: biscuitArtifact.artifact.previewPath,
      adminPreviewPath: biscuitArtifact.artifact.adminPreviewPath,
      downloadPath: biscuitArtifact.artifact.downloadPath,
      missingBusinessInputCount: biscuitArtifact.artifact.missingBusinessInputs.length,
      validationVerdict: biscuitArtifact.artifact.validation.verdict,
    },

    homepageOnlyBlockedExample: homepageOnlyArtifact,

    integrationSources: {
      livePreviewArtifactRouteStatus: preview.status,
      customerDownloadPackageRouteStatus: download.status,
    },

    nextImplementationPhases: [
      "Download ZIP Writer Implementation",
      "Generated Artifact File System Writer",
      "Artifact History UI Upgrade",
      "Project Distribution Preview Cards",
      "Real Customer Website/App Bundle Export",
    ],
  };
}
