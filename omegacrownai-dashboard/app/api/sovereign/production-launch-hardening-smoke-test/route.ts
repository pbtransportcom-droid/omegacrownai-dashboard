import { NextResponse } from "next/server";
import { getProductionLaunchHardening } from "@/lib/sovereign/production-launch-hardening";

const requiredEnvironmentGates = [
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
];

const requiredSecurityRules = [
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
];

export async function GET() {
  const hardening = getProductionLaunchHardening();

  const missingEnvironmentGates = requiredEnvironmentGates.filter(
    (gate) => !hardening.environmentHardeningGates.includes(gate)
  );

  const missingSecurityRules = requiredSecurityRules.filter(
    (rule) => !hardening.securityHardeningRules.includes(rule)
  );

  const passedLaunchChecklist = hardening.launchChecklist.filter(
    (item) => item.passed
  ).length;

  const checks = [
    {
      name: "Production Launch Hardening is ready",
      passed: hardening.status === "production_launch_hardening_ready",
      detail: hardening.status,
    },
    {
      name: "Launch checklist passes",
      passed:
        passedLaunchChecklist === hardening.launchChecklist.length &&
        hardening.launchChecklist.length >= 10,
      detail: `${passedLaunchChecklist}/${hardening.launchChecklist.length}`,
    },
    {
      name: "Launch score is 100",
      passed: hardening.launchScore === 100 && hardening.launchReady === true,
      detail: `score ${hardening.launchScore}`,
    },
    {
      name: "Environment hardening gates present",
      passed: missingEnvironmentGates.length === 0,
      detail: missingEnvironmentGates.length
        ? `Missing: ${missingEnvironmentGates.join(", ")}`
        : "Environment gates present.",
    },
    {
      name: "Security hardening rules present",
      passed: missingSecurityRules.length === 0,
      detail: missingSecurityRules.length
        ? `Missing: ${missingSecurityRules.join(", ")}`
        : "Security rules present.",
    },
    {
      name: "Routing notes present",
      passed:
        hardening.productionRoutingNotes.length >= 5 &&
        hardening.productionRoutingNotes.some((note) =>
          note.includes("Next.js app")
        ) &&
        hardening.productionRoutingNotes.some((note) =>
          note.includes("WordPress currently lives")
        ),
      detail: `${hardening.productionRoutingNotes.length} routing notes`,
    },
    {
      name: "Backup requirements present",
      passed: hardening.backupRequirements.length >= 6,
      detail: `${hardening.backupRequirements.length} backup requirements`,
    },
    {
      name: "Feature flag gates present",
      passed:
        hardening.featureFlagGates.length >= 4 &&
        hardening.featureFlagGates.some(
          (flag) => flag.name === "ENABLE_REAL_PRISMA_ARTIFACT_WRITES"
        ) &&
        hardening.featureFlagGates.some(
          (flag) => flag.name === "WORDPRESS_PUBLISH_ENABLED"
        ),
      detail: `${hardening.featureFlagGates.length} feature flags`,
    },
    {
      name: "Production proof passes",
      passed:
        hardening.productionProof.completionScore === 100 &&
        hardening.productionProof.customerArtifactSystemReady === true &&
        hardening.productionProof.paidFinalDeliveryAllowed === true &&
        hardening.productionProof.homepageOnlyBlocked === true &&
        hardening.productionProof.wordpressDraftReady === true &&
        hardening.productionProof.prismaDryRunPrepared === true &&
        hardening.productionProof.redacted === true,
      detail: `score ${hardening.productionProof.completionScore}`,
    },
    {
      name: "Completeness checks present",
      passed: hardening.launchHardeningCompletenessChecks.length >= 7,
      detail: `${hardening.launchHardeningCompletenessChecks.length} checks`,
    },
  ];

  const passedChecks = checks.filter((check) => check.passed).length;

  return NextResponse.json({
    ok: checks.every((check) => check.passed),
    phase: "v26.7 Phase 287",
    service: "Production Launch Hardening Smoke Test",
    totalChecks: checks.length,
    passedChecks,
    failedChecks: checks.length - passedChecks,
    launchScore: hardening.launchScore,
    launchReady: hardening.launchReady,
    launchChecklistCount: hardening.launchChecklist.length,
    environmentGateCount: hardening.environmentHardeningGates.length,
    securityRuleCount: hardening.securityHardeningRules.length,
    routingNoteCount: hardening.productionRoutingNotes.length,
    backupRequirementCount: hardening.backupRequirements.length,
    featureFlagGateCount: hardening.featureFlagGates.length,
    productionCompletionScore: hardening.productionProof.completionScore,
    productionCustomerArtifactSystemReady:
      hardening.productionProof.customerArtifactSystemReady,
    paidFinalDeliveryAllowed:
      hardening.productionProof.paidFinalDeliveryAllowed,
    homepageOnlyBlocked: hardening.productionProof.homepageOnlyBlocked,
    wordpressDraftReady: hardening.productionProof.wordpressDraftReady,
    prismaDryRunPrepared: hardening.productionProof.prismaDryRunPrepared,
    checks,
  });
}
