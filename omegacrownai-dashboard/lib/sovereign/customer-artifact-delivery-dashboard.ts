import { evaluateCustomerArtifactBillingEntitlementGate } from "@/lib/sovereign/customer-artifact-billing-entitlement-gate";
import { evaluateCustomerArtifactReleaseGate } from "@/lib/sovereign/full-function-customer-artifact-release-gate";
import { simulateProductionWebsiteAppFileWrite } from "@/lib/sovereign/production-website-app-generator-file-writer";
import { simulateRealPrismaArtifactStorageWrite } from "@/lib/sovereign/artifact-storage-real-prisma-write-implementation";
import { simulateWordPressArtifactPublish } from "@/lib/sovereign/wordpress-backup-publishing-connector";

type DeliveryDashboardInput = {
  projectId?: string;
  requestedBy?: string;
  artifactMode?: "full_stack" | "homepage_only" | "missing_backend";
  entitlementMode?: "paid_active" | "owner_override" | "trial_preview" | "expired" | "blocked_draft";
};

function safeId(value: unknown, fallback: string) {
  if (typeof value !== "string") return fallback;
  const cleaned = value.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 100);
  return cleaned || fallback;
}

export function getCustomerArtifactDeliveryDashboardForProject(
  input: DeliveryDashboardInput = {}
) {
  const projectId = safeId(input.projectId, "cmoyy1gl700004mkqn7or7hxr");
  const requestedBy = safeId(input.requestedBy, "system");
  const artifactMode = input.artifactMode || "full_stack";
  const entitlementMode = input.entitlementMode || "paid_active";

  const releaseGate = evaluateCustomerArtifactReleaseGate({
    projectId,
    requestedBy,
    artifactMode,
  });

  const entitlement = evaluateCustomerArtifactBillingEntitlementGate({
    projectId,
    requestedBy,
    artifactMode,
    entitlementMode,
  });

  const fileWrite = simulateProductionWebsiteAppFileWrite({
    projectId,
    requestedBy,
    artifactMode,
  });

  const prismaWrite = simulateRealPrismaArtifactStorageWrite({
    projectId,
    requestedBy,
    writeMode: "dry_run",
  });

  const wordpressDraft = simulateWordPressArtifactPublish({
    projectId,
    requestedBy,
    artifactMode,
    entitlementMode,
    publishTarget: "draft_page",
  });

  const release = releaseGate.releaseReceipt;
  const ent = entitlement.entitlementReceipt;
  const file = fileWrite.writeReceipt;
  const prisma = prismaWrite.prismaWriteReceipt;
  const wp = wordpressDraft.publishReceipt;

  const dashboardCards = [
    {
      id: "artifact_status",
      title: "Customer-Ready Artifact Status",
      status: release.releaseAllowed ? "ready" : "blocked",
      score: release.completenessScore,
      customerReady: release.customerReady,
      detail: release.releaseAllowed
        ? "Full-function artifact passed release gate."
        : "Artifact is blocked until missing functionality is completed.",
    },
    {
      id: "delivery_entitlement",
      title: "Delivery Entitlement",
      status: ent.finalDeliveryAllowed ? "allowed" : "restricted",
      score: ent.completenessScore,
      customerReady: ent.customerReady,
      detail: ent.finalDeliveryAllowed
        ? "Customer can receive final ZIP delivery."
        : "Delivery is restricted by entitlement or artifact readiness.",
    },
    {
      id: "file_package",
      title: "Production File Package",
      status: file.releaseAllowed ? "ready" : "blocked",
      score: file.completenessScore,
      customerReady: file.customerReady,
      detail: `${file.plannedFileCount} files planned, ${file.sourceFileCount} source files, ${file.reportFileCount} report files.`,
    },
    {
      id: "storage_database",
      title: "Storage Database Write",
      status: prisma.storageRecordPrepared && prisma.historyRecordPrepared && prisma.auditEventPrepared ? "prepared" : "blocked",
      score: prisma.completenessScore,
      customerReady: prisma.customerReady,
      detail: prisma.writesEnabled
        ? "Real Prisma writes are enabled."
        : "Dry-run Prisma payloads are prepared; real writes require feature flag.",
    },
    {
      id: "wordpress_publish",
      title: "WordPress Publishing",
      status: wp.canPublish ? "draft_ready" : "blocked",
      score: wp.completenessScore,
      customerReady: wp.customerReady,
      detail: wp.canPublish
        ? "WordPress draft publishing is prepared."
        : "WordPress publishing is blocked by release or entitlement gate.",
    },
  ];

  const deliveryActions = [
    {
      label: "Open Preview",
      href: ent.previewPath,
      enabled: ent.previewAllowed,
    },
    {
      label: "Download ZIP",
      href: ent.downloadPath,
      enabled: ent.downloadAllowed,
    },
    {
      label: "Artifact History",
      href: ent.historyPath,
      enabled: true,
    },
    {
      label: "Distribution Page",
      href: ent.distributionPath,
      enabled: true,
    },
    {
      label: "Publish WordPress Draft",
      href: `/api/projects/${projectId}/artifacts/publish-wordpress`,
      enabled: wp.canPublish,
    },
    {
      label: "Run Prisma Dry-Run Write",
      href: `/api/projects/${projectId}/artifacts/real-prisma-write`,
      enabled: true,
    },
  ];

  const blockedReasons = [
    ...release.failedReasons,
    ...ent.blockedReasons,
    ...wp.blockedReasons,
  ];

  return {
    ok: true,
    phase: "v26.5 Phase 285",
    mode: "customer_artifact_delivery_dashboard",
    dashboard: {
      dashboardId: `delivery_dashboard_${projectId}`,
      projectId,
      requestedBy,
      artifactId: ent.artifactId,
      artifactMode,
      entitlementMode,
      customerReady: ent.customerReady,
      releaseAllowed: release.releaseAllowed,
      previewAllowed: ent.previewAllowed,
      downloadAllowed: ent.downloadAllowed,
      finalDeliveryAllowed: ent.finalDeliveryAllowed,
      completenessScore: ent.completenessScore,
      exportLabel: ent.exportLabel,
      wordpressDraftReady: wp.canPublish,
      prismaDryRunPrepared:
        prisma.storageRecordPrepared &&
        prisma.historyRecordPrepared &&
        prisma.auditEventPrepared,
      filePackageReady: file.releaseAllowed,
      zipReady: file.zipSizeBytes > 0,
      cards: dashboardCards,
      actions: deliveryActions,
      links: {
        previewPath: ent.previewPath,
        downloadPath: ent.downloadPath,
        historyPath: ent.historyPath,
        distributionPath: ent.distributionPath,
        wordpressPublishApi: `/api/projects/${projectId}/artifacts/publish-wordpress`,
        entitlementGateApi: `/api/projects/${projectId}/artifacts/entitlement-gate`,
        releaseGateApi: `/api/projects/${projectId}/artifacts/release-gate`,
        prismaWriteApi: `/api/projects/${projectId}/artifacts/real-prisma-write`,
      },
      blockedReasons,
      redacted: true,
    },
  };
}

export function getCustomerArtifactDeliveryDashboard() {
  const paidActive = getCustomerArtifactDeliveryDashboardForProject({
    projectId: "cmoyy1gl700004mkqn7or7hxr",
    requestedBy: "system",
    artifactMode: "full_stack",
    entitlementMode: "paid_active",
  });

  const trialPreview = getCustomerArtifactDeliveryDashboardForProject({
    projectId: "cmoyy1gl700004mkqn7or7hxr",
    requestedBy: "system",
    artifactMode: "full_stack",
    entitlementMode: "trial_preview",
  });

  const homepageOnly = getCustomerArtifactDeliveryDashboardForProject({
    projectId: "cmoyy1gl700004mkqn7or7hxr",
    requestedBy: "system",
    artifactMode: "homepage_only",
    entitlementMode: "paid_active",
  });

  return {
    system: "OmegaCrownAI Customer Artifact Delivery Dashboard",
    phase: "v26.5 Phase 285",
    status: "customer_artifact_delivery_dashboard_ready",
    purpose:
      "Create the customer-facing delivery dashboard model that shows artifact readiness, delivery entitlement, file package status, storage write status, WordPress draft publishing status, and safe actions.",
    corePrinciple:
      "Customers and operators should see exactly whether an artifact is ready, blocked, downloadable, publishable, stored, and auditable before delivery.",

    dashboardContract: {
      route: "/api/sovereign/customer-artifact-delivery-dashboard",
      projectRoute: "/api/projects/[id]/artifacts/delivery-dashboard",
      method: "GET",
      requiresReleaseGateStatus: true,
      requiresEntitlementStatus: true,
      requiresWordPressPublishStatus: true,
      requiresPrismaWriteStatus: true,
      redacted: true,
    },

    dashboardSections: [
      "Customer-ready artifact status",
      "Delivery entitlement",
      "Production file package",
      "Storage database write",
      "WordPress publishing",
      "Preview/download/history/distribution links",
      "Blocked reasons",
      "Operator actions",
    ],

    dashboardRules: [
      "Show final delivery only when entitlement allows it.",
      "Show preview when preview entitlement allows it.",
      "Show blocked reasons for homepage-only artifacts.",
      "Show blocked reasons for trial-preview final delivery.",
      "Show WordPress draft publishing as draft-first.",
      "Show Prisma real writes as dry-run unless feature flag is enabled.",
      "Do not expose secrets, raw env values, WordPress credentials, or billing provider payloads.",
      "Do not show final download as enabled when release gate fails.",
      "Always return redacted dashboard data.",
    ],

    dashboardActionRules: [
      "Preview action uses previewAllowed.",
      "Download ZIP action uses downloadAllowed.",
      "History action remains visible for review.",
      "Distribution action remains visible for review.",
      "WordPress draft action uses WordPress publish readiness.",
      "Prisma dry-run write action remains operator-only.",
    ],

    sampleDashboards: {
      paidActive: paidActive.dashboard,
      trialPreview: trialPreview.dashboard,
      homepageOnly: homepageOnly.dashboard,
    },

    dashboardCompletenessChecks: [
      "Dashboard contract defines sovereign and project routes.",
      "Dashboard sections cover artifact, entitlement, files, storage, WordPress, links, blocked reasons, and actions.",
      "Dashboard rules prevent false delivery, unsafe secrets, and non-redacted output.",
      "Action rules map preview, download, history, distribution, WordPress, and Prisma actions.",
      "Paid active sample allows final delivery and download.",
      "Trial preview sample allows preview but blocks final delivery.",
      "Homepage-only sample is blocked and not customer-ready.",
      "Dashboard cards include artifact, entitlement, file package, storage, and WordPress status.",
    ],

    nextImplementationPhases: [
      "Full-Function Artifact System Completion Summary",
      "Production Launch Hardening",
      "WordPress Subdomain Routing",
    ],
  };
}
