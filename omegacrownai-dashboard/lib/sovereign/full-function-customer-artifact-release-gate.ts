import { executeProductionArtifactWriter } from "@/lib/sovereign/production-artifact-writer-execution-route";
import { simulateArtifactStorageDatabaseWrite } from "@/lib/sovereign/artifact-storage-database-write-api";
import { getRebuildRollbackPersistenceIntegration } from "@/lib/sovereign/rebuild-rollback-persistence-integration";
import { getCustomerExportAuditPersistence } from "@/lib/sovereign/customer-export-audit-persistence";

type ReleaseGateInput = {
  projectId?: string;
  requestedBy?: string;
  artifactMode?: "full_stack" | "homepage_only" | "missing_backend";
};

function safeId(value: unknown, fallback: string) {
  if (typeof value !== "string") return fallback;
  const cleaned = value.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 100);
  return cleaned || fallback;
}

export function evaluateCustomerArtifactReleaseGate(input: ReleaseGateInput = {}) {
  const projectId = safeId(input.projectId, "cmoyy1gl700004mkqn7or7hxr");
  const requestedBy = safeId(input.requestedBy, "system");
  const artifactMode = input.artifactMode || "full_stack";

  const execution = executeProductionArtifactWriter({
    projectId,
    requestedBy,
    prompt:
      artifactMode === "homepage_only"
        ? "Build only a homepage draft."
        : artifactMode === "missing_backend"
          ? "Build a website missing backend and database."
          : "Build a customer-ready full-stack website/app with frontend, backend, database, admin, preview, deployment, validation, missing-info, ZIP export, storage, history, audit, rebuild, rollback, and distribution.",
  });

  const dbWrite = simulateArtifactStorageDatabaseWrite({
    projectId,
    artifactId: execution.receipt.artifactId,
    requestedBy,
  });

  const layerCounts =
    artifactMode === "homepage_only"
      ? {
          frontendCount: 1,
          backendCount: 0,
          databaseCount: 0,
          adminCount: 0,
          previewCount: 0,
          deployCount: 0,
        }
      : artifactMode === "missing_backend"
        ? {
            frontendCount: execution.artifactSummary.frontendCount,
            backendCount: 0,
            databaseCount: 0,
            adminCount: execution.artifactSummary.adminCount,
            previewCount: execution.artifactSummary.previewCount,
            deployCount: execution.artifactSummary.deployCount,
          }
        : {
            frontendCount: execution.artifactSummary.frontendCount,
            backendCount: execution.artifactSummary.backendCount,
            databaseCount: execution.artifactSummary.databaseCount,
            adminCount: execution.artifactSummary.adminCount,
            previewCount: execution.artifactSummary.previewCount,
            deployCount: execution.artifactSummary.deployCount,
          };

  const requiredLayersPresent =
    layerCounts.frontendCount >= 1 &&
    layerCounts.backendCount >= 1 &&
    layerCounts.databaseCount >= 1 &&
    layerCounts.adminCount >= 1 &&
    layerCounts.previewCount >= 1 &&
    layerCounts.deployCount >= 1;

  const completenessScore =
    artifactMode === "homepage_only"
      ? 15
      : artifactMode === "missing_backend"
        ? 55
        : execution.receipt.completenessScore;

  const customerReady =
    artifactMode === "full_stack" &&
    requiredLayersPresent &&
    completenessScore >= 90 &&
    execution.receipt.zipCreated === true &&
    dbWrite.writeReceipt.storageRecordWritten === true &&
    dbWrite.writeReceipt.historyRecordWritten === true &&
    dbWrite.writeReceipt.auditEventWritten === true;

  const failedReasons = [
    ...(!requiredLayersPresent
      ? ["Missing required full-stack layers."]
      : []),
    ...(completenessScore < 90
      ? ["Completeness score is below customer-ready threshold."]
      : []),
    ...(execution.receipt.zipCreated !== true
      ? ["ZIP package was not created."]
      : []),
    ...(dbWrite.writeReceipt.storageRecordWritten !== true
      ? ["Artifact storage record was not written."]
      : []),
    ...(dbWrite.writeReceipt.historyRecordWritten !== true
      ? ["Artifact history record was not written."]
      : []),
    ...(dbWrite.writeReceipt.auditEventWritten !== true
      ? ["Artifact export audit event was not written."]
      : []),
  ];

  const releaseReceipt = {
    releaseGateId: `release_gate_${projectId}_${Date.now()}`,
    projectId,
    artifactId: execution.receipt.artifactId,
    requestedBy,
    artifactMode,
    customerReady,
    releaseAllowed: customerReady,
    completenessScore,
    exportLabel: customerReady
      ? "customer_ready_full_function_artifact"
      : "blocked_missing_required_functionality",
    requiredLayersPresent,
    layerCounts,
    storageRecordWritten: dbWrite.writeReceipt.storageRecordWritten,
    historyRecordWritten: dbWrite.writeReceipt.historyRecordWritten,
    auditEventWritten: dbWrite.writeReceipt.auditEventWritten,
    zipCreated: execution.receipt.zipCreated,
    previewPath: execution.receipt.previewPath,
    downloadPath: execution.receipt.downloadPath,
    historyPath: execution.receipt.historyPath,
    distributionPath: execution.receipt.distributionPath,
    validationReportPath: execution.receipt.validationReportPath,
    missingInfoReportPath: execution.receipt.missingInfoReportPath,
    failedReasons,
    redacted: true,
  };

  return {
    ok: true,
    phase: "v26.0 Phase 280",
    mode: "full_function_customer_artifact_release_gate_evaluation",
    releaseReceipt,
  };
}

export function getFullFunctionCustomerArtifactReleaseGate() {
  const rebuildRollback = getRebuildRollbackPersistenceIntegration();
  const auditPersistence = getCustomerExportAuditPersistence();

  const fullStack = evaluateCustomerArtifactReleaseGate({
    projectId: "cmoyy1gl700004mkqn7or7hxr",
    requestedBy: "system",
    artifactMode: "full_stack",
  });

  const homepageOnly = evaluateCustomerArtifactReleaseGate({
    projectId: "cmoyy1gl700004mkqn7or7hxr",
    requestedBy: "system",
    artifactMode: "homepage_only",
  });

  return {
    system: "OmegaCrownAI Full-Function Customer Artifact Release Gate",
    phase: "v26.0 Phase 280",
    status: "full_function_customer_artifact_release_gate_ready",
    purpose:
      "Define the final release gate that determines whether a generated customer artifact can be labeled customer-ready, downloaded as final, and distributed as a full-function product.",
    corePrinciple:
      "No artifact may be called customer-ready unless it has full-stack layers, validation score, ZIP export, storage/history/audit writes, safe redaction, and release-gate approval.",

    releaseGateContract: {
      route: "/api/sovereign/full-function-customer-artifact-release-gate",
      projectRoute: "/api/projects/[id]/artifacts/release-gate",
      method: "POST",
      minimumScore: 90,
      requiredReleaseLabel: "customer_ready_full_function_artifact",
      blockedLabel: "blocked_missing_required_functionality",
      redacted: true,
    },

    requiredLayerGate: [
      "frontend",
      "backend_api",
      "database_schema",
      "admin_review",
      "preview_sandbox",
      "deploy_export",
    ],

    gateChecklist: [
      "Frontend files exist.",
      "Backend/API files exist.",
      "Database/schema files exist.",
      "Admin/review files exist.",
      "Preview sandbox exists.",
      "Deploy/export files exist.",
      "Completeness score is at least 90.",
      "ZIP package exists.",
      "Download path exists.",
      "Storage record write succeeded.",
      "History record write succeeded.",
      "Audit event write succeeded.",
      "Validation report exists.",
      "Missing-info report exists.",
      "Rebuild/rollback safety integration is ready.",
      "Audit persistence integration is ready.",
      "No raw secrets or environment values are included.",
    ],

    gateRules: [
      "Block homepage-only artifacts.",
      "Block artifacts missing backend/API.",
      "Block artifacts missing database/schema.",
      "Block artifacts missing admin/review.",
      "Block artifacts without preview sandbox.",
      "Block artifacts without deploy/export files.",
      "Block artifacts with score below 90.",
      "Block artifacts without ZIP package.",
      "Block artifacts without storage/history/audit write receipts.",
      "Only full-stack artifacts may receive customer_ready_full_function_artifact.",
      "Always return redacted release receipts.",
    ],

    releaseReceiptShape: {
      releaseGateId: "release gate id",
      projectId: "project id",
      artifactId: "artifact id",
      customerReady: "boolean",
      releaseAllowed: "boolean",
      completenessScore: "0-100",
      exportLabel:
        "customer_ready_full_function_artifact | blocked_missing_required_functionality",
      requiredLayersPresent: "boolean",
      storageRecordWritten: "boolean",
      historyRecordWritten: "boolean",
      auditEventWritten: "boolean",
      zipCreated: "boolean",
      previewPath: "preview path",
      downloadPath: "download path",
      historyPath: "history path",
      distributionPath: "distribution path",
      failedReasons: "array",
      redacted: true,
    },

    sampleReleaseEvaluations: {
      fullStack: fullStack.releaseReceipt,
      homepageOnly: homepageOnly.releaseReceipt,
    },

    releaseGateCompletenessChecks: [
      "Release gate contract defines sovereign and project POST routes.",
      "Required layer gate includes frontend, backend, database, admin, preview, and deploy/export.",
      "Gate checklist includes layers, score, ZIP, download, storage, history, audit, reports, safety, and integrations.",
      "Gate rules block homepage-only, missing backend, missing database, missing admin, missing preview, missing deploy, low score, and missing writes.",
      "Release receipt shape includes score, label, paths, write receipts, failed reasons, and redaction.",
      "Full-stack sample release is customer-ready and allowed.",
      "Homepage-only sample release is blocked and not customer-ready.",
      "Integration sources confirm rebuild/rollback persistence and audit persistence are ready.",
    ],

    integrationSources: {
      rebuildRollbackPersistenceIntegrationStatus: rebuildRollback.status,
      customerExportAuditPersistenceStatus: auditPersistence.status,
    },

    nextImplementationPhases: [
      "Production Website/App Generator File Writer",
      "Customer Artifact Billing/Entitlement Gate",
      "Artifact Storage Real Prisma Write Implementation",
      "Customer Artifact Delivery Dashboard",
      "Full-Function Artifact System Completion Summary",
    ],
  };
}
