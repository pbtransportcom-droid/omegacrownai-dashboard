import { NextResponse } from "next/server";
import {
  getCustomerArtifactDeliveryDashboard,
  getCustomerArtifactDeliveryDashboardForProject,
} from "@/lib/sovereign/customer-artifact-delivery-dashboard";

const requiredSections = [
  "Customer-ready artifact status",
  "Delivery entitlement",
  "Production file package",
  "Storage database write",
  "WordPress publishing",
  "Preview/download/history/distribution links",
  "Blocked reasons",
  "Operator actions",
];

const requiredRules = [
  "Show final delivery only when entitlement allows it.",
  "Show preview when preview entitlement allows it.",
  "Show blocked reasons for homepage-only artifacts.",
  "Show blocked reasons for trial-preview final delivery.",
  "Show WordPress draft publishing as draft-first.",
  "Show Prisma real writes as dry-run unless feature flag is enabled.",
  "Do not expose secrets, raw env values, WordPress credentials, or billing provider payloads.",
  "Do not show final download as enabled when release gate fails.",
  "Always return redacted dashboard data.",
];

export async function GET() {
  const model = getCustomerArtifactDeliveryDashboard();

  const paid = getCustomerArtifactDeliveryDashboardForProject({
    projectId: "cmoyy1gl700004mkqn7or7hxr",
    artifactMode: "full_stack",
    entitlementMode: "paid_active",
  });

  const trial = getCustomerArtifactDeliveryDashboardForProject({
    projectId: "cmoyy1gl700004mkqn7or7hxr",
    artifactMode: "full_stack",
    entitlementMode: "trial_preview",
  });

  const homepage = getCustomerArtifactDeliveryDashboardForProject({
    projectId: "cmoyy1gl700004mkqn7or7hxr",
    artifactMode: "homepage_only",
    entitlementMode: "paid_active",
  });

  const missingSections = requiredSections.filter(
    (section) => !model.dashboardSections.includes(section)
  );

  const missingRules = requiredRules.filter(
    (rule) => !model.dashboardRules.includes(rule)
  );

  const paidDownloadAction = paid.dashboard.actions.find((action) => action.label === "Download ZIP");
  const trialDownloadAction = trial.dashboard.actions.find((action) => action.label === "Download ZIP");
  const homepageDownloadAction = homepage.dashboard.actions.find((action) => action.label === "Download ZIP");

  const checks = [
    {
      name: "Customer Artifact Delivery Dashboard is ready",
      passed: model.status === "customer_artifact_delivery_dashboard_ready",
      detail: model.status,
    },
    {
      name: "Dashboard contract present",
      passed:
        model.dashboardContract.requiresReleaseGateStatus === true &&
        model.dashboardContract.requiresEntitlementStatus === true &&
        model.dashboardContract.requiresWordPressPublishStatus === true &&
        model.dashboardContract.requiresPrismaWriteStatus === true &&
        model.dashboardContract.redacted === true,
      detail: "Dashboard contract defined.",
    },
    {
      name: "Dashboard sections present",
      passed: missingSections.length === 0,
      detail: missingSections.length ? `Missing: ${missingSections.join(", ")}` : "Sections present.",
    },
    {
      name: "Dashboard rules present",
      passed: missingRules.length === 0,
      detail: missingRules.length ? `Missing: ${missingRules.join(", ")}` : "Rules present.",
    },
    {
      name: "Dashboard action rules present",
      passed: model.dashboardActionRules.length >= 6,
      detail: `${model.dashboardActionRules.length} action rules`,
    },
    {
      name: "Paid active dashboard allows final delivery",
      passed:
        paid.dashboard.customerReady === true &&
        paid.dashboard.finalDeliveryAllowed === true &&
        paid.dashboard.downloadAllowed === true &&
        paidDownloadAction?.enabled === true,
      detail: `score ${paid.dashboard.completenessScore}`,
    },
    {
      name: "Trial preview dashboard blocks final delivery but allows preview",
      passed:
        trial.dashboard.previewAllowed === true &&
        trial.dashboard.finalDeliveryAllowed === false &&
        trial.dashboard.downloadAllowed === false &&
        trialDownloadAction?.enabled === false,
      detail: `${trial.dashboard.blockedReasons.length} blocked reasons`,
    },
    {
      name: "Homepage-only dashboard is blocked",
      passed:
        homepage.dashboard.customerReady === false &&
        homepage.dashboard.releaseAllowed === false &&
        homepage.dashboard.finalDeliveryAllowed === false &&
        homepageDownloadAction?.enabled === false &&
        homepage.dashboard.blockedReasons.length >= 1,
      detail: `${homepage.dashboard.blockedReasons.length} blocked reasons`,
    },
    {
      name: "Dashboard cards present",
      passed:
        paid.dashboard.cards.length >= 5 &&
        paid.dashboard.cards.some((card) => card.id === "artifact_status") &&
        paid.dashboard.cards.some((card) => card.id === "delivery_entitlement") &&
        paid.dashboard.cards.some((card) => card.id === "wordpress_publish"),
      detail: `${paid.dashboard.cards.length} cards`,
    },
    {
      name: "Dashboard actions present",
      passed:
        paid.dashboard.actions.length >= 6 &&
        paid.dashboard.actions.some((action) => action.label === "Open Preview") &&
        paid.dashboard.actions.some((action) => action.label === "Download ZIP") &&
        paid.dashboard.actions.some((action) => action.label === "Publish WordPress Draft"),
      detail: `${paid.dashboard.actions.length} actions`,
    },
    {
      name: "Storage, WordPress, and Prisma statuses present",
      passed:
        paid.dashboard.wordpressDraftReady === true &&
        paid.dashboard.prismaDryRunPrepared === true &&
        paid.dashboard.filePackageReady === true &&
        paid.dashboard.zipReady === true,
      detail: "Delivery backend statuses present.",
    },
    {
      name: "Completeness checks present",
      passed: model.dashboardCompletenessChecks.length >= 8,
      detail: `${model.dashboardCompletenessChecks.length} checks`,
    },
  ];

  const passedChecks = checks.filter((check) => check.passed).length;

  return NextResponse.json({
    ok: checks.every((check) => check.passed),
    phase: "v26.5 Phase 285",
    service: "Customer Artifact Delivery Dashboard Smoke Test",
    totalChecks: checks.length,
    passedChecks,
    failedChecks: checks.length - passedChecks,
    dashboardSectionCount: model.dashboardSections.length,
    dashboardRuleCount: model.dashboardRules.length,
    dashboardActionRuleCount: model.dashboardActionRules.length,
    paidFinalDeliveryAllowed: paid.dashboard.finalDeliveryAllowed,
    paidDownloadAllowed: paid.dashboard.downloadAllowed,
    trialPreviewAllowed: trial.dashboard.previewAllowed,
    trialFinalDeliveryAllowed: trial.dashboard.finalDeliveryAllowed,
    homepageReleaseAllowed: homepage.dashboard.releaseAllowed,
    homepageBlockedReasonCount: homepage.dashboard.blockedReasons.length,
    paidCardCount: paid.dashboard.cards.length,
    paidActionCount: paid.dashboard.actions.length,
    completenessCheckCount: model.dashboardCompletenessChecks.length,
    checks,
  });
}
