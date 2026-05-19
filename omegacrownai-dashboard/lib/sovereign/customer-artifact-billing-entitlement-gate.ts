import { evaluateCustomerArtifactReleaseGate } from "@/lib/sovereign/full-function-customer-artifact-release-gate";
import { simulateProductionWebsiteAppFileWrite } from "@/lib/sovereign/production-website-app-generator-file-writer";
import { getCustomerExportAuditPersistence } from "@/lib/sovereign/customer-export-audit-persistence";

type EntitlementMode =
  | "paid_active"
  | "owner_override"
  | "trial_preview"
  | "expired"
  | "blocked_draft";

type EntitlementGateInput = {
  projectId?: string;
  artifactId?: string;
  requestedBy?: string;
  artifactMode?: "full_stack" | "homepage_only" | "missing_backend";
  entitlementMode?: EntitlementMode;
};

function safeId(value: unknown, fallback: string) {
  if (typeof value !== "string") return fallback;
  const cleaned = value.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 100);
  return cleaned || fallback;
}

function safeEntitlementMode(value: unknown): EntitlementMode {
  if (
    value === "paid_active" ||
    value === "owner_override" ||
    value === "trial_preview" ||
    value === "expired" ||
    value === "blocked_draft"
  ) {
    return value;
  }

  return "paid_active";
}

export function evaluateCustomerArtifactBillingEntitlementGate(
  input: EntitlementGateInput = {}
) {
  const projectId = safeId(input.projectId, "cmoyy1gl700004mkqn7or7hxr");
  const artifactId = safeId(input.artifactId, "latest");
  const requestedBy = safeId(input.requestedBy, "system");
  const artifactMode = input.artifactMode || "full_stack";
  const entitlementMode = safeEntitlementMode(input.entitlementMode);

  const releaseGate = evaluateCustomerArtifactReleaseGate({
    projectId,
    requestedBy,
    artifactMode,
  });

  const fileWriter = simulateProductionWebsiteAppFileWrite({
    projectId,
    artifactId: artifactId === "latest" ? undefined : artifactId,
    requestedBy,
    artifactMode,
  });

  const releaseAllowed = releaseGate.releaseReceipt.releaseAllowed === true;
  const hasPaidEntitlement =
    entitlementMode === "paid_active" || entitlementMode === "owner_override";
  const ownerOverride = entitlementMode === "owner_override";
  const trialPreviewOnly = entitlementMode === "trial_preview";
  const entitlementExpired = entitlementMode === "expired";

  const previewAllowed =
    releaseAllowed && (hasPaidEntitlement || trialPreviewOnly || ownerOverride);

  const downloadAllowed =
    releaseAllowed && hasPaidEntitlement && !entitlementExpired && !trialPreviewOnly;

  const finalDeliveryAllowed =
    releaseAllowed &&
    hasPaidEntitlement &&
    fileWriter.writeReceipt.releaseAllowed === true &&
    fileWriter.outputManifest.zipReady === true;

  const blockedReasons = [
    ...(!releaseAllowed ? ["Artifact release gate did not pass."] : []),
    ...(!hasPaidEntitlement && !trialPreviewOnly
      ? ["Customer does not have an active artifact delivery entitlement."]
      : []),
    ...(trialPreviewOnly ? ["Trial entitlement allows preview only, not final ZIP delivery."] : []),
    ...(entitlementExpired ? ["Customer artifact entitlement is expired."] : []),
    ...(fileWriter.outputManifest.zipReady !== true ? ["ZIP-ready output is not available."] : []),
  ];

  return {
    ok: true,
    phase: "v26.2 Phase 282",
    mode: "customer_artifact_billing_entitlement_gate_evaluation",
    entitlementReceipt: {
      entitlementGateId: `entitlement_gate_${projectId}_${Date.now()}`,
      projectId,
      artifactId: fileWriter.writeReceipt.artifactId,
      requestedBy,
      artifactMode,
      entitlementMode,
      releaseAllowed,
      customerReady: releaseGate.releaseReceipt.customerReady,
      completenessScore: releaseGate.releaseReceipt.completenessScore,
      exportLabel: releaseGate.releaseReceipt.exportLabel,
      hasPaidEntitlement,
      ownerOverride,
      previewAllowed,
      downloadAllowed,
      finalDeliveryAllowed,
      trialPreviewOnly,
      entitlementExpired,
      zipReady: fileWriter.outputManifest.zipReady,
      previewPath: releaseGate.releaseReceipt.previewPath,
      downloadPath: releaseGate.releaseReceipt.downloadPath,
      historyPath: releaseGate.releaseReceipt.historyPath,
      distributionPath: releaseGate.releaseReceipt.distributionPath,
      auditEventType: finalDeliveryAllowed
        ? "artifact_delivery_entitlement_allowed"
        : "artifact_delivery_entitlement_blocked",
      blockedReasons,
      redacted: true,
    },
  };
}

export function getCustomerArtifactBillingEntitlementGate() {
  const auditPersistence = getCustomerExportAuditPersistence();

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

  const homepageOnly = evaluateCustomerArtifactBillingEntitlementGate({
    projectId: "cmoyy1gl700004mkqn7or7hxr",
    requestedBy: "system",
    artifactMode: "homepage_only",
    entitlementMode: "paid_active",
  });

  return {
    system: "OmegaCrownAI Customer Artifact Billing/Entitlement Gate",
    phase: "v26.2 Phase 282",
    status: "customer_artifact_billing_entitlement_gate_ready",
    purpose:
      "Define the billing and entitlement gate that controls whether a customer can preview, download, or receive final generated artifact delivery after release-gate approval.",
    corePrinciple:
      "Customer-ready does not automatically mean deliverable. Final ZIP delivery must require release-gate approval, active entitlement, redacted artifact output, and auditability.",

    entitlementGateContract: {
      route: "/api/sovereign/customer-artifact-billing-entitlement-gate",
      projectRoute: "/api/projects/[id]/artifacts/entitlement-gate",
      method: "POST",
      requiresReleaseGate: true,
      requiresActiveEntitlementForDownload: true,
      allowsTrialPreviewOnly: true,
      allowsOwnerOverride: true,
      redacted: true,
    },

    entitlementModes: [
      {
        mode: "paid_active",
        previewAllowed: true,
        downloadAllowed: true,
        finalDeliveryAllowed: true,
      },
      {
        mode: "owner_override",
        previewAllowed: true,
        downloadAllowed: true,
        finalDeliveryAllowed: true,
      },
      {
        mode: "trial_preview",
        previewAllowed: true,
        downloadAllowed: false,
        finalDeliveryAllowed: false,
      },
      {
        mode: "expired",
        previewAllowed: false,
        downloadAllowed: false,
        finalDeliveryAllowed: false,
      },
      {
        mode: "blocked_draft",
        previewAllowed: false,
        downloadAllowed: false,
        finalDeliveryAllowed: false,
      },
    ],

    gatedActions: [
      "Live artifact preview",
      "Admin preview",
      "Download ZIP",
      "Final customer delivery",
      "Artifact delivery dashboard",
      "Validation report access",
      "Missing-info report access",
      "Rebuild request",
      "Rollback request",
    ],

    entitlementRules: [
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
    ],

    entitlementReceiptShape: {
      entitlementGateId: "entitlement gate id",
      projectId: "project id",
      artifactId: "artifact id",
      entitlementMode: "paid_active | owner_override | trial_preview | expired | blocked_draft",
      releaseAllowed: "boolean",
      customerReady: "boolean",
      completenessScore: "0-100",
      hasPaidEntitlement: "boolean",
      previewAllowed: "boolean",
      downloadAllowed: "boolean",
      finalDeliveryAllowed: "boolean",
      zipReady: "boolean",
      previewPath: "preview path",
      downloadPath: "download path",
      historyPath: "history path",
      distributionPath: "distribution path",
      auditEventType: "entitlement audit event type",
      blockedReasons: "array",
      redacted: true,
    },

    sampleEntitlementEvaluations: {
      paidActive: paidActive.entitlementReceipt,
      trialPreview: trialPreview.entitlementReceipt,
      homepageOnly: homepageOnly.entitlementReceipt,
    },

    entitlementSafetyRules: [
      "Do not expose raw payment provider payloads.",
      "Do not expose billing secrets.",
      "Do not expose customer payment method data.",
      "Do not allow final ZIP download for draft or blocked artifacts.",
      "Do not allow final ZIP download when entitlement is expired.",
      "Do not bypass release gate for paid customers.",
      "Do not bypass release gate for owner override.",
      "Return redacted entitlement receipts only.",
    ],

    entitlementCompletenessChecks: [
      "Entitlement gate contract defines sovereign and project POST routes.",
      "Entitlement modes include paid, owner override, trial preview, expired, and blocked draft.",
      "Gated actions include preview, admin preview, download, delivery dashboard, reports, rebuild, and rollback.",
      "Entitlement rules require release gate and active entitlement for final ZIP download.",
      "Receipt shape includes entitlement, release, score, delivery, paths, audit event, blocked reasons, and redaction.",
      "Paid active sample allows final delivery.",
      "Trial preview sample blocks final ZIP delivery.",
      "Homepage-only sample remains blocked even with paid entitlement.",
      "Integration sources confirm customer export audit persistence is ready.",
    ],

    integrationSources: {
      customerExportAuditPersistenceStatus: auditPersistence.status,
    },

    nextImplementationPhases: [
      "Artifact Storage Real Prisma Write Implementation",
      "Customer Artifact Delivery Dashboard",
      "Full-Function Artifact System Completion Summary",
      "Production Launch Hardening",
    ],
  };
}
