import { NextResponse } from "next/server";
import { getArtifactRebuildRollbackControls } from "@/lib/sovereign/artifact-rebuild-rollback-controls";

const requiredLineageRules = [
  "Rebuilds must create a new artifact version.",
  "Rebuilds must set rebuildFromArtifactId.",
  "Rollbacks must create a new rollback version or explicit rollback record.",
  "Rollbacks must set rollbackFromArtifactId.",
  "Previous artifact records must not be overwritten.",
  "Customer-ready versions must remain visible after rebuilds.",
  "Blocked/draft versions must remain visible for audit and correction.",
  "Every version must keep validation and missing-info report links.",
];

const requiredRollbackSafetyRules = [
  "Rollback must require a reason.",
  "Rollback must not delete newer artifacts.",
  "Rollback must not restore secrets.",
  "Rollback must not bypass validation status display.",
  "Rollback must preserve audit/history references.",
  "Rollback must clearly label whether restored artifact is customer-ready or draft.",
  "Rollback must keep preview/download/report paths redacted and safe.",
];

export async function GET() {
  const controls = getArtifactRebuildRollbackControls();

  const missingLineageRules = requiredLineageRules.filter(
    (item) => !controls.lineageRules.includes(item)
  );

  const missingRollbackSafetyRules = requiredRollbackSafetyRules.filter(
    (item) => !controls.rollbackSafetyRules.includes(item)
  );

  const checks = [
    {
      name: "Artifact Rebuild/Rollback Controls are ready",
      passed: controls.status === "artifact_rebuild_rollback_controls_ready",
      detail: controls.status,
    },
    {
      name: "Rebuild control contract present",
      passed:
        controls.rebuildControlContract.route === "/api/projects/[id]/artifacts/[artifactId]/rebuild" &&
        controls.rebuildControlContract.createsNewVersion === true &&
        controls.rebuildControlContract.preservesSourceArtifact === true &&
        controls.rebuildControlContract.requiresValidation === true,
      detail: "Rebuild contract defined.",
    },
    {
      name: "Rollback control contract present",
      passed:
        controls.rollbackControlContract.route === "/api/projects/[id]/artifacts/[artifactId]/rollback" &&
        controls.rollbackControlContract.createsRollbackVersion === true &&
        controls.rollbackControlContract.preservesCurrentArtifact === true &&
        controls.rollbackControlContract.requiresRollbackReason === true,
      detail: "Rollback contract defined.",
    },
    {
      name: "Lineage rules present",
      passed: missingLineageRules.length === 0,
      detail: missingLineageRules.length ? `Missing: ${missingLineageRules.join(", ")}` : "Lineage rules present.",
    },
    {
      name: "Customer-ready preservation rules present",
      passed: controls.customerReadyPreservationRules.length >= 6,
      detail: `${controls.customerReadyPreservationRules.length} preservation rules`,
    },
    {
      name: "Blocked draft rebuild rules present",
      passed: controls.blockedDraftRebuildRules.length >= 5,
      detail: `${controls.blockedDraftRebuildRules.length} blocked draft rebuild rules`,
    },
    {
      name: "Rollback safety rules present",
      passed: missingRollbackSafetyRules.length === 0,
      detail: missingRollbackSafetyRules.length
        ? `Missing: ${missingRollbackSafetyRules.join(", ")}`
        : "Rollback safety rules present.",
    },
    {
      name: "Rebuild and rollback receipt shapes present",
      passed:
        Boolean(controls.rebuildReceiptShape.rebuildId) &&
        Boolean(controls.rebuildReceiptShape.newArtifactId) &&
        Boolean(controls.rebuildReceiptShape.validationReportPath) &&
        controls.rebuildReceiptShape.redacted === true &&
        Boolean(controls.rollbackReceiptShape.rollbackId) &&
        Boolean(controls.rollbackReceiptShape.rollbackReason) &&
        controls.rollbackReceiptShape.redacted === true,
      detail: "Receipt shapes defined.",
    },
    {
      name: "Biscuit shop rebuild/rollback example present",
      passed:
        controls.biscuitShopRebuildRollbackExample.blockedDraft.customerReady === false &&
        controls.biscuitShopRebuildRollbackExample.blockedDraft.completenessScore === 15 &&
        controls.biscuitShopRebuildRollbackExample.rebuiltFullStack.customerReady === true &&
        controls.biscuitShopRebuildRollbackExample.rebuiltFullStack.completenessScore === 100 &&
        controls.biscuitShopRebuildRollbackExample.rollbackScenario.allowed === true,
      detail: "Biscuit shop v1/v2/rollback example defined.",
    },
    {
      name: "Controls completeness checks present",
      passed: controls.controlsCompletenessChecks.length >= 9,
      detail: `${controls.controlsCompletenessChecks.length} checks`,
    },
    {
      name: "Integration sources present",
      passed:
        controls.integrationSources.persistentArtifactStorageStatus === "persistent_artifact_storage_ready" &&
        controls.integrationSources.artifactHistoryUiStatus === "artifact_history_ui_upgrade_ready" &&
        controls.integrationSources.realCustomerBundleExportStatus === "real_customer_website_app_bundle_export_ready" &&
        controls.integrationSources.validationRunnerStatus === "website_full_function_validation_runner_ready",
      detail: "Persistent storage, history UI, export, and validation linked.",
    },
  ];

  const passedChecks = checks.filter((check) => check.passed).length;

  return NextResponse.json({
    ok: checks.every((check) => check.passed),
    phase: "v24.9 Phase 269",
    service: "Artifact Rebuild/Rollback Controls Smoke Test",
    totalChecks: checks.length,
    passedChecks,
    failedChecks: checks.length - passedChecks,
    lineageRuleCount: controls.lineageRules.length,
    preservationRuleCount: controls.customerReadyPreservationRules.length,
    blockedDraftRebuildRuleCount: controls.blockedDraftRebuildRules.length,
    rollbackSafetyRuleCount: controls.rollbackSafetyRules.length,
    controlsCompletenessCheckCount: controls.controlsCompletenessChecks.length,
    biscuitBlockedScore: controls.biscuitShopRebuildRollbackExample.blockedDraft.completenessScore,
    biscuitRebuiltScore: controls.biscuitShopRebuildRollbackExample.rebuiltFullStack.completenessScore,
    checks,
  });
}
