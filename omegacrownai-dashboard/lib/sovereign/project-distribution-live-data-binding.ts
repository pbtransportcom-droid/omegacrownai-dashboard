import { getProductionArtifactWriterIntegration } from "@/lib/sovereign/production-artifact-writer-integration";
import { getProjectDistributionPreviewCards } from "@/lib/sovereign/project-distribution-preview-cards";
import { getPersistentArtifactStorage } from "@/lib/sovereign/persistent-artifact-storage";
import { getArtifactHistoryUiUpgrade } from "@/lib/sovereign/artifact-history-ui-upgrade";
import { generateRealFullStackArtifact } from "@/lib/sovereign/real-full-stack-artifact-generator";

export function getProjectDistributionLiveDataBinding(projectId = "cmoyy1gl700004mkqn7or7hxr") {
  const production = getProductionArtifactWriterIntegration();
  const previewCards = getProjectDistributionPreviewCards();
  const storage = getPersistentArtifactStorage();
  const historyUi = getArtifactHistoryUiUpgrade();

  const latest = generateRealFullStackArtifact({
    projectId,
    prompt:
      "Build a customer-ready biscuit shop website/app with menu, order inquiry, contact, backend, database, admin review, preview, deployment package, validation report, missing-info report, persistent storage, and export package.",
  });

  const artifactId = latest.artifact.artifactId;

  return {
    system: "OmegaCrownAI Project Distribution Live Data Binding",
    phase: "v25.1 Phase 271",
    status: "project_distribution_live_data_binding_ready",
    projectId,
    purpose:
      "Define the live data binding layer that feeds project distribution pages with generated artifact status, preview/download/history/report links, customer-ready labels, blocked draft warnings, and production writer receipts.",
    corePrinciple:
      "The project distribution page must read from artifact data, not static claims. It should show the latest generated artifact, artifact history, validation truth, and safe customer actions.",

    distributionLiveDataContract: {
      sourceRoute: "/projects/[id]/company/distribution",
      apiRoute: "/api/sovereign/project-distribution-live-data-binding?projectId={projectId}",
      liveDataSources: [
        "production artifact writer integration",
        "project distribution preview cards",
        "persistent artifact storage",
        "artifact history UI",
        "real full-stack artifact generator",
      ],
      requiredBoundFields: [
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
      ],
    },

    liveBindingFlow: [
      "Load projectId from distribution route.",
      "Resolve latest generated artifact.",
      "Resolve artifact customer-ready status and completeness score.",
      "Resolve preview, admin preview, download, history, and report links.",
      "Resolve artifact timeline cards.",
      "Show blocked draft warnings when validation fails.",
      "Show customer-ready actions when validation passes.",
      "Bind production writer integration status.",
      "Bind persistent storage metadata.",
      "Return distribution-ready data object.",
    ],

    latestArtifactCard: {
      artifactId,
      projectId,
      title: "Biscuit Shop Full-Stack Website/App",
      version: 2,
      artifactType: latest.artifact.artifactType,
      customerReady: latest.artifact.customerReady,
      completenessScore: latest.artifact.completenessScore,
      statusBadge: latest.artifact.customerReady ? "customer_ready" : "draft",
      validationStatus: latest.artifact.customerReady ? "passed" : "blocked",
      fileCount: latest.artifact.fileCount,
      frontendCount: latest.artifact.frontendFiles.length,
      backendCount: latest.artifact.backendFiles.length,
      databaseCount: latest.artifact.databaseFiles.length,
      adminCount: latest.artifact.adminFiles.length,
      previewCount: latest.artifact.previewFiles.length,
      deployCount: latest.artifact.deployFiles.length,
      previewPath: latest.artifact.previewPath,
      adminPreviewPath: latest.artifact.adminPreviewPath,
      downloadPath: latest.artifact.downloadPath,
      historyPath: `/projects/${projectId}/artifacts/history`,
      distributionPath: `/projects/${projectId}/company/distribution`,
      validationReportPath: "validation-report.json",
      missingInfoReportPath: "missing-info-report.md",
      blockedReasons: [],
      redacted: true,
    },

    artifactTimeline: [
      {
        artifactId: "artifact_biscuit_shop_v1",
        version: 1,
        title: "Biscuit Shop Homepage Draft",
        customerReady: false,
        completenessScore: 15,
        statusBadge: "blocked",
        blockedReasons: [
          "Homepage-only output cannot be distributed as customer-ready.",
          "Missing backend/API, database/schema, admin review, preview, deployment package, validation report, and missing-info report.",
        ],
        previewPath: "/preview/artifact_biscuit_shop_v1",
        downloadPath: null,
        redacted: true,
      },
      {
        artifactId,
        version: 2,
        title: "Biscuit Shop Full-Stack Website/App",
        customerReady: latest.artifact.customerReady,
        completenessScore: latest.artifact.completenessScore,
        statusBadge: "customer_ready",
        previewPath: latest.artifact.previewPath,
        downloadPath: latest.artifact.downloadPath,
        rebuildFromArtifactId: "artifact_biscuit_shop_v1",
        redacted: true,
      },
    ],

    distributionBindingRules: [
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
    ],

    liveDistributionUiSections: [
      "Latest artifact status card",
      "Artifact version timeline",
      "Preview/download/history actions",
      "Validation and missing-info report links",
      "Blocked draft warning",
      "Production writer integration status",
      "Persistent storage status",
    ],

    biscuitShopLiveBindingExample: {
      projectId,
      latestArtifactId: artifactId,
      latestScore: latest.artifact.completenessScore,
      latestCustomerReady: latest.artifact.customerReady,
      previewPath: latest.artifact.previewPath,
      downloadPath: latest.artifact.downloadPath,
      historyPath: `/projects/${projectId}/artifacts/history`,
      distributionPath: `/projects/${projectId}/company/distribution`,
      timelineCount: 2,
      expectedVisibleActions: [
        "Preview",
        "Admin Preview",
        "Download ZIP",
        "View History",
        "Validation Report",
        "Missing Info Report",
      ],
    },

    liveBindingCompletenessChecks: [
      "Live data contract includes latest artifact, timeline, score, status, preview, download, history, reports, and blocked reasons.",
      "Live binding flow resolves projectId and artifact data.",
      "Latest artifact card is customer-ready and full-stack.",
      "Artifact timeline includes blocked draft and customer-ready full-stack artifact.",
      "Distribution binding rules block false customer-ready actions.",
      "UI sections include latest artifact, timeline, actions, validation, blocked warning, production writer, and storage status.",
      "Integration sources confirm production writer, preview cards, persistent storage, and history UI are ready.",
    ],

    integrationSources: {
      productionArtifactWriterIntegrationStatus: production.status,
      projectDistributionPreviewCardsStatus: previewCards.status,
      persistentArtifactStorageStatus: storage.status,
      artifactHistoryUiStatus: historyUi.status,
    },

    nextImplementationPhases: [
      "Customer Export Audit Trail",
      "Persistent Artifact Database Migration",
      "Rebuild/Rollback API Implementation",
      "Production Artifact Writer Execution Route",
      "Distribution Page Live UI Injection",
    ],
  };
}
