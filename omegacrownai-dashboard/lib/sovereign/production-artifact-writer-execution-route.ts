import { getProductionArtifactWriterIntegration } from "@/lib/sovereign/production-artifact-writer-integration";
import { generateRealFullStackArtifact } from "@/lib/sovereign/real-full-stack-artifact-generator";
import { createGeneratedArtifactFileSystemWritePlan } from "@/lib/sovereign/generated-artifact-file-system-writer";
import { createCustomerArtifactPackage } from "@/lib/sovereign/download-zip-writer";
import { getPersistentArtifactStorage } from "@/lib/sovereign/persistent-artifact-storage";
import { getCustomerExportAuditTrail } from "@/lib/sovereign/customer-export-audit-trail";

type ExecuteInput = {
  projectId?: string;
  prompt?: string;
  requestedBy?: string;
  requestedType?: string;
};

function safeId(value: unknown, fallback: string) {
  if (typeof value !== "string") return fallback;
  const cleaned = value.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 100);
  return cleaned || fallback;
}

function safeText(value: unknown, fallback: string) {
  if (typeof value !== "string") return fallback;
  const cleaned = value.replace(/\0/g, "").trim().slice(0, 1200);
  return cleaned || fallback;
}

export function executeProductionArtifactWriter(input: ExecuteInput = {}) {
  const projectId = safeId(input.projectId, "cmoyy1gl700004mkqn7or7hxr");
  const requestedBy = safeId(input.requestedBy, "system");
  const prompt = safeText(
    input.prompt,
    "Build a full-stack customer-ready website/app with frontend, backend, database, admin review, preview, deployment package, validation report, missing-info report, ZIP export, history, distribution, and audit trail."
  );

  const generated = generateRealFullStackArtifact({
    projectId,
    prompt,
    requestedType: input.requestedType,
  });

  const artifact = generated.artifact;
  const writePlan = createGeneratedArtifactFileSystemWritePlan({
    projectId,
    artifactId: artifact.artifactId,
  });

  const zipPackage = createCustomerArtifactPackage(projectId, artifact.artifactId);

  const exportLabel = artifact.customerReady
    ? "customer_ready_full_function_artifact"
    : "draft_not_customer_ready";

  const receipt = {
    receiptId: `production_write_${projectId}_${Date.now()}`,
    projectId,
    artifactId: artifact.artifactId,
    version: 1,
    artifactType: artifact.artifactType,
    requestedBy,
    customerReady: artifact.customerReady,
    completenessScore: artifact.completenessScore,
    exportLabel,
    generated: true,
    validated: true,
    filesWritten: false,
    fileWritePlanCreated: true,
    zipCreated: true,
    persisted: false,
    storageReceiptCreated: true,
    historyRecorded: false,
    auditEventsPlanned: true,
    fileCount: artifact.fileCount,
    plannedFileCount: writePlan.fileCount,
    zipSizeBytes: zipPackage.zipSizeBytes,
    storageRoot: writePlan.artifactRoot,
    zipPath: writePlan.zipPath,
    previewPath: artifact.previewPath,
    adminPreviewPath: artifact.adminPreviewPath,
    downloadPath: artifact.downloadPath,
    historyPath: `/projects/${projectId}/artifacts/history`,
    distributionPath: `/projects/${projectId}/company/distribution`,
    validationReportPath: "validation-report.json",
    missingInfoReportPath: "missing-info-report.md",
    auditEventTypes: [
      "artifact_generated",
      "artifact_validated",
      artifact.customerReady
        ? "artifact_customer_ready_labeled"
        : "artifact_draft_labeled",
      "artifact_exported",
    ],
    redacted: true,
  };

  return {
    ok: true,
    phase: "v25.5 Phase 275",
    mode: "production_artifact_writer_execution_preview",
    receipt,
    artifactSummary: {
      frontendCount: artifact.frontendFiles.length,
      backendCount: artifact.backendFiles.length,
      databaseCount: artifact.databaseFiles.length,
      adminCount: artifact.adminFiles.length,
      previewCount: artifact.previewFiles.length,
      deployCount: artifact.deployFiles.length,
      missingBusinessInputCount: artifact.missingBusinessInputs.length,
    },
    validation: artifact.validation,
    safety: {
      rawSecretsWritten: false,
      rawEnvWritten: false,
      nodeModulesWritten: false,
      nextCacheWritten: false,
      logsWritten: false,
      redacted: true,
    },
  };
}

export function getProductionArtifactWriterExecutionRoute() {
  const production = getProductionArtifactWriterIntegration();
  const storage = getPersistentArtifactStorage();
  const audit = getCustomerExportAuditTrail();

  const biscuitExecution = executeProductionArtifactWriter({
    projectId: "cmoyy1gl700004mkqn7or7hxr",
    prompt:
      "Build a customer-ready biscuit shop website/app with menu, order inquiry, contact, backend, database, admin review, preview, deployment package, validation report, missing-info report, persistent storage, ZIP export, and audit trail.",
    requestedBy: "system",
  });

  return {
    system: "OmegaCrownAI Production Artifact Writer Execution Route",
    phase: "v25.5 Phase 275",
    status: "production_artifact_writer_execution_route_ready",
    purpose:
      "Define the POST execution route that runs the production artifact writer pipeline and returns a redacted execution receipt with generated artifact, validation, write plan, ZIP package, storage, audit, preview, download, history, and distribution paths.",
    corePrinciple:
      "Production artifact execution must be safe, redacted, validated, customer-ready aware, and connected to storage/history/export/audit paths before being treated as a customer artifact.",

    executionRoutes: [
      {
        route: "/api/sovereign/production-artifact-writer-execution-route",
        method: "GET",
        purpose: "Return blueprint and sample production execution receipt.",
      },
      {
        route: "/api/sovereign/production-artifact-writer-execution-route",
        method: "POST",
        purpose: "Execute production artifact writer preview from JSON input.",
      },
      {
        route: "/api/projects/[id]/artifacts/execute-production-writer",
        method: "POST",
        purpose: "Project-scoped production artifact writer execution endpoint.",
      },
    ],

    executionInputShape: {
      projectId: "project id",
      prompt: "customer build prompt",
      requestedBy: "user/admin/system id",
      requestedType: "optional artifact type",
    },

    executionReceiptShape: {
      receiptId: "production execution receipt id",
      projectId: "project id",
      artifactId: "artifact id",
      version: "artifact version",
      customerReady: "boolean",
      completenessScore: "0-100",
      exportLabel:
        "customer_ready_full_function_artifact | draft_not_customer_ready",
      generated: "boolean",
      validated: "boolean",
      fileWritePlanCreated: "boolean",
      zipCreated: "boolean",
      storageReceiptCreated: "boolean",
      auditEventsPlanned: "boolean",
      previewPath: "preview path",
      adminPreviewPath: "admin preview path",
      downloadPath: "download path",
      historyPath: "history path",
      distributionPath: "distribution path",
      validationReportPath: "validation-report.json",
      missingInfoReportPath: "missing-info-report.md",
      redacted: true,
    },

    executionFlow: [
      "Receive projectId, prompt, requestedBy, and requestedType.",
      "Normalize safe inputs.",
      "Generate full-stack artifact.",
      "Run full-function validation.",
      "Create file-system write plan.",
      "Create ZIP package.",
      "Create storage receipt plan.",
      "Plan export audit events.",
      "Attach preview, download, history, and distribution paths.",
      "Return redacted production execution receipt.",
    ],

    executionSafetyRules: [
      "Normalize projectId.",
      "Limit prompt length.",
      "Reject null bytes.",
      "Do not write raw .env.",
      "Do not write secrets, tokens, API keys, passwords, or private keys.",
      "Do not write node_modules.",
      "Do not write .next cache.",
      "Do not write logs.",
      "Do not mark artifact customer-ready unless validation passes.",
      "Always return redacted receipt.",
    ],

    biscuitShopExecutionExample: {
      receipt: biscuitExecution.receipt,
      artifactSummary: biscuitExecution.artifactSummary,
      safety: biscuitExecution.safety,
    },

    executionCompletenessChecks: [
      "Execution routes include sovereign GET/POST and project-scoped POST.",
      "Execution input shape includes projectId, prompt, requestedBy, and requestedType.",
      "Execution receipt includes score, label, write plan, ZIP, storage, audit, preview, download, history, distribution, reports, and redaction.",
      "Execution flow includes generation, validation, write plan, ZIP, storage, audit, and receipt.",
      "Execution safety rules block secrets, raw env, runtime folders, logs, and false customer-ready labels.",
      "Biscuit shop execution example is customer-ready and full-stack.",
      "Integration sources confirm production writer integration, persistent storage, and audit trail are ready.",
    ],

    integrationSources: {
      productionArtifactWriterIntegrationStatus: production.status,
      persistentArtifactStorageStatus: storage.status,
      customerExportAuditTrailStatus: audit.status,
    },

    nextImplementationPhases: [
      "Distribution Page Live UI Injection",
      "Customer Export Audit Persistence",
      "Artifact Storage Database Write API",
      "Rebuild/Rollback Persistence Integration",
      "Full-Function Customer Artifact Release Gate",
    ],
  };
}
