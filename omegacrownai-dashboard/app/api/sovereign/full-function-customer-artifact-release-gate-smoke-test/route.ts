import { NextResponse } from "next/server";
import {
  evaluateCustomerArtifactReleaseGate,
  getFullFunctionCustomerArtifactReleaseGate,
} from "@/lib/sovereign/full-function-customer-artifact-release-gate";

const requiredLayers = [
  "frontend",
  "backend_api",
  "database_schema",
  "admin_review",
  "preview_sandbox",
  "deploy_export",
];

const requiredGateRules = [
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
];

export async function GET() {
  const gate = getFullFunctionCustomerArtifactReleaseGate();

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

  const missingBackend = evaluateCustomerArtifactReleaseGate({
    projectId: "cmoyy1gl700004mkqn7or7hxr",
    requestedBy: "system",
    artifactMode: "missing_backend",
  });

  const missingLayers = requiredLayers.filter(
    (layer) => !gate.requiredLayerGate.includes(layer)
  );

  const missingRules = requiredGateRules.filter(
    (rule) => !gate.gateRules.includes(rule)
  );

  const checks = [
    {
      name: "Full-Function Customer Artifact Release Gate is ready",
      passed: gate.status === "full_function_customer_artifact_release_gate_ready",
      detail: gate.status,
    },
    {
      name: "Release gate contract present",
      passed:
        gate.releaseGateContract.minimumScore === 90 &&
        gate.releaseGateContract.requiredReleaseLabel === "customer_ready_full_function_artifact" &&
        gate.releaseGateContract.blockedLabel === "blocked_missing_required_functionality" &&
        gate.releaseGateContract.redacted === true,
      detail: "Release gate contract defined.",
    },
    {
      name: "Required layer gate present",
      passed: missingLayers.length === 0,
      detail: missingLayers.length ? `Missing: ${missingLayers.join(", ")}` : "All required layers present.",
    },
    {
      name: "Gate checklist present",
      passed: gate.gateChecklist.length >= 17,
      detail: `${gate.gateChecklist.length} checklist items`,
    },
    {
      name: "Gate rules present",
      passed: missingRules.length === 0,
      detail: missingRules.length ? `Missing: ${missingRules.join(", ")}` : "All gate rules present.",
    },
    {
      name: "Release receipt shape present",
      passed:
        Boolean(gate.releaseReceiptShape.releaseGateId) &&
        Boolean(gate.releaseReceiptShape.exportLabel) &&
        Boolean(gate.releaseReceiptShape.failedReasons) &&
        gate.releaseReceiptShape.redacted === true,
      detail: "Receipt shape defined.",
    },
    {
      name: "Full-stack artifact passes release gate",
      passed:
        fullStack.releaseReceipt.releaseAllowed === true &&
        fullStack.releaseReceipt.customerReady === true &&
        fullStack.releaseReceipt.completenessScore === 100 &&
        fullStack.releaseReceipt.requiredLayersPresent === true &&
        fullStack.releaseReceipt.exportLabel === "customer_ready_full_function_artifact",
      detail: `score ${fullStack.releaseReceipt.completenessScore}`,
    },
    {
      name: "Homepage-only artifact is blocked",
      passed:
        homepageOnly.releaseReceipt.releaseAllowed === false &&
        homepageOnly.releaseReceipt.customerReady === false &&
        homepageOnly.releaseReceipt.completenessScore === 15 &&
        homepageOnly.releaseReceipt.failedReasons.length >= 1,
      detail: `${homepageOnly.releaseReceipt.failedReasons.length} failed reasons`,
    },
    {
      name: "Missing-backend artifact is blocked",
      passed:
        missingBackend.releaseReceipt.releaseAllowed === false &&
        missingBackend.releaseReceipt.customerReady === false &&
        missingBackend.releaseReceipt.completenessScore === 55 &&
        missingBackend.releaseReceipt.failedReasons.length >= 1,
      detail: `${missingBackend.releaseReceipt.failedReasons.length} failed reasons`,
    },
    {
      name: "Release samples are present",
      passed:
        gate.sampleReleaseEvaluations.fullStack.releaseAllowed === true &&
        gate.sampleReleaseEvaluations.homepageOnly.releaseAllowed === false,
      detail: "Sample release evaluations present.",
    },
    {
      name: "Completeness checks present",
      passed: gate.releaseGateCompletenessChecks.length >= 8,
      detail: `${gate.releaseGateCompletenessChecks.length} checks`,
    },
    {
      name: "Integration sources present",
      passed:
        gate.integrationSources.rebuildRollbackPersistenceIntegrationStatus === "rebuild_rollback_persistence_integration_ready" &&
        gate.integrationSources.customerExportAuditPersistenceStatus === "customer_export_audit_persistence_ready",
      detail: "Rebuild/rollback persistence and audit persistence linked.",
    },
  ];

  const passedChecks = checks.filter((check) => check.passed).length;

  return NextResponse.json({
    ok: checks.every((check) => check.passed),
    phase: "v26.0 Phase 280",
    service: "Full-Function Customer Artifact Release Gate Smoke Test",
    totalChecks: checks.length,
    passedChecks,
    failedChecks: checks.length - passedChecks,
    requiredLayerCount: gate.requiredLayerGate.length,
    gateChecklistCount: gate.gateChecklist.length,
    gateRuleCount: gate.gateRules.length,
    releaseGateCompletenessCheckCount: gate.releaseGateCompletenessChecks.length,
    fullStackReleaseAllowed: fullStack.releaseReceipt.releaseAllowed,
    fullStackScore: fullStack.releaseReceipt.completenessScore,
    homepageOnlyReleaseAllowed: homepageOnly.releaseReceipt.releaseAllowed,
    homepageOnlyScore: homepageOnly.releaseReceipt.completenessScore,
    missingBackendReleaseAllowed: missingBackend.releaseReceipt.releaseAllowed,
    missingBackendScore: missingBackend.releaseReceipt.completenessScore,
    checks,
  });
}
