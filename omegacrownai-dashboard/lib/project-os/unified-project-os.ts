import { hashIdentityPayload } from "@/lib/identity-kernel/sovereign-identity-kernel";
import { buildExecutivePlan } from "@/lib/executive-autopilot/executive-autopilot";
import { runDistributionPipeline } from "@/lib/distribution/distribution-super-pipeline";
import { buildCreativeProductionPackage } from "@/lib/creative-super-department/creative-super-department";
import { runOrchestration } from "@/lib/multi-agent-spine/multi-agent-spine";
import { summarizeCost, sampleTrace } from "@/lib/reliability/reliability-engine";
import { buildMarketplaceReport } from "@/lib/marketplace-ecosystem/marketplace-ecosystem";

export type ProjectOSStatus =
  | "draft"
  | "active"
  | "building"
  | "publishing"
  | "paused"
  | "complete";

export type ProjectOSProject = {
  id: string;
  name: string;
  status: ProjectOSStatus;
  owner: string;
  agents: string[];
  assets: string[];
  builds: string[];
  pipelines: string[];
  createdAt: string;
  updatedAt: string;
};

export type ProjectBuild = {
  id: string;
  projectId: string;
  type: "creative" | "distribution" | "executive" | "marketplace" | "system";
  status: "queued" | "running" | "complete" | "failed" | "needs_review";
  summary: string;
  startedAt: string;
  completedAt?: string;
  traceHash: string;
};

export type ProjectAsset = {
  id: string;
  projectId: string;
  type: "script" | "image" | "video" | "audio" | "document" | "report" | "data";
  name: string;
  source: string;
  status: "draft" | "approved" | "published" | "archived" | "needs_review";
  hash: string;
};

export type QueueItem = {
  id: string;
  projectId: string;
  queue: "render" | "publish" | "review" | "distribution" | "executive";
  status: "queued" | "running" | "blocked" | "complete";
  priority: number;
  reason: string;
};

export type ProjectOSDashboard = {
  phase: "v7.1 Phase 92";
  project: ProjectOSProject;
  builds: ProjectBuild[];
  assets: ProjectAsset[];
  queues: QueueItem[];
  observability: {
    reliabilityCostRisk: string;
    marketplaceReadiness: string;
    creativeReadiness: string;
    distributionJobs: number;
    executivePlanHash: string;
    orchestrationWinner: string;
  };
  systemHash: string;
  recommendations: string[];
};

export function createProject(name = "OmegaCrownAI Unified Launch OS"): ProjectOSProject {
  const now = new Date().toISOString();

  return {
    id: "project_os_omega_unified",
    name,
    status: "active",
    owner: "executive_autopilot",
    agents: [
      "agent_strategy_director",
      "agent_security_governor",
      "agent_growth_operator",
      "creative_director",
      "marketplace_provider_runtime"
    ],
    assets: [
      "asset_executive_report",
      "asset_creative_package",
      "asset_distribution_variants",
      "asset_marketplace_report"
    ],
    builds: [
      "build_creative_package",
      "build_distribution_pipeline",
      "build_executive_plan",
      "build_marketplace_report"
    ],
    pipelines: [
      "identity",
      "policy",
      "spine",
      "reliability",
      "distribution",
      "creative",
      "executive",
      "marketplace"
    ],
    createdAt: now,
    updatedAt: now
  };
}

export function createBuildHistory(project: ProjectOSProject): ProjectBuild[] {
  const now = new Date().toISOString();

  return [
    {
      id: "build_creative_package",
      projectId: project.id,
      type: "creative",
      status: "needs_review",
      summary: "Creative Super-Department package prepared with scenes, assets, critiques, and licensing checks.",
      startedAt: now,
      completedAt: now,
      traceHash: hashIdentityPayload({
        projectId: project.id,
        build: "creative",
        package: buildCreativeProductionPackage()
      })
    },
    {
      id: "build_distribution_pipeline",
      projectId: project.id,
      type: "distribution",
      status: "complete",
      summary: "Distribution pipeline prepared campaign, variants, publish jobs, KPI forecasts, and feedback.",
      startedAt: now,
      completedAt: now,
      traceHash: hashIdentityPayload({
        projectId: project.id,
        build: "distribution",
        pipeline: runDistributionPipeline()
      })
    },
    {
      id: "build_executive_plan",
      projectId: project.id,
      type: "executive",
      status: "complete",
      summary: "Executive Autopilot generated goals, forecasts, priorities, budget, and review loop.",
      startedAt: now,
      completedAt: now,
      traceHash: hashIdentityPayload({
        projectId: project.id,
        build: "executive",
        plan: buildExecutivePlan()
      })
    },
    {
      id: "build_marketplace_report",
      projectId: project.id,
      type: "marketplace",
      status: "needs_review",
      summary: "Marketplace provider ecosystem report prepared with registry, verification, sandbox, and billing.",
      startedAt: now,
      completedAt: now,
      traceHash: hashIdentityPayload({
        projectId: project.id,
        build: "marketplace",
        report: buildMarketplaceReport()
      })
    }
  ];
}

export function createAssetLibrary(project: ProjectOSProject): ProjectAsset[] {
  const creative = buildCreativeProductionPackage();
  const distribution = runDistributionPipeline();
  const executive = buildExecutivePlan();
  const marketplace = buildMarketplaceReport();

  return [
    {
      id: "asset_executive_report",
      projectId: project.id,
      type: "report",
      name: "Executive Autopilot Plan",
      source: "executive-autopilot",
      status: "approved",
      hash: executive.planHash
    },
    {
      id: "asset_creative_package",
      projectId: project.id,
      type: "document",
      name: "Creative Production Package",
      source: "creative-super-department",
      status: creative.productionReadiness === "ready" ? "approved" : "needs_review",
      hash: hashIdentityPayload(creative)
    },
    {
      id: "asset_distribution_variants",
      projectId: project.id,
      type: "data",
      name: "Distribution Campaign Variants",
      source: "distribution-super-pipeline",
      status: "approved",
      hash: hashIdentityPayload(distribution.variants)
    },
    {
      id: "asset_marketplace_report",
      projectId: project.id,
      type: "report",
      name: "Marketplace Provider Report",
      source: "marketplace-ecosystem",
      status: marketplace.marketplaceReadiness === "ready" ? "approved" : "needs_review",
      hash: hashIdentityPayload(marketplace)
    }
  ];
}

export function createQueues(project: ProjectOSProject): QueueItem[] {
  return [
    {
      id: "queue_render_creative_demo",
      projectId: project.id,
      queue: "render",
      status: "queued",
      priority: 80,
      reason: "Render creative package after licensing review clears voice, music, B-roll, and likeness requirements."
    },
    {
      id: "queue_publish_distribution",
      projectId: project.id,
      queue: "publish",
      status: "queued",
      priority: 75,
      reason: "Publish scheduled distribution jobs after launch commander approval."
    },
    {
      id: "queue_review_marketplace",
      projectId: project.id,
      queue: "review",
      status: "blocked",
      priority: 85,
      reason: "High-risk marketplace providers require verification before broad availability."
    },
    {
      id: "queue_executive_weekly_review",
      projectId: project.id,
      queue: "executive",
      status: "queued",
      priority: 90,
      reason: "Run weekly review after KPI updates, forecast comparison, and budget check."
    }
  ];
}

export function buildProjectOSDashboard(): ProjectOSDashboard {
  const project = createProject();
  const builds = createBuildHistory(project);
  const assets = createAssetLibrary(project);
  const queues = createQueues(project);

  const executive = buildExecutivePlan();
  const creative = buildCreativeProductionPackage();
  const distribution = runDistributionPipeline();
  const marketplace = buildMarketplaceReport();
  const reliability = summarizeCost(sampleTrace);
  const orchestration = runOrchestration({
    prompt: "Coordinate unified Project OS finalization."
  });

  const dashboardDraft = {
    phase: "v7.1 Phase 92" as const,
    project,
    builds,
    assets,
    queues,
    observability: {
      reliabilityCostRisk: reliability.costRisk,
      marketplaceReadiness: marketplace.marketplaceReadiness,
      creativeReadiness: creative.productionReadiness,
      distributionJobs: distribution.publishJobs.length,
      executivePlanHash: executive.planHash,
      orchestrationWinner: orchestration.consensus.winnerAgentId
    },
    recommendations: [
      "Use Project OS as the single customer-facing surface for builds, assets, queues, publishing, and observability.",
      "Keep marketplace provider review blocked until high-risk verification clears.",
      "Keep creative package in review until licensing-sensitive assets are cleared.",
      "Run executive weekly review before expanding distribution budget.",
      "Connect these foundation objects to persistent project storage in the next hardening cycle."
    ]
  };

  return {
    ...dashboardDraft,
    systemHash: hashIdentityPayload(dashboardDraft)
  };
}

export const projectOSControls = [
  {
    area: "Project manager",
    control:
      "Project OS should unify project identity, owners, agents, assets, builds, and pipelines."
  },
  {
    area: "Build history",
    control:
      "Every major subsystem output should become a traceable build with status, summary, timestamps, and hash."
  },
  {
    area: "Asset library",
    control:
      "Creative packages, executive reports, distribution variants, marketplace reports, and generated files should be tracked as project assets."
  },
  {
    area: "Render and publish queues",
    control:
      "Render, publish, review, distribution, and executive tasks should be visible as prioritized queues."
  },
  {
    area: "Observability dashboard",
    control:
      "Reliability, marketplace, creative, distribution, executive, and spine signals should appear in one operational view."
  },
  {
    area: "Unified user surface",
    control:
      "Customers should access OmegaCrownAI through a single project operating system rather than separate subsystem pages."
  }
];
