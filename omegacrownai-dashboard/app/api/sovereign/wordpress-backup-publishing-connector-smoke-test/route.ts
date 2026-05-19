import { NextResponse } from "next/server";
import {
  getWordPressBackupPublishingConnector,
  simulateWordPressArtifactPublish,
} from "@/lib/sovereign/wordpress-backup-publishing-connector";

const requiredSafetyRules = [
  "Do not publish before WordPress file backup exists.",
  "Do not publish before WordPress database backup exists.",
  "Default WordPress publish status must be draft.",
  "Do not publicly publish homepage-only artifacts.",
  "Do not publicly publish missing-backend artifacts.",
  "Do not publicly publish trial-preview artifacts.",
  "Do not expose WordPress salts, DB passwords, API keys, or auth tokens.",
  "Do not store WordPress credentials in Git.",
  "Do not delete existing WordPress pages/posts during publish.",
  "Use redacted publish receipts only.",
];

export async function GET() {
  const connector = getWordPressBackupPublishingConnector();

  const paidDraft = simulateWordPressArtifactPublish({
    projectId: "cmoyy1gl700004mkqn7or7hxr",
    requestedBy: "system",
    artifactMode: "full_stack",
    entitlementMode: "paid_active",
    publishTarget: "draft_page",
  });

  const paidPublic = simulateWordPressArtifactPublish({
    projectId: "cmoyy1gl700004mkqn7or7hxr",
    requestedBy: "system",
    artifactMode: "full_stack",
    entitlementMode: "paid_active",
    publishTarget: "page",
  });

  const trialPreview = simulateWordPressArtifactPublish({
    projectId: "cmoyy1gl700004mkqn7or7hxr",
    requestedBy: "system",
    artifactMode: "full_stack",
    entitlementMode: "trial_preview",
    publishTarget: "page",
  });

  const homepageOnly = simulateWordPressArtifactPublish({
    projectId: "cmoyy1gl700004mkqn7or7hxr",
    requestedBy: "system",
    artifactMode: "homepage_only",
    entitlementMode: "paid_active",
    publishTarget: "page",
  });

  const missingSafetyRules = requiredSafetyRules.filter(
    (rule) => !connector.publishSafetyRules.includes(rule)
  );

  const checks = [
    {
      name: "WordPress Backup + Publishing Connector is ready",
      passed: connector.status === "wordpress_backup_publishing_connector_ready",
      detail: connector.status,
    },
    {
      name: "WordPress environment is defined",
      passed:
        connector.wordpressEnvironment.wordpressRoot === "/var/www/omegacrownai/public" &&
        connector.wordpressEnvironment.siteUrl === "https://omegacrownai.com" &&
        connector.wordpressEnvironment.temporaryHostingerDomainInDatabase === false,
      detail: connector.wordpressEnvironment.wordpressRoot,
    },
    {
      name: "Backup contract present",
      passed:
        connector.backupContract.requiredBeforePublish === true &&
        connector.backupContract.verificationCommands.length >= 3 &&
        connector.backupContract.fileBackupCommand.includes("tar -czf") &&
        connector.backupContract.databaseBackupCommand.includes("wp db export"),
      detail: "Backup commands present.",
    },
    {
      name: "Publishing connector contract present",
      passed:
        connector.publishingConnectorContract.requiresReleaseGate === true &&
        connector.publishingConnectorContract.requiresEntitlementGate === true &&
        connector.publishingConnectorContract.defaultPostStatus === "draft" &&
        connector.publishingConnectorContract.redacted === true,
      detail: "Publishing contract defined.",
    },
    {
      name: "Publishing flow present",
      passed: connector.publishingFlow.length >= 11,
      detail: `${connector.publishingFlow.length} flow steps`,
    },
    {
      name: "Publish safety rules present",
      passed: missingSafetyRules.length === 0,
      detail: missingSafetyRules.length
        ? `Missing: ${missingSafetyRules.join(", ")}`
        : "Safety rules present.",
    },
    {
      name: "Generated WordPress content shape present",
      passed:
        connector.generatedWordPressContentShape.sections.length >= 7 &&
        connector.generatedWordPressContentShape.redacted === true,
      detail: `${connector.generatedWordPressContentShape.sections.length} content sections`,
    },
    {
      name: "Paid draft publish stays draft",
      passed:
        paidDraft.publishReceipt.canPublish === true &&
        paidDraft.publishReceipt.postStatus === "draft" &&
        paidDraft.publishReceipt.finalPublicPublishAllowed === false,
      detail: paidDraft.publishReceipt.postStatus,
    },
    {
      name: "Paid public publish is allowed",
      passed:
        paidPublic.publishReceipt.canPublish === true &&
        paidPublic.publishReceipt.finalPublicPublishAllowed === true &&
        paidPublic.publishReceipt.postStatus === "publish",
      detail: paidPublic.publishReceipt.postStatus,
    },
    {
      name: "Trial preview blocks public publish",
      passed:
        trialPreview.publishReceipt.finalPublicPublishAllowed === false &&
        trialPreview.publishReceipt.postStatus === "draft",
      detail: trialPreview.publishReceipt.postStatus,
    },
    {
      name: "Homepage-only blocks public publish",
      passed:
        homepageOnly.publishReceipt.canPublish === false &&
        homepageOnly.publishReceipt.finalPublicPublishAllowed === false &&
        homepageOnly.publishReceipt.postStatus === "draft",
      detail: `${homepageOnly.publishReceipt.blockedReasons.length} blocked reasons`,
    },
    {
      name: "Completeness checks present",
      passed: connector.connectorCompletenessChecks.length >= 10,
      detail: `${connector.connectorCompletenessChecks.length} checks`,
    },
  ];

  const passedChecks = checks.filter((check) => check.passed).length;

  return NextResponse.json({
    ok: checks.every((check) => check.passed),
    phase: "v26.4 Phase 284",
    service: "WordPress Backup + Publishing Connector Smoke Test",
    totalChecks: checks.length,
    passedChecks,
    failedChecks: checks.length - passedChecks,
    publishingFlowStepCount: connector.publishingFlow.length,
    safetyRuleCount: connector.publishSafetyRules.length,
    contentSectionCount: connector.generatedWordPressContentShape.sections.length,
    connectorCompletenessCheckCount: connector.connectorCompletenessChecks.length,
    paidDraftCanPublish: paidDraft.publishReceipt.canPublish,
    paidDraftPostStatus: paidDraft.publishReceipt.postStatus,
    paidPublicPostStatus: paidPublic.publishReceipt.postStatus,
    trialPreviewPublicPublishAllowed: trialPreview.publishReceipt.finalPublicPublishAllowed,
    homepageOnlyPublicPublishAllowed: homepageOnly.publishReceipt.finalPublicPublishAllowed,
    checks,
  });
}
