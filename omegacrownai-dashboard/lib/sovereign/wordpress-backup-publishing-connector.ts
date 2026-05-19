import { evaluateCustomerArtifactBillingEntitlementGate } from "@/lib/sovereign/customer-artifact-billing-entitlement-gate";
import { simulateProductionWebsiteAppFileWrite } from "@/lib/sovereign/production-website-app-generator-file-writer";

type WordPressPublishInput = {
  projectId?: string;
  requestedBy?: string;
  artifactMode?: "full_stack" | "homepage_only" | "missing_backend";
  entitlementMode?: "paid_active" | "owner_override" | "trial_preview" | "expired" | "blocked_draft";
  publishTarget?: "page" | "post" | "draft_page";
};

function safeId(value: unknown, fallback: string) {
  if (typeof value !== "string") return fallback;
  const cleaned = value.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 100);
  return cleaned || fallback;
}

function safePublishTarget(value: unknown): "page" | "post" | "draft_page" {
  if (value === "post" || value === "draft_page" || value === "page") return value;
  return "draft_page";
}

export function simulateWordPressArtifactPublish(input: WordPressPublishInput = {}) {
  const projectId = safeId(input.projectId, "cmoyy1gl700004mkqn7or7hxr");
  const requestedBy = safeId(input.requestedBy, "system");
  const artifactMode = input.artifactMode || "full_stack";
  const entitlementMode = input.entitlementMode || "paid_active";
  const publishTarget = safePublishTarget(input.publishTarget);

  const entitlement = evaluateCustomerArtifactBillingEntitlementGate({
    projectId,
    requestedBy,
    artifactMode,
    entitlementMode,
  });

  const fileWriter = simulateProductionWebsiteAppFileWrite({
    projectId,
    requestedBy,
    artifactMode,
  });

  const canPublish =
    entitlement.entitlementReceipt.releaseAllowed === true &&
    entitlement.entitlementReceipt.previewAllowed === true &&
    fileWriter.writeReceipt.releaseAllowed === true;

  const finalPublicPublishAllowed =
    canPublish &&
    entitlement.entitlementReceipt.finalDeliveryAllowed === true &&
    publishTarget !== "draft_page";

  return {
    ok: true,
    phase: "v26.4 Phase 284",
    mode: "wordpress_artifact_publish_preview",
    publishReceipt: {
      publishId: `wp_publish_${projectId}_${Date.now()}`,
      projectId,
      artifactId: fileWriter.writeReceipt.artifactId,
      requestedBy,
      wordpressPath: "/var/www/omegacrownai/public",
      wordpressSiteUrl: "https://omegacrownai.com",
      publishTarget,
      canPublish,
      finalPublicPublishAllowed,
      postStatus: finalPublicPublishAllowed ? "publish" : "draft",
      postType: publishTarget === "post" ? "post" : "page",
      pageTitle: "OmegaCrownAI Generated Customer Artifact",
      releaseAllowed: entitlement.entitlementReceipt.releaseAllowed,
      finalDeliveryAllowed: entitlement.entitlementReceipt.finalDeliveryAllowed,
      customerReady: entitlement.entitlementReceipt.customerReady,
      completenessScore: entitlement.entitlementReceipt.completenessScore,
      previewPath: entitlement.entitlementReceipt.previewPath,
      downloadPath: entitlement.entitlementReceipt.downloadPath,
      historyPath: entitlement.entitlementReceipt.historyPath,
      distributionPath: entitlement.entitlementReceipt.distributionPath,
      blockedReasons: canPublish
        ? []
        : entitlement.entitlementReceipt.blockedReasons,
      redacted: true,
    },
  };
}

export function getWordPressBackupPublishingConnector() {
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

  return {
    system: "OmegaCrownAI WordPress Backup + Publishing Connector",
    phase: "v26.4 Phase 284",
    status: "wordpress_backup_publishing_connector_ready",
    purpose:
      "Define the safe connector that backs up the OmegaCrownAI WordPress installation and prepares generated full-function artifacts for publishing to WordPress pages/posts.",
    corePrinciple:
      "WordPress is a publishing and recovery channel, not the core OmegaCrownAI brain. Backups must happen before publishing, and generated artifacts must pass release and entitlement gates before public delivery.",

    wordpressEnvironment: {
      wordpressRoot: "/var/www/omegacrownai/public",
      siteUrl: "https://omegacrownai.com",
      detectedWpConfig: "/var/www/omegacrownai/public/wp-config.php",
      backupRoot: "/var/backups/omegacrownai-wordpress",
      currentKnownPages: ["Sample Page draft", "Privacy Policy draft"],
      currentKnownPosts: ["Hello world! draft"],
      temporaryHostingerDomainInDatabase: false,
      redacted: true,
    },

    backupContract: {
      fileBackupCommand:
        "tar -czf /var/backups/omegacrownai-wordpress/omegacrownai-wordpress-files-$BACKUP_DATE.tar.gz -C /var/www/omegacrownai public",
      databaseBackupCommand:
        "wp db export /var/backups/omegacrownai-wordpress/omegacrownai-wordpress-db-$BACKUP_DATE.sql --allow-root",
      verificationCommands: [
        "wp core version --allow-root",
        "wp db size --allow-root",
        "ls -lh /var/backups/omegacrownai-wordpress",
      ],
      requiredBeforePublish: true,
    },

    publishingConnectorContract: {
      route: "/api/sovereign/wordpress-backup-publishing-connector",
      projectRoute: "/api/projects/[id]/artifacts/publish-wordpress",
      method: "POST",
      supportsPageDraft: true,
      supportsPostDraft: true,
      supportsPublicPageWhenEntitled: true,
      requiresReleaseGate: true,
      requiresEntitlementGate: true,
      defaultPostStatus: "draft",
      redacted: true,
    },

    publishingFlow: [
      "Confirm WordPress root exists.",
      "Confirm wp-config.php exists.",
      "Create file backup.",
      "Create database backup.",
      "Evaluate artifact release gate.",
      "Evaluate billing/entitlement gate.",
      "Prepare generated artifact content for WordPress.",
      "Create WordPress page/post as draft by default.",
      "Allow public publish only when final delivery entitlement is allowed.",
      "Attach preview, download, history, and distribution links.",
      "Return redacted WordPress publish receipt.",
    ],

    publishSafetyRules: [
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
    ],

    generatedWordPressContentShape: {
      postTitle: "OmegaCrownAI Generated Customer Artifact",
      postType: "page | post",
      postStatus: "draft | publish",
      sections: [
        "Artifact overview",
        "Customer-ready score",
        "Preview link",
        "Download link when entitled",
        "Validation report summary",
        "Missing-info report summary",
        "Support/contact section",
      ],
      redacted: true,
    },

    samplePublishEvaluations: {
      paidDraft: paidDraft.publishReceipt,
      paidPublic: paidPublic.publishReceipt,
      trialPreview: trialPreview.publishReceipt,
      homepageOnly: homepageOnly.publishReceipt,
    },

    connectorCompletenessChecks: [
      "WordPress environment points to /var/www/omegacrownai/public.",
      "Backup contract includes file and database backup commands.",
      "Publishing connector contract defines sovereign and project POST routes.",
      "Publishing flow requires backup, release gate, entitlement gate, and draft-first publishing.",
      "Safety rules block secrets, Git credentials, destructive deletes, trial public publish, homepage-only public publish, and missing-backend public publish.",
      "Generated WordPress content shape includes artifact overview, score, preview, download, validation, missing-info, and support sections.",
      "Paid draft sample creates draft page.",
      "Paid public sample allows publish.",
      "Trial preview sample blocks final public publish.",
      "Homepage-only sample blocks final public publish.",
    ],

    nextImplementationPhases: [
      "Customer Artifact Delivery Dashboard",
      "Full-Function Artifact System Completion Summary",
      "Production Launch Hardening",
    ],
  };
}
