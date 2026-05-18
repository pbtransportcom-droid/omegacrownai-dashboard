import { getPersistentArtifactStorage } from "@/lib/sovereign/persistent-artifact-storage";
import { getArtifactHistoryUiUpgrade } from "@/lib/sovereign/artifact-history-ui-upgrade";
import { getRealCustomerWebsiteAppBundleExport } from "@/lib/sovereign/real-customer-website-app-bundle-export";
import { getWebsiteFullFunctionValidationRunner } from "@/lib/sovereign/website-full-function-validation-runner";

export function getArtifactRebuildRollbackControls() {
  const storage = getPersistentArtifactStorage();
  const historyUi = getArtifactHistoryUiUpgrade();
  const exportLayer = getRealCustomerWebsiteAppBundleExport();
  const validationRunner = getWebsiteFullFunctionValidationRunner();

  return {
    system: "OmegaCrownAI Artifact Rebuild/Rollback Controls",
    phase: "v24.9 Phase 269",
    status: "artifact_rebuild_rollback_controls_ready",
    purpose:
      "Define rebuild and rollback controls for generated website/app artifacts so customers can rebuild drafts, preserve customer-ready versions, roll back safely, and keep lineage/audit references.",
    corePrinciple:
      "Artifact rebuilds and rollbacks must be safe, versioned, reversible, and honest. They must not overwrite customer-ready exports or hide failed drafts.",

    rebuildControlContract: {
      route: "/api/projects/[id]/artifacts/[artifactId]/rebuild",
      method: "POST",
      createsNewVersion: true,
      preservesSourceArtifact: true,
      requiresValidation: true,
      storesLineage: true,
      outputLabel:
        "customer_ready_full_function_artifact | draft_not_customer_ready | blocked_missing_required_functionality",
      requiredInputs: [
        "projectId",
        "sourceArtifactId",
        "rebuildPrompt",
        "requestedBy",
      ],
      generatedOutputs: [
        "new artifactId",
        "new version",
        "new validation report",
        "new missing-info report",
        "new preview path",
        "new download path",
        "rebuildFromArtifactId reference",
      ],
    },

    rollbackControlContract: {
      route: "/api/projects/[id]/artifacts/[artifactId]/rollback",
      method: "POST",
      createsRollbackVersion: true,
      preservesCurrentArtifact: true,
      requiresRollbackReason: true,
      storesLineage: true,
      requiredInputs: [
        "projectId",
        "targetArtifactId",
        "rollbackReason",
        "requestedBy",
      ],
      generatedOutputs: [
        "rollback artifact version",
        "rollbackFromArtifactId reference",
        "restored preview path",
        "restored download path",
        "rollback receipt",
        "audit event reference",
      ],
    },

    lineageRules: [
      "Rebuilds must create a new artifact version.",
      "Rebuilds must set rebuildFromArtifactId.",
      "Rollbacks must create a new rollback version or explicit rollback record.",
      "Rollbacks must set rollbackFromArtifactId.",
      "Previous artifact records must not be overwritten.",
      "Customer-ready versions must remain visible after rebuilds.",
      "Blocked/draft versions must remain visible for audit and correction.",
      "Every version must keep validation and missing-info report links.",
    ],

    customerReadyPreservationRules: [
      "Do not overwrite a customer-ready artifact with a draft rebuild.",
      "Do not remove a previous customer-ready download path during rebuild.",
      "Do not mark a rebuild customer-ready unless full validation passes.",
      "Do not hide old customer-ready versions after rollback.",
      "Show the active recommended version separately from historical versions.",
      "Keep export label and score per artifact version.",
    ],

    blockedDraftRebuildRules: [
      "Homepage-only blocked artifacts may be rebuilt into full-stack artifacts.",
      "A blocked draft rebuild must include missing backend/API, database/schema, admin, preview, deploy, validation, and missing-info layers.",
      "Rebuild prompt should preserve original customer intent unless user changes it.",
      "Blocked reasons should be carried forward into the rebuild receipt.",
      "A successful rebuild should link back to the blocked source artifact.",
    ],

    rollbackSafetyRules: [
      "Rollback must require a reason.",
      "Rollback must not delete newer artifacts.",
      "Rollback must not restore secrets.",
      "Rollback must not bypass validation status display.",
      "Rollback must preserve audit/history references.",
      "Rollback must clearly label whether restored artifact is customer-ready or draft.",
      "Rollback must keep preview/download/report paths redacted and safe.",
    ],

    rebuildReceiptShape: {
      rebuildId: "rebuild event id",
      projectId: "project id",
      sourceArtifactId: "artifact being rebuilt",
      newArtifactId: "new artifact id",
      previousVersion: "number",
      newVersion: "number",
      customerReady: "boolean",
      completenessScore: "0-100",
      exportLabel: "export label",
      rebuildPrompt: "prompt used for rebuild",
      previewPath: "new preview path",
      downloadPath: "new download path",
      validationReportPath: "validation-report.json",
      missingInfoReportPath: "missing-info-report.md",
      redacted: true,
    },

    rollbackReceiptShape: {
      rollbackId: "rollback event id",
      projectId: "project id",
      targetArtifactId: "artifact restored",
      rollbackFromArtifactId: "current artifact being rolled back from",
      rollbackVersion: "number",
      rollbackReason: "required reason",
      customerReady: "boolean",
      completenessScore: "0-100",
      previewPath: "restored preview path",
      downloadPath: "restored download path",
      validationReportPath: "validation-report.json",
      missingInfoReportPath: "missing-info-report.md",
      redacted: true,
    },

    biscuitShopRebuildRollbackExample: {
      projectId: "cmoyy1gl700004mkqn7or7hxr",
      blockedDraft: {
        artifactId: "artifact_biscuit_shop_v1",
        version: 1,
        customerReady: false,
        completenessScore: 15,
        blockedReason:
          "Homepage-only output missing backend/API, database/schema, admin review, preview, deploy, validation, and missing-info report.",
      },
      rebuiltFullStack: {
        artifactId: exportLayer.biscuitShopExportExample.artifactId,
        version: 2,
        rebuildFromArtifactId: "artifact_biscuit_shop_v1",
        customerReady: true,
        completenessScore: 100,
        previewPath: exportLayer.biscuitShopExportExample.previewPath,
        downloadPath: exportLayer.biscuitShopExportExample.downloadPath,
      },
      rollbackScenario: {
        rollbackFromArtifactId: exportLayer.biscuitShopExportExample.artifactId,
        targetArtifactId: "artifact_biscuit_shop_v1",
        allowed: true,
        resultLabel:
          "rollback_allowed_but_target_remains_draft_not_customer_ready",
        reason:
          "Rollback is allowed for history restoration, but the target artifact remains blocked/draft if validation did not pass.",
      },
    },

    controlsCompletenessChecks: [
      "Rebuild control contract exists.",
      "Rollback control contract exists.",
      "Lineage rules preserve rebuild and rollback references.",
      "Customer-ready preservation rules prevent overwriting good versions with drafts.",
      "Blocked draft rebuild rules support converting homepage-only drafts into full-stack artifacts.",
      "Rollback safety rules require reason and preserve history.",
      "Rebuild and rollback receipt shapes include score, status, paths, reports, and redaction.",
      "Biscuit shop example shows blocked v1, rebuilt customer-ready v2, and safe rollback behavior.",
      "Integration sources confirm persistent storage, history UI, export, and validation are ready.",
    ],

    integrationSources: {
      persistentArtifactStorageStatus: storage.status,
      artifactHistoryUiStatus: historyUi.status,
      realCustomerBundleExportStatus: exportLayer.status,
      validationRunnerStatus: validationRunner.status,
    },

    nextImplementationPhases: [
      "Production Artifact Writer Integration",
      "Project Distribution Live Data Binding",
      "Customer Export Audit Trail",
      "Persistent Artifact Database Migration",
      "Rebuild/Rollback API Implementation",
    ],
  };
}
