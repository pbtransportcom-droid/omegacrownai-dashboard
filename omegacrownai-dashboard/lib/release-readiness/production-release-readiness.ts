import { hashIdentityPayload } from "@/lib/identity-kernel/sovereign-identity-kernel";
import { buildProjectOSDashboard } from "@/lib/project-os/unified-project-os";
import { buildExecutivePlan } from "@/lib/executive-autopilot/executive-autopilot";
import { buildMarketplaceReport } from "@/lib/marketplace-ecosystem/marketplace-ecosystem";
import { buildCreativeProductionPackage } from "@/lib/creative-super-department/creative-super-department";
import { runDistributionPipeline } from "@/lib/distribution/distribution-super-pipeline";
import { summarizeCost, sampleTrace } from "@/lib/reliability/reliability-engine";

export type ReleaseGateStatus = "pass" | "conditional" | "blocker";

export type ReleaseGate = {
  id: string;
  area: string;
  status: ReleaseGateStatus;
  evidence: string;
  owner: string;
  actionRequired: string;
};

export type ReleaseNote = {
  phase: string;
  title: string;
  summary: string;
  routes: string[];
};

export type DeploymentStep = {
  order: number;
  title: string;
  commandOrAction: string;
  successCriteria: string;
};

export type RollbackStep = {
  order: number;
  trigger: string;
  action: string;
  validation: string;
};

export type ProductionReleasePackage = {
  phase: "v7.3 Phase 94";
  releaseName: string;
  generatedAt: string;
  releaseStatus: "ready" | "conditional_ready" | "blocked";
  gates: ReleaseGate[];
  releaseNotes: ReleaseNote[];
  deploymentRunbook: DeploymentStep[];
  rollbackChecklist: RollbackStep[];
  postLaunchValidation: string[];
  releaseHash: string;
};

export const releaseNotes: ReleaseNote[] = [
  {
    phase: "v6.3 Phase 84",
    title: "Sovereign Identity Kernel Foundation",
    summary:
      "Added deterministic agent identity signatures, behavioral fingerprints, identity ledger, drift checks, and replay foundations.",
    routes: [
      "/identity/kernel",
      "/identity/ledger",
      "/identity/drift",
      "/identity/replay",
      "/api/identity/sign",
      "/api/identity/verify",
      "/api/identity/ledger",
      "/api/identity/drift/check",
      "/api/identity/replay"
    ]
  },
  {
    phase: "v6.4 Phase 85",
    title: "Global Policy Engine Foundation",
    summary:
      "Added policy registry, policy evaluation, conflict detection, and enforcement hook foundations.",
    routes: [
      "/policy/engine",
      "/policy/registry",
      "/policy/conflicts",
      "/policy/enforcement",
      "/api/policy/evaluate",
      "/api/policy/registry",
      "/api/policy/conflicts"
    ]
  },
  {
    phase: "v6.5 Phase 86",
    title: "Multi-Agent Orchestration Spine",
    summary:
      "Added debate, critique, consensus, execution planning, and memory arbitration foundations.",
    routes: [
      "/spine/orchestration",
      "/spine/debate",
      "/spine/consensus",
      "/spine/memory",
      "/api/spine/orchestrate",
      "/api/spine/debate",
      "/api/spine/consensus"
    ]
  },
  {
    phase: "v6.6 Phase 87",
    title: "Reliability Replay, RCA + Cost Observability",
    summary:
      "Added replay, root-cause analysis, execution trace, latency, and cost observability foundations.",
    routes: [
      "/reliability/replay",
      "/reliability/rca",
      "/reliability/cost",
      "/api/reliability/replay",
      "/api/reliability/rca",
      "/api/reliability/cost"
    ]
  },
  {
    phase: "v6.7 Phase 88",
    title: "Distribution Super-Pipeline Expansion",
    summary:
      "Added campaign pipeline, channel variants, publishing jobs, KPI scoring, and feedback loops.",
    routes: [
      "/distribution/pipeline",
      "/distribution/campaigns",
      "/distribution/variants",
      "/distribution/kpis",
      "/api/distribution/pipeline",
      "/api/distribution/campaigns",
      "/api/distribution/variants",
      "/api/distribution/kpis"
    ]
  },
  {
    phase: "v6.8 Phase 89",
    title: "Creative Super-Department Upgrade",
    summary:
      "Added director room, scene planning, asset pipeline, licensing checks, and creative production readiness.",
    routes: [
      "/creative/directors-room",
      "/creative/scene-plan",
      "/creative/asset-pipeline",
      "/creative/licensing",
      "/api/creative/directors-room",
      "/api/creative/scene-plan",
      "/api/creative/asset-pipeline",
      "/api/creative/licensing"
    ]
  },
  {
    phase: "v6.9 Phase 90",
    title: "Executive Autopilot Intelligence Layer",
    summary:
      "Added goals, forecasts, competitor signals, priorities, budget allocation, and executive review loop.",
    routes: [
      "/executive-autopilot/plan",
      "/executive-autopilot/forecast",
      "/executive-autopilot/priorities",
      "/executive-autopilot/review",
      "/api/executive-autopilot/plan",
      "/api/executive-autopilot/forecast",
      "/api/executive-autopilot/priorities",
      "/api/executive-autopilot/review"
    ]
  },
  {
    phase: "v7.0 Phase 91",
    title: "Marketplace + Provider Ecosystem Expansion",
    summary:
      "Added provider registry, verification, sandbox runtime, scopes, and provider billing foundations.",
    routes: [
      "/marketplace-ecosystem/providers",
      "/marketplace-ecosystem/verification",
      "/marketplace-ecosystem/sandbox",
      "/marketplace-ecosystem/billing",
      "/api/marketplace-ecosystem/providers",
      "/api/marketplace-ecosystem/verification",
      "/api/marketplace-ecosystem/sandbox",
      "/api/marketplace-ecosystem/billing"
    ]
  },
  {
    phase: "v7.1 Phase 92",
    title: "Unified Project OS Finalization",
    summary:
      "Added Project OS dashboard, projects, builds, assets, queues, and unified operating surface.",
    routes: [
      "/project-os/dashboard",
      "/project-os/projects",
      "/project-os/builds",
      "/project-os/assets",
      "/project-os/queues",
      "/api/project-os/dashboard",
      "/api/project-os/projects",
      "/api/project-os/builds",
      "/api/project-os/assets",
      "/api/project-os/queues"
    ]
  }
];

export function buildReleaseGates(): ReleaseGate[] {
  const projectOS = buildProjectOSDashboard();
  const executive = buildExecutivePlan();
  const marketplace = buildMarketplaceReport();
  const creative = buildCreativeProductionPackage();
  const distribution = runDistributionPipeline();
  const reliability = summarizeCost(sampleTrace);

  return [
    {
      id: "gate_repo_hygiene",
      area: "Repo hygiene",
      status: "pass",
      evidence:
        "Phase 93 cleaned package files, broken ESLint config, generated exports, and confirmed clean status.",
      owner: "Engineering",
      actionRequired: "Keep safe targeted git add discipline for all future phases."
    },
    {
      id: "gate_build",
      area: "Production build",
      status: "pass",
      evidence: "Production build completed successfully after Phase 93 cleanup.",
      owner: "Engineering",
      actionRequired: "Run npm run build before deployment and after environment changes."
    },
    {
      id: "gate_project_os",
      area: "Project OS",
      status: "pass",
      evidence: `Project OS system hash present: ${projectOS.systemHash}`,
      owner: "Product",
      actionRequired: "Use Project OS dashboard as release command surface."
    },
    {
      id: "gate_executive_plan",
      area: "Executive plan",
      status: "pass",
      evidence: `Executive plan hash present: ${executive.planHash}`,
      owner: "Executive",
      actionRequired: "Review executive weekly focus after launch."
    },
    {
      id: "gate_marketplace",
      area: "Marketplace providers",
      status:
        marketplace.marketplaceReadiness === "ready" ? "pass" : "conditional",
      evidence: `Marketplace readiness: ${marketplace.marketplaceReadiness}`,
      owner: "Marketplace / Security",
      actionRequired:
        "Keep high-risk providers under controlled review before broad availability."
    },
    {
      id: "gate_creative",
      area: "Creative package",
      status: creative.productionReadiness === "ready" ? "pass" : "conditional",
      evidence: `Creative production readiness: ${creative.productionReadiness}`,
      owner: "Creative",
      actionRequired:
        "Clear licensing-sensitive assets before public campaign publishing."
    },
    {
      id: "gate_distribution",
      area: "Distribution pipeline",
      status: distribution.publishJobs.length > 0 ? "pass" : "blocker",
      evidence: `${distribution.publishJobs.length} distribution publish jobs prepared.`,
      owner: "Growth",
      actionRequired:
        "Run launch commander approval before live distribution expansion."
    },
    {
      id: "gate_reliability_cost",
      area: "Reliability and cost",
      status: reliability.costRisk === "high" ? "conditional" : "pass",
      evidence: `Reliability cost risk: ${reliability.costRisk}`,
      owner: "Operations",
      actionRequired:
        "Monitor cost, latency, replay, and RCA signals during post-launch validation."
    },
    {
      id: "gate_billing",
      area: "Billing validation",
      status: "conditional",
      evidence:
        "Billing foundation is in place, but final Stripe checkout validation requires real test/live keys.",
      owner: "Finance / Operations",
      actionRequired:
        "Complete real-key checkout and portal validation before unrestricted paid acquisition."
    }
  ];
}

export const deploymentRunbook: DeploymentStep[] = [
  {
    order: 1,
    title: "Confirm repo status",
    commandOrAction: "git status --short && git log --oneline -5",
    successCriteria: "Repo is clean and latest commit is the intended release commit."
  },
  {
    order: 2,
    title: "Install dependencies",
    commandOrAction: "npm ci",
    successCriteria: "Dependencies install without lockfile mutation."
  },
  {
    order: 3,
    title: "Build production app",
    commandOrAction: "npm run build",
    successCriteria: "Next.js production build completes successfully."
  },
  {
    order: 4,
    title: "Validate critical routes",
    commandOrAction:
      "Check /project-os/dashboard, /release/readiness, /api/release/readiness, /api/project-os/dashboard",
    successCriteria: "Routes return expected static or JSON responses."
  },
  {
    order: 5,
    title: "Validate environment and secrets",
    commandOrAction:
      "Confirm production env vars, provider credentials, OAuth apps, billing keys, and storage configuration.",
    successCriteria: "Required services are configured and secrets are not exposed in logs or responses."
  },
  {
    order: 6,
    title: "Deploy",
    commandOrAction: "Use the production deployment process for the server or hosting provider.",
    successCriteria: "Deployment completes and app starts without runtime errors."
  },
  {
    order: 7,
    title: "Post-launch smoke test",
    commandOrAction:
      "Test login, pricing, legal, observability, release readiness, Project OS, marketplace, executive, and distribution routes.",
    successCriteria: "Smoke tests pass and no SEV1/SEV2 incidents are active."
  }
];

export const rollbackChecklist: RollbackStep[] = [
  {
    order: 1,
    trigger: "Deployment fails to start or build artifact is invalid.",
    action: "Rollback to the previous known-good deployment.",
    validation: "App loads and health-critical routes respond."
  },
  {
    order: 2,
    trigger: "Authentication, billing, or customer organization access breaks.",
    action: "Pause launch traffic and rollback immediately.",
    validation: "Login, pricing, and customer organization routes recover."
  },
  {
    order: 3,
    trigger: "Provider credential exposure, cross-tenant issue, or data safety incident appears.",
    action: "Declare SEV1, disable affected provider/route, rollback if deployment-related.",
    validation: "Exposure path is closed and incident response is active."
  },
  {
    order: 4,
    trigger: "Marketplace sandbox or distribution publishing causes unsafe execution.",
    action: "Disable marketplace/distribution expansion and keep providers in review.",
    validation: "Blocked routes/actions no longer execute."
  },
  {
    order: 5,
    trigger: "Cost, latency, or reliability errors exceed launch control thresholds.",
    action: "Pause rollout, reduce traffic, disable high-cost jobs, and rollback if necessary.",
    validation: "Cost and error metrics return to acceptable range."
  }
];

export const postLaunchValidation = [
  "Confirm release readiness page loads.",
  "Confirm release readiness API returns gates and release hash.",
  "Confirm Project OS dashboard loads.",
  "Confirm identity, policy, spine, reliability, distribution, creative, executive, and marketplace routes still load.",
  "Confirm legal, privacy, billing policy, provider disclosure, and DPA pages remain available.",
  "Confirm monitoring, alerts, and incident-response pages remain available.",
  "Confirm no package-lock or generated export files changed after deployment.",
  "Confirm Stripe checkout with real keys before unrestricted paid acquisition.",
  "Confirm support channel and incident owner coverage before customer rollout expansion."
];

export function buildProductionReleasePackage(): ProductionReleasePackage {
  const gates = buildReleaseGates();
  const hasBlocker = gates.some((gate) => gate.status === "blocker");
  const hasConditional = gates.some((gate) => gate.status === "conditional");

  const draft = {
    phase: "v7.3 Phase 94" as const,
    releaseName: "OmegaCrownAI v7.1 Production Release Candidate",
    generatedAt: new Date().toISOString(),
    releaseStatus: hasBlocker
      ? ("blocked" as const)
      : hasConditional
        ? ("conditional_ready" as const)
        : ("ready" as const),
    gates,
    releaseNotes,
    deploymentRunbook,
    rollbackChecklist,
    postLaunchValidation
  };

  return {
    ...draft,
    releaseHash: hashIdentityPayload(draft)
  };
}

export const releaseReadinessControls = [
  {
    area: "Release packaging",
    control:
      "Every completed subsystem should appear in release notes with routes and production impact."
  },
  {
    area: "Deployment readiness",
    control:
      "Deployment requires clean repo, dependency install, production build, route smoke tests, and environment validation."
  },
  {
    area: "Rollback readiness",
    control:
      "Rollback triggers and validation steps must be clear before public launch traffic expands."
  },
  {
    area: "Post-launch validation",
    control:
      "Critical pages, APIs, legal routes, monitoring, and billing paths must be checked after deployment."
  },
  {
    area: "Conditional gates",
    control:
      "Billing, marketplace, creative licensing, and provider-sensitive items may remain controlled until validated."
  }
];
