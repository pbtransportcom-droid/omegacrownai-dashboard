import { getProjectArtifactHistoryIntegration } from "@/lib/sovereign/project-artifact-history-integration";
import { getGeneratedArtifactFileSystemWriter } from "@/lib/sovereign/generated-artifact-file-system-writer";
import { getLivePreviewArtifactRoute } from "@/lib/sovereign/live-preview-artifact-route";
import { getCustomerDownloadPackageRoute } from "@/lib/sovereign/customer-download-package-route";

export function getArtifactHistoryUiUpgrade() {
  const history = getProjectArtifactHistoryIntegration();
  const fileWriter = getGeneratedArtifactFileSystemWriter();
  const preview = getLivePreviewArtifactRoute();
  const download = getCustomerDownloadPackageRoute();

  return {
    system: "OmegaCrownAI Artifact History UI Upgrade",
    phase: "v24.5 Phase 265",
    status: "artifact_history_ui_upgrade_ready",
    purpose:
      "Define the artifact history UI upgrade that shows generated artifacts by version with customer-ready status, completeness score, preview/download/report links, blocked reasons, missing-info report, and rebuild/rollback lineage.",
    corePrinciple:
      "Users must be able to see what was generated, whether it is full-function, what is missing, and how to preview/download every artifact version without false completion claims.",

    artifactHistoryCardShape: {
      artifactId: "artifact id",
      version: "artifact version",
      title: "artifact title",
      artifactType: "full_stack_website_app",
      customerReady: "boolean",
      completenessScore: "0-100",
      statusBadge: "customer_ready | draft | blocked",
      validationStatus: "passed | draft | blocked | failed",
      previewPath: "preview route",
      adminPreviewPath: "admin preview route",
      downloadPath: "download route",
      manifestPath: "artifact-manifest.json",
      validationReportPath: "validation-report.json",
      missingInfoReportPath: "missing-info-report.md",
      blockedReasons: "array",
      missingLayers: "array",
      createdAt: "ISO timestamp",
      redacted: true,
    },

    uiSections: [
      {
        section: "Latest Artifact",
        purpose:
          "Show the newest generated artifact, score, customer-ready status, and primary preview/download actions.",
      },
      {
        section: "Artifact Versions",
        purpose:
          "List all previous generated versions including drafts, blocked outputs, and customer-ready releases.",
      },
      {
        section: "Validation Evidence",
        purpose:
          "Show score, passed layers, missing layers, blocked reasons, and validation report link.",
      },
      {
        section: "Reports",
        purpose:
          "Expose artifact manifest, validation report, missing-info report, and deployment guide links.",
      },
      {
        section: "Lineage",
        purpose:
          "Show rebuildFromArtifactId, rollbackFromArtifactId, previous version, and next version links.",
      },
      {
        section: "Actions",
        purpose:
          "Show preview, admin preview, download/export, rebuild, and rollback actions where available.",
      },
    ],

    statusBadgeRules: [
      {
        badge: "customer_ready",
        condition:
          "customerReady true, completenessScore >= 90, validationStatus passed, all required layers present",
        colorIntent: "emerald",
      },
      {
        badge: "draft",
        condition:
          "artifact can be previewed/downloaded but is not customer-ready yet",
        colorIntent: "yellow",
      },
      {
        badge: "blocked",
        condition:
          "required functionality is missing or validation failed",
        colorIntent: "red",
      },
    ],

    actionRules: [
      "Always show validation status.",
      "Show preview link when previewPath exists.",
      "Show admin preview link when adminPreviewPath exists.",
      "Show download link when downloadPath exists.",
      "Label downloads as draft_not_customer_ready when validation is blocked.",
      "Show validation report link for every artifact.",
      "Show missing-info report link for every artifact.",
      "Do not hide failed or draft artifacts.",
      "Do not mark homepage-only artifacts customer-ready.",
    ],

    sampleArtifactCards: [
      {
        artifactId: "artifact_biscuit_shop_v1",
        version: 1,
        title: "Biscuit Shop Homepage Draft",
        customerReady: false,
        completenessScore: 15,
        statusBadge: "blocked",
        validationStatus: "blocked",
        previewPath: "/preview/artifact_biscuit_shop_v1",
        adminPreviewPath: null,
        downloadPath: null,
        validationReportPath: "validation-report.json",
        missingInfoReportPath: "missing-info-report.md",
        blockedReasons: [
          "Homepage-only output. Missing backend/API, database, admin, preview, export, deployment, validation, and missing-info layers.",
        ],
        missingLayers: [
          "Backend/API",
          "Database/Data Model",
          "Admin/Owner Review",
          "Preview Sandbox",
          "Download/Export Package",
          "Deployment Guide",
          "Validation Report",
          "Missing-Information Report",
        ],
        redacted: true,
      },
      {
        artifactId: "artifact_biscuit_shop_v2",
        version: 2,
        title: "Biscuit Shop Full-Stack Website",
        customerReady: true,
        completenessScore: 100,
        statusBadge: "customer_ready",
        validationStatus: "passed",
        previewPath: "/preview/artifact_biscuit_shop_v2",
        adminPreviewPath: "/preview/artifact_biscuit_shop_v2/admin",
        downloadPath:
          "/api/projects/project_demo/artifacts/artifact_biscuit_shop_v2/download",
        validationReportPath: "validation-report.json",
        missingInfoReportPath: "missing-info-report.md",
        blockedReasons: [],
        missingLayers: [],
        rebuildFromArtifactId: "artifact_biscuit_shop_v1",
        redacted: true,
      },
    ],

    visibleHistoryPagePlan: {
      route: "/projects/[id]/artifacts/history",
      purpose:
        "Show project artifact history cards with preview, download, validation, missing-info, and lineage.",
      sections: [
        "latest artifact summary",
        "artifact version timeline",
        "blocked draft artifacts",
        "customer-ready artifacts",
        "report links",
        "preview/download actions",
      ],
    },

    uiCompletenessChecks: [
      "History card shape includes score, status, preview, download, validation report, and missing-info report.",
      "UI sections include latest artifact, versions, validation, reports, lineage, and actions.",
      "Status badge rules distinguish customer-ready, draft, and blocked.",
      "Action rules prevent false customer-ready claims.",
      "Sample cards include blocked homepage-only draft and customer-ready full-stack artifact.",
      "Visible history page route is planned.",
      "Integration sources confirm history, file writer, preview, and download are ready.",
    ],

    integrationSources: {
      projectArtifactHistoryStatus: history.status,
      fileSystemWriterStatus: fileWriter.status,
      livePreviewArtifactRouteStatus: preview.status,
      customerDownloadPackageRouteStatus: download.status,
    },

    nextImplementationPhases: [
      "Project Distribution Preview Cards",
      "Real Customer Website/App Bundle Export",
      "Persistent Artifact Storage",
      "Artifact Rebuild/Rollback Controls",
      "Production Artifact Writer Integration",
    ],
  };
}
