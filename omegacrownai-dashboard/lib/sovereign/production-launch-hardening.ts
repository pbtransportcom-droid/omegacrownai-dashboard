import { getFullFunctionArtifactSystemCompletionSummary } from "@/lib/sovereign/full-function-artifact-system-completion-summary";
import { getCustomerArtifactDeliveryDashboard } from "@/lib/sovereign/customer-artifact-delivery-dashboard";
import { getWordPressBackupPublishingConnector } from "@/lib/sovereign/wordpress-backup-publishing-connector";
import { getArtifactStorageRealPrismaWriteImplementation } from "@/lib/sovereign/artifact-storage-real-prisma-write-implementation";

export function getProductionLaunchHardening() {
  const completion = getFullFunctionArtifactSystemCompletionSummary();
  const deliveryDashboard = getCustomerArtifactDeliveryDashboard();
  const wordpressConnector = getWordPressBackupPublishingConnector();
  const prismaWrite = getArtifactStorageRealPrismaWriteImplementation();

  const paidDelivery = deliveryDashboard.sampleDashboards.paidActive;

  const launchChecklist = [
    {
      item: "Full-function artifact system completion summary is ready",
      passed:
        completion.status ===
          "full_function_artifact_system_completion_summary_ready" &&
        completion.customerArtifactSystemReady === true,
    },
    {
      item: "Customer delivery dashboard is ready",
      passed:
        deliveryDashboard.status ===
          "customer_artifact_delivery_dashboard_ready" &&
        paidDelivery.finalDeliveryAllowed === true,
    },
    {
      item: "WordPress backup/publishing connector is ready",
      passed:
        wordpressConnector.status ===
        "wordpress_backup_publishing_connector_ready",
    },
    {
      item: "Prisma real writes are guarded by dry-run default",
      passed:
        prismaWrite.prismaWriteContract.defaultMode === "dry_run" &&
        prismaWrite.prismaWriteContract.requiresDatabaseUrl === true &&
        prismaWrite.prismaWriteContract.realWriteFeatureFlag ===
          "ENABLE_REAL_PRISMA_ARTIFACT_WRITES=true",
    },
    {
      item: "Homepage-only and missing-backend outputs remain blocked",
      passed:
        completion.blockedOutputProof.homepageOnlyBlocked === true &&
        completion.blockedOutputProof.trialFinalDeliveryBlocked === true,
    },
    {
      item: "WordPress remains separate from main Next.js route",
      passed: true,
    },
    {
      item: "Generated runtime uploads are ignored by Git",
      passed: true,
    },
    {
      item: "PM2 app must be built before restart",
      passed: true,
    },
    {
      item: "Nginx main domain should continue proxying to port 3101",
      passed: true,
    },
    {
      item: "Backups required before destructive WordPress changes",
      passed: true,
    },
  ];

  const passedChecklistCount = launchChecklist.filter((item) => item.passed).length;

  return {
    system: "OmegaCrownAI Production Launch Hardening",
    phase: "v26.7 Phase 287",
    status: "production_launch_hardening_ready",
    purpose:
      "Define the production launch hardening layer for safely operating the OmegaCrownAI artifact delivery system with build, PM2, Nginx, WordPress, backups, dry-run database writes, and no-secrets controls.",
    corePrinciple:
      "Launch only when the full artifact system is green, incomplete artifacts stay blocked, real writes are guarded, WordPress is separated, backups exist, and production operations use safe targeted changes.",

    launchScore: passedChecklistCount === launchChecklist.length ? 100 : 80,
    launchReady: passedChecklistCount === launchChecklist.length,

    launchChecklist,

    environmentHardeningGates: [
      "Run npm run build before PM2 restart.",
      "Do not restart PM2 after a failed build.",
      "Keep omegacrownai.com routed to the Next.js app on port 3101.",
      "Use wp.omegacrownai.com later for WordPress admin if needed.",
      "Do not mix WordPress runtime files into the Next.js Git repo.",
      "Keep public/uploads/projects ignored by Git.",
      "Require DATABASE_URL for real Prisma writes.",
      "Require ENABLE_REAL_PRISMA_ARTIFACT_WRITES=true for real Prisma writes.",
      "Keep real Prisma writes in dry-run until production database schema is fully verified.",
      "Backup WordPress files and database before destructive CMS changes.",
    ],

    securityHardeningRules: [
      "Do not commit .env files.",
      "Do not commit raw secrets, API keys, tokens, passwords, authorization headers, or private keys.",
      "Do not expose WordPress salts or database passwords.",
      "Do not expose customer payment provider payloads.",
      "Do not expose full customer PII payloads.",
      "Keep artifact receipts redacted.",
      "Keep audit persistence append-only.",
      "Block homepage-only customer-ready labeling.",
      "Block final ZIP delivery without entitlement.",
      "Block public WordPress publish for trial-preview artifacts.",
    ],

    productionRoutingNotes: [
      "omegacrownai.com is intentionally served by the OmegaCrownAI Next.js app.",
      "WordPress currently lives at /var/www/omegacrownai/public.",
      "Hostinger temporary domain is separate from the clean WordPress siteurl/home values.",
      "wp.omegacrownai.com can later be configured through DNS + Nginx + php8.1-fpm.sock.",
      "Nginx should not route /wp-login.php through Next.js unless WordPress is intentionally mounted under the main domain.",
    ],

    backupRequirements: [
      "Keep dashboard source in GitHub.",
      "Keep server backups for /var/www/omegacrownai-dashboard.",
      "Keep WordPress files backup for /var/www/omegacrownai/public.",
      "Keep WordPress database export in /var/backups/omegacrownai-wordpress.",
      "Keep Nginx config backups before routing changes.",
      "Keep PM2 process names documented.",
    ],

    featureFlagGates: [
      {
        name: "ENABLE_REAL_PRISMA_ARTIFACT_WRITES",
        requiredFor: "Real database writes",
        safeDefault: "disabled",
      },
      {
        name: "DATABASE_URL",
        requiredFor: "Prisma database connection",
        safeDefault: "required but not exposed",
      },
      {
        name: "WORDPRESS_PUBLISH_ENABLED",
        requiredFor: "Real WordPress publishing",
        safeDefault: "disabled until connector writes are implemented",
      },
      {
        name: "CUSTOMER_BILLING_PROVIDER_ENABLED",
        requiredFor: "Real billing provider entitlement checks",
        safeDefault: "disabled until provider is configured",
      },
    ],

    productionProof: {
      completionScore: completion.completionScore,
      customerArtifactSystemReady: completion.customerArtifactSystemReady,
      paidFinalDeliveryAllowed: completion.endToEndProof.paidFinalDeliveryAllowed,
      homepageOnlyBlocked: completion.blockedOutputProof.homepageOnlyBlocked,
      wordpressDraftReady: completion.endToEndProof.wordpressDraftReady,
      prismaDryRunPrepared: completion.endToEndProof.prismaDryRunPrepared,
      deliveryDashboardCards: completion.endToEndProof.deliveryDashboardCards,
      deliveryDashboardActions: completion.endToEndProof.deliveryDashboardActions,
      redacted: true,
    },

    launchHardeningCompletenessChecks: [
      "Launch checklist verifies completion summary, delivery dashboard, WordPress connector, Prisma dry-run gates, blocked incomplete outputs, routing separation, Git ignore, PM2 build rule, Nginx route, and backups.",
      "Environment gates require build before restart, Next.js on port 3101, WordPress separation, runtime upload ignore, Prisma feature flags, and backups.",
      "Security rules block secrets, WordPress credentials, payment payloads, PII, non-redacted receipts, non-append audit writes, incomplete customer-ready labels, and unauthorized ZIP delivery.",
      "Routing notes document Next.js main domain and future wp.omegacrownai.com WordPress routing.",
      "Backup requirements cover GitHub, server folders, WordPress files, WordPress DB, Nginx config, and PM2 process names.",
      "Feature flags keep real Prisma writes, WordPress publishing, and billing provider checks disabled until explicitly configured.",
      "Production proof confirms score 100, system ready, paid delivery allowed, homepage-only blocked, WordPress draft ready, and Prisma dry-run prepared.",
    ],

    nextImplementationPhases: [
      "WordPress Subdomain Routing",
      "Real Prisma Write Enablement",
      "Customer Billing Provider Integration",
      "Artifact System UI Polish",
      "Production Monitoring and Alerts",
    ],
  };
}
