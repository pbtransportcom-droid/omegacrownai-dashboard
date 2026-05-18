import { getProjectArtifactHistoryIntegration } from "@/lib/sovereign/project-artifact-history-integration";
import { getGeneratedArtifactBundleWriter } from "@/lib/sovereign/generated-artifact-bundle-writer";
import { getWebsitePreviewSandbox } from "@/lib/sovereign/website-preview-sandbox";
import { getWebsiteFullFunctionValidationRunner } from "@/lib/sovereign/website-full-function-validation-runner";

export function getLivePreviewArtifactRoute() {
  const history = getProjectArtifactHistoryIntegration();
  const writer = getGeneratedArtifactBundleWriter();
  const preview = getWebsitePreviewSandbox();
  const validation = getWebsiteFullFunctionValidationRunner();

  return {
    system: "OmegaCrownAI Live Preview Artifact Route",
    phase: "v23.9 Phase 259",
    status: "live_preview_artifact_route_ready",
    purpose:
      "Define the live preview route layer that lets a generated artifact be opened in a browser with public preview, admin preview, validation status, missing-info warnings, and download/export actions.",
    corePrinciple:
      "Generated artifacts must be reviewable as working previews before customer-ready approval. A preview route must show the artifact, not only a text summary.",

    routePlan: {
      publicPreviewRoute: "/preview/[artifactId]",
      adminPreviewRoute: "/preview/[artifactId]/admin",
      projectDistributionRoute: "/projects/[id]/company/distribution",
      projectArtifactPreviewRoute: "/projects/[id]/artifacts/[artifactId]/preview",
      downloadRoute: "/api/projects/[projectId]/artifacts/[artifactId]/download",
      purpose:
        "Connect project distribution, artifact history, preview sandbox, validation status, and customer download path.",
    },

    previewRuntimeSections: [
      {
        section: "Public Artifact Preview",
        purpose:
          "Displays the generated website/app frontend with demo data, forms, calls-to-action, and preview banner.",
      },
      {
        section: "Admin Preview",
        purpose:
          "Displays generated admin/review workflow for contacts, orders, bookings, leads, subscribers, and missing information.",
      },
      {
        section: "Validation Panel",
        purpose:
          "Shows completeness score, passed/failed layers, customer-ready verdict, and blocked reasons.",
      },
      {
        section: "Missing Information Panel",
        purpose:
          "Shows missing business inputs such as address, pricing, hours, payment provider, delivery rules, or owner email.",
      },
      {
        section: "Artifact History Link",
        purpose:
          "Links the preview back to project artifact history with version, rebuild lineage, and validation reports.",
      },
      {
        section: "Download / Export Action",
        purpose:
          "Provides a customer download path only when export package exists and safety checks pass.",
      },
    ],

    livePreviewRules: [
      "Preview route must be scoped by artifactId.",
      "Preview must clearly show sandbox/demo mode when using sample data.",
      "Preview must not expose raw secrets, tokens, API keys, passwords, private keys, or real .env values.",
      "Preview must show customer-ready status honestly.",
      "Preview must show blocked reasons when customerReady is false.",
      "Preview must link to validation report and missing-info report.",
      "Preview must include admin preview when generated artifact has customer submissions.",
      "Preview must provide download/export action only when package route exists.",
      "Homepage-only artifacts may preview, but must be labeled draft/not customer-ready.",
    ],

    previewArtifactRecordShape: {
      artifactId: "artifact id",
      projectId: "project id",
      version: "artifact version",
      title: "artifact title",
      previewPath: "/preview/[artifactId]",
      adminPreviewPath: "/preview/[artifactId]/admin",
      projectPreviewPath: "/projects/[id]/artifacts/[artifactId]/preview",
      distributionPath: "/projects/[id]/company/distribution",
      downloadPath: "/api/projects/[projectId]/artifacts/[artifactId]/download",
      customerReady: "boolean",
      completenessScore: "0-100",
      validationStatus: "passed | failed | blocked | draft",
      redacted: true,
    },

    distributionPageIntegration: {
      sourceRoute: "/projects/[id]/company/distribution",
      expectedBehavior: [
        "Show latest generated artifact preview card.",
        "Show customer-ready status and completeness score.",
        "Show preview button.",
        "Show admin preview button.",
        "Show download/export button when available.",
        "Show missing-info and validation links.",
        "Do not imply the artifact is complete if validation is blocked.",
      ],
    },

    biscuitShopLivePreviewExample: {
      artifactId: "artifact_biscuit_shop_v2",
      publicPreviewPath: "/preview/artifact_biscuit_shop_v2",
      adminPreviewPath: "/preview/artifact_biscuit_shop_v2/admin",
      projectPreviewPath:
        "/projects/cmoyy1gl700004mkqn7or7hxr/artifacts/artifact_biscuit_shop_v2/preview",
      distributionPath:
        "/projects/cmoyy1gl700004mkqn7or7hxr/company/distribution",
      expectedVisiblePreview: [
        "biscuit shop homepage",
        "menu with demo biscuit items",
        "contact form",
        "order inquiry form",
        "newsletter signup",
        "admin order/contact review",
        "missing-info warning for prices/payment/pickup rules if absent",
        "validation score and customer-ready status",
      ],
      customerReadyRule:
        "Preview can be opened for draft artifacts, but customer-ready must remain false until backend, database, admin, preview, deploy, validation, and missing-info layers pass.",
    },

    livePreviewCompletenessChecks: [
      "Public preview route is defined.",
      "Admin preview route is defined.",
      "Project artifact preview route is defined.",
      "Project distribution route integration is defined.",
      "Preview shows validation/customer-ready state.",
      "Preview shows missing-info warnings.",
      "Preview blocks false complete claims.",
      "Preview links artifact history and download/export.",
      "Biscuit shop example includes public/admin/project preview paths.",
      "Integration sources confirm preview sandbox, artifact history, bundle writer, and validation runner are ready.",
    ],

    integrationSources: {
      projectArtifactHistoryStatus: history.status,
      generatedArtifactBundleWriterStatus: writer.status,
      websitePreviewSandboxStatus: preview.status,
      validationRunnerStatus: validation.status,
    },

    nextImplementationPhases: [
      "Customer Download Package Route",
      "Real Full-Stack Artifact Generator Implementation",
      "Builder UI Full-Function Output Panel",
      "Artifact History UI Upgrade",
      "Project Distribution Preview Cards",
    ],
  };
}
