import { NextResponse } from "next/server";
import {
  evaluateCustomerArtifactBillingEntitlementGate,
  getCustomerArtifactBillingEntitlementGate,
} from "@/lib/sovereign/customer-artifact-billing-entitlement-gate";

const requiredRules = [
  "Final ZIP download requires releaseAllowed true.",
  "Final ZIP download requires active paid entitlement or owner override.",
  "Trial entitlement allows preview only.",
  "Expired entitlement blocks preview and download.",
  "Homepage-only artifacts remain blocked even with paid entitlement.",
  "Missing-backend artifacts remain blocked even with paid entitlement.",
  "Owner override must still respect release-gate safety.",
  "Every entitlement decision must be redacted.",
  "Every blocked entitlement decision must include blocked reasons.",
  "Entitlement gate must not expose secrets, tokens, or raw billing provider payloads.",
];

const requiredSafetyRules = [
  "Do not expose raw payment provider payloads.",
  "Do not expose billing secrets.",
  "Do not expose customer payment method data.",
  "Do not allow final ZIP download for draft or blocked artifacts.",
  "Do not allow final ZIP download when entitlement is expired.",
  "Do not bypass release gate for paid customers.",
  "Do not bypass release gate for owner override.",
  "Return redacted entitlement receipts only.",
];

export async function GET() {
  const gate = getCustomerArtifactBillingEntitlementGate();

  const paidActive = evaluateCustomerArtifactBillingEntitlementGate({
    projectId: "cmoyy1gl700004mkqn7or7hxr",
    requestedBy: "system",
    artifactMode: "full_stack",
    entitlementMode: "paid_active",
  });

  const trialPreview = evaluateCustomerArtifactBillingEntitlementGate({
    projectId: "cmoyy1gl700004mkqn7or7hxr",
    requestedBy: "system",
    artifactMode: "full_stack",
    entitlementMode: "trial_preview",
  });

  const expired = evaluateCustomerArtifactBillingEntitlementGate({
    projectId: "cmoyy1gl700004mkqn7or7hxr",
    requestedBy: "system",
    artifactMode: "full_stack",
    entitlementMode: "expired",
  });

  const homepageOnly = evaluateCustomerArtifactBillingEntitlementGate({
    projectId: "cmoyy1gl700004mkqn7or7hxr",
    requestedBy: "system",
    artifactMode: "homepage_only",
    entitlementMode: "paid_active",
  });

  const missingRules = requiredRules.filter(
    (rule) => !gate.entitlementRules.includes(rule)
  );

  const missingSafetyRules = requiredSafetyRules.filter(
    (rule) => !gate.entitlementSafetyRules.includes(rule)
  );

  const checks = [
    {
      name: "Customer Artifact Billing/Entitlement Gate is ready",
      passed: gate.status === "customer_artifact_billing_entitlement_gate_ready",
      detail: gate.status,
    },
    {
      name: "Entitlement gate contract present",
      passed:
        gate.entitlementGateContract.requiresReleaseGate === true &&
        gate.entitlementGateContract.requiresActiveEntitlementForDownload === true &&
        gate.entitlementGateContract.allowsTrialPreviewOnly === true &&
        gate.entitlementGateContract.redacted === true,
      detail: "Entitlement contract defined.",
    },
    {
      name: "Entitlement modes present",
      passed: gate.entitlementModes.length >= 5,
      detail: `${gate.entitlementModes.length} modes`,
    },
    {
      name: "Gated actions present",
      passed: gate.gatedActions.length >= 9,
      detail: `${gate.gatedActions.length} gated actions`,
    },
    {
      name: "Entitlement rules present",
      passed: missingRules.length === 0,
      detail: missingRules.length ? `Missing: ${missingRules.join(", ")}` : "Rules present.",
    },
    {
      name: "Entitlement receipt shape present",
      passed:
        Boolean(gate.entitlementReceiptShape.entitlementGateId) &&
        Boolean(gate.entitlementReceiptShape.auditEventType) &&
        Boolean(gate.entitlementReceiptShape.blockedReasons) &&
        gate.entitlementReceiptShape.redacted === true,
      detail: "Receipt shape defined.",
    },
    {
      name: "Paid active full-stack allows final delivery",
      passed:
        paidActive.entitlementReceipt.releaseAllowed === true &&
        paidActive.entitlementReceipt.downloadAllowed === true &&
        paidActive.entitlementReceipt.finalDeliveryAllowed === true &&
        paidActive.entitlementReceipt.completenessScore === 100,
      detail: `score ${paidActive.entitlementReceipt.completenessScore}`,
    },
    {
      name: "Trial preview blocks final ZIP delivery",
      passed:
        trialPreview.entitlementReceipt.previewAllowed === true &&
        trialPreview.entitlementReceipt.downloadAllowed === false &&
        trialPreview.entitlementReceipt.finalDeliveryAllowed === false &&
        trialPreview.entitlementReceipt.blockedReasons.length >= 1,
      detail: `${trialPreview.entitlementReceipt.blockedReasons.length} blocked reasons`,
    },
    {
      name: "Expired entitlement blocks delivery",
      passed:
        expired.entitlementReceipt.downloadAllowed === false &&
        expired.entitlementReceipt.finalDeliveryAllowed === false &&
        expired.entitlementReceipt.blockedReasons.length >= 1,
      detail: `${expired.entitlementReceipt.blockedReasons.length} blocked reasons`,
    },
    {
      name: "Homepage-only artifact blocked even with paid entitlement",
      passed:
        homepageOnly.entitlementReceipt.releaseAllowed === false &&
        homepageOnly.entitlementReceipt.finalDeliveryAllowed === false &&
        homepageOnly.entitlementReceipt.completenessScore === 15,
      detail: `score ${homepageOnly.entitlementReceipt.completenessScore}`,
    },
    {
      name: "Entitlement safety rules present",
      passed: missingSafetyRules.length === 0,
      detail: missingSafetyRules.length ? `Missing: ${missingSafetyRules.join(", ")}` : "Safety rules present.",
    },
    {
      name: "Completeness checks present",
      passed: gate.entitlementCompletenessChecks.length >= 9,
      detail: `${gate.entitlementCompletenessChecks.length} checks`,
    },
    {
      name: "Integration sources present",
      passed:
        gate.integrationSources.customerExportAuditPersistenceStatus === "customer_export_audit_persistence_ready",
      detail: "Audit persistence linked.",
    },
  ];

  const passedChecks = checks.filter((check) => check.passed).length;

  return NextResponse.json({
    ok: checks.every((check) => check.passed),
    phase: "v26.2 Phase 282",
    service: "Customer Artifact Billing/Entitlement Gate Smoke Test",
    totalChecks: checks.length,
    passedChecks,
    failedChecks: checks.length - passedChecks,
    entitlementModeCount: gate.entitlementModes.length,
    gatedActionCount: gate.gatedActions.length,
    entitlementRuleCount: gate.entitlementRules.length,
    entitlementSafetyRuleCount: gate.entitlementSafetyRules.length,
    entitlementCompletenessCheckCount: gate.entitlementCompletenessChecks.length,
    paidActiveFinalDeliveryAllowed:
      paidActive.entitlementReceipt.finalDeliveryAllowed,
    trialPreviewFinalDeliveryAllowed:
      trialPreview.entitlementReceipt.finalDeliveryAllowed,
    expiredFinalDeliveryAllowed:
      expired.entitlementReceipt.finalDeliveryAllowed,
    homepageOnlyFinalDeliveryAllowed:
      homepageOnly.entitlementReceipt.finalDeliveryAllowed,
    checks,
  });
}
