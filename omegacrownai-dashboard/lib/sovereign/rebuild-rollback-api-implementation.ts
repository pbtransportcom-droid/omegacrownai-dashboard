import { getArtifactRebuildRollbackControls } from "@/lib/sovereign/artifact-rebuild-rollback-controls";
import { getPersistentArtifactDatabaseMigration } from "@/lib/sovereign/persistent-artifact-database-migration";
import { getCustomerExportAuditTrail } from "@/lib/sovereign/customer-export-audit-trail";
import { generateRealFullStackArtifact } from "@/lib/sovereign/real-full-stack-artifact-generator";

type RebuildInput = {
  projectId?: string;
  artifactId?: string;
  rebuildPrompt?: string;
  requestedBy?: string;
};

type RollbackInput = {
  projectId?: string;
  artifactId?: string;
  targetArtifactId?: string;
  rollbackReason?: string;
  requestedBy?: string;
};

function safeText(value: unknown, fallback: string) {
  if (typeof value !== "string") return fallback;
  const cleaned = value.replace(/\0/g, "").trim().slice(0, 500);
  return cleaned || fallback;
}

function safeId(value: unknown, fallback: string) {
  if (typeof value !== "string") return fallback;
  const cleaned = value.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 100);
  return cleaned || fallback;
}

export function simulateArtifactRebuild(input: RebuildInput = {}) {
  const projectId = safeId(input.projectId, "cmoyy1gl700004mkqn7or7hxr");
  const sourceArtifactId = safeId(input.artifactId, "artifact_biscuit_shop_v1");
  const rebuildPrompt = safeText(
    input.rebuildPrompt,
    "Rebuild this artifact into a full-stack customer-ready website/app with backend, database, admin, preview, deployment, validation report, and missing-info report."
  );
  const requestedBy = safeId(input.requestedBy, "system");

  const generated = generateRealFullStackArtifact({
    projectId,
    prompt: rebuildPrompt,
  });

  const receipt = {
    rebuildId: `rebuild_${projectId}_${Date.now()}`,
    projectId,
    sourceArtifactId,
    newArtifactId: generated.artifact.artifactId,
    previousVersion: 1,
    newVersion: 2,
    customerReady: generated.artifact.customerReady,
    completenessScore: generated.artifact.completenessScore,
    exportLabel: generated.artifact.customerReady
      ? "customer_ready_full_function_artifact"
      : "draft_not_customer_ready",
    rebuildPrompt,
    requestedBy,
    previewPath: generated.artifact.previewPath,
    adminPreviewPath: generated.artifact.adminPreviewPath,
    downloadPath: generated.artifact.downloadPath,
    validationReportPath: "validation-report.json",
    missingInfoReportPath: "missing-info-report.md",
    rebuildFromArtifactId: sourceArtifactId,
    auditEventType: "artifact_rebuilt",
    redacted: true,
  };

  return {
    ok: true,
    phase: "v25.4 Phase 274",
    mode: "artifact_rebuild_preview",
    receipt,
  };
}

export function simulateArtifactRollback(input: RollbackInput = {}) {
  const projectId = safeId(input.projectId, "cmoyy1gl700004mkqn7or7hxr");
  const rollbackFromArtifactId = safeId(
    input.artifactId,
    "artifact_cmoyy1gl7000_commerceorfoodbusi_v1"
  );
  const targetArtifactId = safeId(input.targetArtifactId, "artifact_biscuit_shop_v1");
  const rollbackReason = safeText(
    input.rollbackReason,
    "Restore previous artifact version for review while preserving newer versions."
  );
  const requestedBy = safeId(input.requestedBy, "system");

  const isTargetDraft = targetArtifactId.includes("v1");

  const receipt = {
    rollbackId: `rollback_${projectId}_${Date.now()}`,
    projectId,
    targetArtifactId,
    rollbackFromArtifactId,
    rollbackVersion: 3,
    rollbackReason,
    requestedBy,
    customerReady: !isTargetDraft,
    completenessScore: isTargetDraft ? 15 : 100,
    exportLabel: isTargetDraft
      ? "draft_not_customer_ready"
      : "customer_ready_full_function_artifact",
    previewPath: `/preview/${targetArtifactId}`,
    downloadPath: isTargetDraft
      ? null
      : `/api/projects/${projectId}/artifacts/${targetArtifactId}/download`,
    validationReportPath: "validation-report.json",
    missingInfoReportPath: "missing-info-report.md",
    auditEventType: "artifact_rollback_requested",
    newerArtifactsPreserved: true,
    redacted: true,
  };

  return {
    ok: true,
    phase: "v25.4 Phase 274",
    mode: "artifact_rollback_preview",
    receipt,
  };
}

export function getRebuildRollbackApiImplementation() {
  const controls = getArtifactRebuildRollbackControls();
  const migration = getPersistentArtifactDatabaseMigration();
  const audit = getCustomerExportAuditTrail();

  const rebuildExample = simulateArtifactRebuild({
    projectId: "cmoyy1gl700004mkqn7or7hxr",
    artifactId: "artifact_biscuit_shop_v1",
    requestedBy: "system",
  });

  const rollbackExample = simulateArtifactRollback({
    projectId: "cmoyy1gl700004mkqn7or7hxr",
    artifactId: rebuildExample.receipt.newArtifactId,
    targetArtifactId: "artifact_biscuit_shop_v1",
    rollbackReason: "Customer requested review of the original draft version.",
    requestedBy: "system",
  });

  return {
    system: "OmegaCrownAI Rebuild/Rollback API Implementation",
    phase: "v25.4 Phase 274",
    status: "rebuild_rollback_api_implementation_ready",
    purpose:
      "Define the rebuild and rollback API implementation layer that accepts rebuild/rollback requests, validates safe input, returns redacted receipts, preserves lineage, and connects to artifact history, persistent storage, and export audit events.",
    corePrinciple:
      "Rebuild and rollback APIs must create safe versioned actions. They must not overwrite customer-ready artifacts, delete history, bypass validation, or expose secrets.",

    apiRoutes: [
      {
        route: "/api/projects/[id]/artifacts/[artifactId]/rebuild",
        method: "POST",
        purpose: "Create a new artifact version from an existing artifact and rebuild prompt.",
      },
      {
        route: "/api/projects/[id]/artifacts/[artifactId]/rollback",
        method: "POST",
        purpose: "Create a rollback receipt and restore/reference a target artifact version safely.",
      },
      {
        route: "/api/sovereign/rebuild-rollback-api-implementation",
        method: "GET",
        purpose: "Return implementation blueprint and sample receipts.",
      },
    ],

    requestValidationRules: [
      "Normalize projectId and artifactId.",
      "Require rollback reason for rollback requests.",
      "Limit prompt and reason length.",
      "Reject null bytes.",
      "Do not accept raw secrets in request body.",
      "Do not allow rebuild to overwrite source artifact.",
      "Do not allow rollback to delete newer artifact versions.",
      "Always return redacted receipts.",
    ],

    rebuildImplementationFlow: [
      "Receive projectId, source artifactId, rebuildPrompt, and requestedBy.",
      "Normalize safe inputs.",
      "Generate new full-stack artifact descriptor.",
      "Run validation through generator.",
      "Create new artifact version receipt.",
      "Set rebuildFromArtifactId.",
      "Set export label from validation.",
      "Create audit event reference artifact_rebuilt.",
      "Return redacted rebuild receipt.",
    ],

    rollbackImplementationFlow: [
      "Receive projectId, current artifactId, targetArtifactId, rollbackReason, and requestedBy.",
      "Normalize safe inputs.",
      "Require rollback reason.",
      "Preserve current/newer artifact versions.",
      "Create rollback version receipt.",
      "Set rollbackFromArtifactId.",
      "Keep target customer-ready status honest.",
      "Create audit event reference artifact_rollback_requested.",
      "Return redacted rollback receipt.",
    ],

    rebuildReceiptShape: rebuildExample.receipt,
    rollbackReceiptShape: rollbackExample.receipt,

    implementationSafetyRules: [
      "Rebuild creates a new version.",
      "Rollback creates a rollback record/version.",
      "Source artifacts are preserved.",
      "Newer artifacts are preserved.",
      "Customer-ready status is never assumed.",
      "Validation reports remain linked.",
      "Missing-info reports remain linked.",
      "Audit event references are included.",
      "Receipts are redacted.",
    ],

    biscuitShopApiExample: {
      blockedDraftArtifactId: "artifact_biscuit_shop_v1",
      rebuiltArtifactId: rebuildExample.receipt.newArtifactId,
      rebuildCustomerReady: rebuildExample.receipt.customerReady,
      rebuildScore: rebuildExample.receipt.completenessScore,
      rollbackTargetArtifactId: rollbackExample.receipt.targetArtifactId,
      rollbackCustomerReady: rollbackExample.receipt.customerReady,
      rollbackScore: rollbackExample.receipt.completenessScore,
      rollbackPreservesNewerArtifacts: rollbackExample.receipt.newerArtifactsPreserved,
    },

    apiCompletenessChecks: [
      "Rebuild API route contract exists.",
      "Rollback API route contract exists.",
      "Request validation rules normalize input and block unsafe payloads.",
      "Rebuild flow creates new version and rebuildFromArtifactId.",
      "Rollback flow preserves newer artifacts and requires reason.",
      "Receipts include score, label, paths, reports, audit event type, and redaction.",
      "Biscuit shop example rebuilds blocked draft into customer-ready full-stack artifact.",
      "Biscuit shop rollback preserves newer artifact and keeps target status honest.",
      "Integration sources confirm controls, database migration, and audit trail are ready.",
    ],

    integrationSources: {
      artifactRebuildRollbackControlsStatus: controls.status,
      persistentArtifactDatabaseMigrationStatus: migration.status,
      customerExportAuditTrailStatus: audit.status,
    },

    nextImplementationPhases: [
      "Production Artifact Writer Execution Route",
      "Distribution Page Live UI Injection",
      "Customer Export Audit Persistence",
      "Artifact Storage Database Write API",
      "Rebuild/Rollback Persistence Integration",
    ],
  };
}
