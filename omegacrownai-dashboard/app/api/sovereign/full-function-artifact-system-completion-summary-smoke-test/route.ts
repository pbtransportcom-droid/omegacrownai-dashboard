import { NextResponse } from "next/server";
import { getFullFunctionArtifactSystemCompletionSummary } from "@/lib/sovereign/full-function-artifact-system-completion-summary";

const requiredReadyModules = [
  "Real full-stack artifact generator",
  "Production website/app generator file writer",
  "Full-function customer artifact release gate",
  "Customer artifact billing entitlement gate",
  "Customer artifact delivery dashboard",
  "WordPress backup publishing connector",
  "Artifact storage real Prisma write implementation",
  "Rebuild rollback persistence integration",
  "Customer export audit persistence",
  "Artifact storage database write API",
];

const requiredChecks = [
  "All major artifact modules report ready status.",
  "Full-stack release gate passes with score 100.",
  "Homepage-only release gate remains blocked.",
  "Paid active customer final delivery and download are allowed.",
  "Trial preview blocks final delivery.",
  "WordPress draft publishing is prepared.",
  "Prisma storage/history/audit dry-run payloads are prepared.",
  "Rebuild/rollback preserves customer-ready artifacts and rollback lineage.",
  "Audit persistence is redacted and append-only.",
  "Delivery dashboard exposes cards/actions and redacted status.",
];

export async function GET() {
  const summary = getFullFunctionArtifactSystemCompletionSummary();

  const missingModules = requiredReadyModules.filter(
    (moduleName) =>
      !summary.moduleReadinessMap.some(
        (item) => item.module === moduleName && item.ready === true
      )
  );

  const missingChecks = requiredChecks.filter(
    (check) => !summary.completionSummaryChecks.includes(check)
  );

  const checklistPassedCount = summary.productionReadinessChecklist.filter(
    (item) => item.passed
  ).length;

  const checks = [
    {
      name: "Full-Function Artifact System Completion Summary is ready",
      passed:
        summary.status ===
        "full_function_artifact_system_completion_summary_ready",
      detail: summary.status,
    },
    {
      name: "All required modules are ready",
      passed: missingModules.length === 0,
      detail: missingModules.length
        ? `Missing: ${missingModules.join(", ")}`
        : "All modules ready.",
    },
    {
      name: "Production readiness checklist passes",
      passed:
        checklistPassedCount === summary.productionReadinessChecklist.length &&
        summary.productionReadinessChecklist.length >= 10,
      detail: `${checklistPassedCount}/${summary.productionReadinessChecklist.length}`,
    },
    {
      name: "System completion score is 100",
      passed:
        summary.completionScore === 100 &&
        summary.customerArtifactSystemReady === true,
      detail: `score ${summary.completionScore}`,
    },
    {
      name: "End-to-end full-stack delivery proof passes",
      passed:
        summary.endToEndProof.fullStackReleaseAllowed === true &&
        summary.endToEndProof.fullStackScore === 100 &&
        summary.endToEndProof.paidFinalDeliveryAllowed === true &&
        summary.endToEndProof.paidDownloadAllowed === true,
      detail: `score ${summary.endToEndProof.fullStackScore}`,
    },
    {
      name: "Blocked output proof passes",
      passed:
        summary.blockedOutputProof.homepageOnlyBlocked === true &&
        summary.blockedOutputProof.homepageOnlyCustomerReady === false &&
        summary.blockedOutputProof.trialFinalDeliveryBlocked === true,
      detail: `${summary.blockedOutputProof.homepageOnlyBlockedReasonCount} blocked reasons`,
    },
    {
      name: "WordPress and Prisma proof passes",
      passed:
        summary.endToEndProof.wordpressDraftReady === true &&
        summary.endToEndProof.wordpressDraftPostStatus === "draft" &&
        summary.endToEndProof.prismaDryRunPrepared === true,
      detail: summary.endToEndProof.wordpressDraftPostStatus,
    },
    {
      name: "Rebuild, rollback, audit, and delivery dashboard proof passes",
      passed:
        summary.endToEndProof.rebuildRollbackPreservesNewerArtifacts === true &&
        summary.endToEndProof.auditPersistenceRedacted === true &&
        summary.endToEndProof.deliveryDashboardCards >= 5 &&
        summary.endToEndProof.deliveryDashboardActions >= 6 &&
        summary.endToEndProof.redacted === true,
      detail: `${summary.endToEndProof.deliveryDashboardCards} cards`,
    },
    {
      name: "Completion summary checks present",
      passed: missingChecks.length === 0,
      detail: missingChecks.length
        ? `Missing: ${missingChecks.join(", ")}`
        : "Completion checks present.",
    },
    {
      name: "Operational notes present",
      passed:
        summary.operationalNotes.length >= 6 &&
        summary.operationalNotes.some((note) =>
          note.includes("main domain remains the Next.js app")
        ) &&
        summary.operationalNotes.some((note) =>
          note.includes("WordPress is a publishing/backup CMS")
        ),
      detail: `${summary.operationalNotes.length} notes`,
    },
  ];

  const passedChecks = checks.filter((check) => check.passed).length;

  return NextResponse.json({
    ok: checks.every((check) => check.passed),
    phase: "v26.6 Phase 286",
    service: "Full-Function Artifact System Completion Summary Smoke Test",
    totalChecks: checks.length,
    passedChecks,
    failedChecks: checks.length - passedChecks,
    completionScore: summary.completionScore,
    customerArtifactSystemReady: summary.customerArtifactSystemReady,
    readyModuleCount: summary.moduleReadinessMap.filter((item) => item.ready).length,
    moduleCount: summary.moduleReadinessMap.length,
    readinessChecklistPassedCount: checklistPassedCount,
    readinessChecklistCount: summary.productionReadinessChecklist.length,
    fullStackReleaseAllowed: summary.endToEndProof.fullStackReleaseAllowed,
    fullStackScore: summary.endToEndProof.fullStackScore,
    paidFinalDeliveryAllowed: summary.endToEndProof.paidFinalDeliveryAllowed,
    homepageOnlyBlocked: summary.blockedOutputProof.homepageOnlyBlocked,
    wordpressDraftReady: summary.endToEndProof.wordpressDraftReady,
    prismaDryRunPrepared: summary.endToEndProof.prismaDryRunPrepared,
    deliveryDashboardCards: summary.endToEndProof.deliveryDashboardCards,
    deliveryDashboardActions: summary.endToEndProof.deliveryDashboardActions,
    checks,
  });
}
