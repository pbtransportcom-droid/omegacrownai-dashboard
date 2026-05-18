import { getFullStackBuilderRuntime } from "@/lib/sovereign/full-stack-builder-runtime";
import { getGeneratedArtifactBundleWriter } from "@/lib/sovereign/generated-artifact-bundle-writer";
import { getWebsiteFullFunctionValidationRunner } from "@/lib/sovereign/website-full-function-validation-runner";

export function getProjectArtifactHistoryIntegration() {
  const runtime = getFullStackBuilderRuntime();
  const writer = getGeneratedArtifactBundleWriter();
  const validationRunner = getWebsiteFullFunctionValidationRunner();

  return {
    system: "OmegaCrownAI Project Artifact History Integration",
    phase: "v23.8 Phase 258",
    status: "project_artifact_history_integration_ready",
    purpose:
      "Define how generated full-stack artifact bundles are saved into project history with versioning, preview/download paths, validation status, missing-info reports, customer-ready status, and rebuild/rollback references.",
    corePrinciple:
      "Every generated artifact must leave a durable project history record so customers can review what was built, what changed, whether it is customer-ready, what files exist, and how to preview/download/rebuild it.",

    artifactHistoryRecordShape: {
      artifactId: "stable artifact id",
      projectId: "source project id",
      version: "integer artifact version",
      artifactType: "full_stack_website_app",
      title: "human-readable artifact title",
      prompt: "original user build prompt",
      createdAt: "ISO timestamp",
      createdBy: "user/admin/agent id",
      customerReady: "boolean",
      completenessScore: "0-100",
      validationStatus: "passed | failed | blocked | draft",
      previewPath: "preview route",
      adminPreviewPath: "admin preview route",
      downloadPath: "download/export route",
      manifestPath: "artifact-manifest.json",
      validationReportPath: "validation-report.json",
      missingInfoReportPath: "missing-info-report.md",
      rollbackFromArtifactId: "previous artifact id or null",
      rebuildFromArtifactId: "source artifact id or null",
      redacted: true,
    },

    historyIntegrationFlow: [
      "Generate artifact bundle.",
      "Run full-function validation.",
      "Create artifact manifest.",
      "Create validation report.",
      "Create missing-info report.",
      "Create preview and admin preview paths.",
      "Create download/export path.",
      "Write project artifact history record.",
      "Increment project artifact version.",
      "Mark artifact customer-ready only if validation passes.",
      "Expose artifact in project history page.",
      "Allow future rebuild/rollback reference.",
    ],

    versioningRules: [
      "Each generated artifact receives a monotonically increasing version per project.",
      "Rebuilds should link to rebuildFromArtifactId.",
      "Rollback packages should link to rollbackFromArtifactId.",
      "History records should not be overwritten.",
      "Customer-ready status should be preserved per version.",
      "Failed/draft artifacts should remain visible with blocked reasons.",
    ],

    historyDisplaySections: [
      {
        section: "Artifact Summary",
        fields: ["title", "version", "createdAt", "artifactType", "customerReady", "completenessScore"],
      },
      {
        section: "Preview / Download",
        fields: ["previewPath", "adminPreviewPath", "downloadPath"],
      },
      {
        section: "Reports",
        fields: ["manifestPath", "validationReportPath", "missingInfoReportPath"],
      },
      {
        section: "Validation Result",
        fields: ["validationStatus", "blockedReasons", "missingLayers"],
      },
      {
        section: "Version Lineage",
        fields: ["rollbackFromArtifactId", "rebuildFromArtifactId", "previousVersion"],
      },
    ],

    artifactHistoryApiPlan: {
      saveRoute: "/api/projects/[projectId]/artifacts/history",
      listRoute: "/api/projects/[projectId]/artifacts/history",
      detailRoute: "/api/projects/[projectId]/artifacts/[artifactId]",
      methodPlan: [
        "POST saves a generated artifact history record.",
        "GET lists project artifact history.",
        "GET detail returns one artifact history record.",
      ],
      persistencePlan:
        "Future implementation should store artifact history in database and generated bundle metadata in project storage.",
    },

    customerReadyHistoryRules: [
      "Do not hide failed or draft artifacts.",
      "Do not call an artifact customer-ready unless validation score is 90+ and all required layers pass.",
      "Show blocked reasons when customerReady is false.",
      "Show missing-info report link for every artifact.",
      "Show validation report link for every artifact.",
      "Show preview/download links only when generated paths exist.",
      "Preserve previous customer-ready versions after rebuilds.",
    ],

    sampleHistoryRecords: [
      {
        artifactId: "artifact_biscuit_shop_v1",
        projectId: "project_demo",
        version: 1,
        artifactType: "full_stack_website_app",
        title: "Biscuit Shop Website Draft",
        customerReady: false,
        completenessScore: 15,
        validationStatus: "blocked",
        previewPath: "/preview/artifact_biscuit_shop_v1",
        adminPreviewPath: null,
        downloadPath: null,
        validationReportPath: "validation-report.json",
        missingInfoReportPath: "missing-info-report.md",
        blockedReasons: ["Homepage-only output. Missing backend/API, database, admin, preview, export, deployment, validation, and missing-info layers."],
        redacted: true,
      },
      {
        artifactId: "artifact_biscuit_shop_v2",
        projectId: "project_demo",
        version: 2,
        artifactType: "full_stack_website_app",
        title: "Biscuit Shop Full-Stack Website",
        customerReady: true,
        completenessScore: 100,
        validationStatus: "passed",
        previewPath: "/preview/artifact_biscuit_shop_v2",
        adminPreviewPath: "/preview/artifact_biscuit_shop_v2/admin",
        downloadPath: "/api/projects/project_demo/artifacts/artifact_biscuit_shop_v2/download",
        validationReportPath: "validation-report.json",
        missingInfoReportPath: "missing-info-report.md",
        blockedReasons: [],
        rebuildFromArtifactId: "artifact_biscuit_shop_v1",
        redacted: true,
      },
    ],

    historyCompletenessChecks: [
      "Artifact history record shape includes artifactId, projectId, version, score, customerReady, previewPath, downloadPath, validation report, and missing-info report.",
      "History integration flow saves generated bundle metadata after validation.",
      "Versioning rules preserve old artifact records.",
      "History display sections include summary, reports, validation, preview/download, and lineage.",
      "API plan includes save, list, and detail routes.",
      "Customer-ready rules block incomplete artifacts.",
      "Sample history includes failed homepage-only artifact and passing full-stack artifact.",
      "Integration sources confirm runtime, bundle writer, and validation runner are ready.",
    ],

    integrationSources: {
      fullStackRuntimeStatus: runtime.status,
      generatedArtifactBundleWriterStatus: writer.status,
      validationRunnerStatus: validationRunner.status,
      minimumCustomerReadyScore: runtime.completenessScoring.minimumCustomerReadyScore,
    },

    nextImplementationPhases: [
      "Live Preview Artifact Route",
      "Customer Download Package Route",
      "Real Full-Stack Artifact Generator Implementation",
      "Builder UI Full-Function Output Panel",
      "Artifact History UI Upgrade",
    ],
  };
}
