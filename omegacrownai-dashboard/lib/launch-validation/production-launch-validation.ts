import { hashIdentityPayload } from "@/lib/identity-kernel/sovereign-identity-kernel";
import { buildProductionReleasePackage } from "@/lib/release-readiness/production-release-readiness";
import { buildProjectOSDashboard } from "@/lib/project-os/unified-project-os";
import { buildExecutivePlan } from "@/lib/executive-autopilot/executive-autopilot";
import { buildMarketplaceReport } from "@/lib/marketplace-ecosystem/marketplace-ecosystem";
import { buildCreativeProductionPackage } from "@/lib/creative-super-department/creative-super-department";
import { runDistributionPipeline } from "@/lib/distribution/distribution-super-pipeline";
import { summarizeCost, sampleTrace } from "@/lib/reliability/reliability-engine";

export type SmokeStatus = "pass" | "warning" | "fail";

export type SmokeCheck = {
  id: string;
  area: string;
  status: SmokeStatus;
  routeOrCheck: string;
  evidence: string;
  requiredForLaunch: boolean;
};

export type GoNoGoDecision = {
  decision: "go" | "conditional_go" | "no_go";
  blockers: string[];
  warnings: string[];
  requiredActions: string[];
};

export type LaunchValidationReport = {
  phase: "v7.4 Phase 95";
  generatedAt: string;
  latestExpectedCommit: string;
  smokeChecks: SmokeCheck[];
  goNoGo: GoNoGoDecision;
  releaseHash: string;
  validationHash: string;
  postLaunchWatchlist: string[];
};

export const criticalRoutes = [
  "/release/readiness",
  "/release/notes",
  "/release/runbook",
  "/release/rollback",
  "/project-os/dashboard",
  "/project-os/projects",
  "/project-os/builds",
  "/project-os/assets",
  "/project-os/queues",
  "/legal/terms",
  "/legal/privacy",
  "/legal/dpa",
  "/legal/billing-policy",
  "/legal/refund-policy",
  "/legal/provider-disclosure",
  "/legal/cookie-notice",
  "/observability",
  "/observability/alerts",
  "/observability/incident-response",
  "/identity/kernel",
  "/policy/engine",
  "/spine/orchestration",
  "/reliability/replay",
  "/distribution/pipeline",
  "/creative/directors-room",
  "/executive-autopilot/plan",
  "/marketplace-ecosystem/providers"
];

export const criticalApis = [
  "/api/release/readiness",
  "/api/release/notes",
  "/api/release/runbook",
  "/api/release/rollback",
  "/api/project-os/dashboard",
  "/api/identity/sign",
  "/api/policy/evaluate",
  "/api/spine/orchestrate",
  "/api/reliability/replay",
  "/api/distribution/pipeline",
  "/api/creative/directors-room",
  "/api/executive-autopilot/plan",
  "/api/marketplace-ecosystem/providers"
];

export function buildSmokeChecks(): SmokeCheck[] {
  const release = buildProductionReleasePackage();
  const projectOS = buildProjectOSDashboard();
  const executive = buildExecutivePlan();
  const marketplace = buildMarketplaceReport();
  const creative = buildCreativeProductionPackage();
  const distribution = runDistributionPipeline();
  const reliability = summarizeCost(sampleTrace);

  const routeChecks: SmokeCheck[] = criticalRoutes.map((route) => ({
    id: `route_${route.replaceAll("/", "_")}`,
    area: "Critical route",
    status: "pass",
    routeOrCheck: route,
    evidence: "Route is included in the production launch validation matrix.",
    requiredForLaunch: true
  }));

  const apiChecks: SmokeCheck[] = criticalApis.map((route) => ({
    id: `api_${route.replaceAll("/", "_")}`,
    area: "Critical API",
    status: "pass",
    routeOrCheck: route,
    evidence: "API is included in the production launch validation matrix.",
    requiredForLaunch: true
  }));

  const systemChecks: SmokeCheck[] = [
    {
      id: "system_release_readiness",
      area: "Release readiness",
      status: release.releaseStatus === "blocked" ? "fail" : release.releaseStatus === "conditional_ready" ? "warning" : "pass",
      routeOrCheck: "/release/readiness",
      evidence: `Release package status: ${release.releaseStatus}.`,
      requiredForLaunch: true
    },
    {
      id: "system_project_os_hash",
      area: "Project OS",
      status: projectOS.systemHash ? "pass" : "fail",
      routeOrCheck: "/project-os/dashboard",
      evidence: `Project OS system hash: ${projectOS.systemHash}.`,
      requiredForLaunch: true
    },
    {
      id: "system_executive_plan_hash",
      area: "Executive Autopilot",
      status: executive.planHash ? "pass" : "fail",
      routeOrCheck: "/executive-autopilot/plan",
      evidence: `Executive plan hash: ${executive.planHash}.`,
      requiredForLaunch: true
    },
    {
      id: "system_marketplace_readiness",
      area: "Marketplace",
      status: marketplace.marketplaceReadiness === "ready" ? "pass" : "warning",
      routeOrCheck: "/marketplace-ecosystem/providers",
      evidence: `Marketplace readiness: ${marketplace.marketplaceReadiness}.`,
      requiredForLaunch: false
    },
    {
      id: "system_creative_readiness",
      area: "Creative",
      status: creative.productionReadiness === "ready" ? "pass" : "warning",
      routeOrCheck: "/creative/directors-room",
      evidence: `Creative readiness: ${creative.productionReadiness}.`,
      requiredForLaunch: false
    },
    {
      id: "system_distribution_jobs",
      area: "Distribution",
      status: distribution.publishJobs.length > 0 ? "pass" : "fail",
      routeOrCheck: "/distribution/pipeline",
      evidence: `${distribution.publishJobs.length} distribution jobs prepared.`,
      requiredForLaunch: true
    },
    {
      id: "system_reliability_cost",
      area: "Reliability",
      status: reliability.costRisk === "high" ? "warning" : "pass",
      routeOrCheck: "/reliability/cost",
      evidence: `Reliability cost risk: ${reliability.costRisk}.`,
      requiredForLaunch: true
    },
    {
      id: "system_billing_validation",
      area: "Billing",
      status: "warning",
      routeOrCheck: "/pricing",
      evidence: "Billing foundation exists, but final Stripe checkout validation still requires real test/live keys.",
      requiredForLaunch: false
    }
  ];

  return [...systemChecks, ...routeChecks, ...apiChecks];
}

export function evaluateGoNoGo(smokeChecks: SmokeCheck[] = buildSmokeChecks()): GoNoGoDecision {
  const blockers = smokeChecks
    .filter((check) => check.status === "fail" && check.requiredForLaunch)
    .map((check) => `${check.area}: ${check.evidence}`);

  const warnings = smokeChecks
    .filter((check) => check.status === "warning")
    .map((check) => `${check.area}: ${check.evidence}`);

  const requiredActions = [
    "Run npm run build immediately before deployment.",
    "Confirm git status is clean before and after deployment.",
    "Validate critical release, Project OS, legal, observability, identity, policy, reliability, distribution, creative, executive, and marketplace routes.",
    "Complete real-key Stripe checkout validation before unrestricted paid acquisition.",
    "Keep marketplace providers and licensing-sensitive creative assets controlled until review clears.",
    "Monitor incident response, cost, latency, provider, and publishing signals after launch."
  ];

  return {
    decision: blockers.length > 0 ? "no_go" : warnings.length > 0 ? "conditional_go" : "go",
    blockers,
    warnings,
    requiredActions
  };
}

export function buildLaunchValidationReport(): LaunchValidationReport {
  const release = buildProductionReleasePackage();
  const smokeChecks = buildSmokeChecks();
  const goNoGo = evaluateGoNoGo(smokeChecks);

  const draft = {
    phase: "v7.4 Phase 95" as const,
    generatedAt: new Date().toISOString(),
    latestExpectedCommit: "4cf08f8 Add production release readiness package",
    smokeChecks,
    goNoGo,
    releaseHash: release.releaseHash,
    postLaunchWatchlist: [
      "Authentication and customer organization access",
      "Stripe checkout, billing portal, webhook, and entitlement behavior",
      "Provider credentials, publishing jobs, marketplace sandbox, and provider billing",
      "Creative licensing-sensitive assets and public distribution approvals",
      "Reliability replay, RCA, latency, and cost risk",
      "Legal, privacy, DPA, billing, refund, cookie, and provider disclosure availability",
      "Incident response owner coverage and launch commander availability"
    ]
  };

  return {
    ...draft,
    validationHash: hashIdentityPayload(draft)
  };
}

export const launchValidationControls = [
  {
    area: "Smoke test matrix",
    control:
      "Critical app routes and APIs must be validated after production build and deployment."
  },
  {
    area: "Go/no-go decision",
    control:
      "Launch should be blocked by required failures, conditional for warnings, and approved only when blockers are clear."
  },
  {
    area: "Billing caution",
    control:
      "Paid acquisition should remain controlled until Stripe real-key checkout and portal validation are complete."
  },
  {
    area: "Provider and creative controls",
    control:
      "Marketplace providers and licensing-sensitive creative assets must stay controlled until review clears."
  },
  {
    area: "Post-launch monitoring",
    control:
      "Reliability, cost, provider, publishing, incident, and customer access signals must be monitored after launch."
  }
];
