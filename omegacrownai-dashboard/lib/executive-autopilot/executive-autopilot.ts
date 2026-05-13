import { hashIdentityPayload } from "@/lib/identity-kernel/sovereign-identity-kernel";
import { runDistributionPipeline } from "@/lib/distribution/distribution-super-pipeline";
import { buildCreativeProductionPackage } from "@/lib/creative-super-department/creative-super-department";
import { summarizeCost, sampleTrace } from "@/lib/reliability/reliability-engine";

export type ExecutiveTimeframe = "weekly" | "monthly" | "quarterly";

export type ExecutiveGoal = {
  id: string;
  metric: string;
  current: number;
  target: number;
  timeframe: ExecutiveTimeframe;
  owner: string;
  rationale: string;
};

export type Forecast = {
  id: string;
  metric: string;
  history: number[];
  predicted: number;
  confidence: number;
  direction: "up" | "down" | "flat";
};

export type CompetitorSignal = {
  id: string;
  competitor: string;
  signal: string;
  severity: "low" | "medium" | "high";
  suggestedResponse: string;
};

export type Initiative = {
  id: string;
  type: "campaign" | "feature" | "experiment" | "operations" | "sales";
  title: string;
  expectedImpact: number;
  costUsd: number;
  risk: number;
  dependency: string;
};

export type PrioritizedInitiative = Initiative & {
  priorityScore: number;
  rank: number;
};

export type BudgetAllocation = {
  category: string;
  amountUsd: number;
  reason: string;
};

export type ExecutivePlan = {
  phase: "v6.9 Phase 90";
  id: string;
  generatedAt: string;
  goals: ExecutiveGoal[];
  forecasts: Forecast[];
  competitorSignals: CompetitorSignal[];
  initiatives: PrioritizedInitiative[];
  budget: BudgetAllocation[];
  weeklyFocus: string[];
  triggerCycles: string[];
  planHash: string;
};

export type ExecutiveReview = {
  planId: string;
  status: "on_track" | "watch" | "needs_action";
  wins: string[];
  risks: string[];
  nextActions: string[];
};

export const sampleKpis = {
  views: 12000,
  conversions: 42,
  qualifiedLeads: 16,
  revenueUsd: 8400,
  activationRate: 0.31,
  supportLoad: 7
};

export const sampleInitiatives: Initiative[] = [
  {
    id: "initiative_enterprise_linkedin",
    type: "campaign",
    title: "Launch enterprise LinkedIn distribution sequence",
    expectedImpact: 88,
    costUsd: 1200,
    risk: 22,
    dependency: "Distribution Super-Pipeline"
  },
  {
    id: "initiative_creative_demo_video",
    type: "campaign",
    title: "Produce premium executive demo video",
    expectedImpact: 92,
    costUsd: 1800,
    risk: 30,
    dependency: "Creative Super-Department"
  },
  {
    id: "initiative_billing_validation",
    type: "operations",
    title: "Complete Stripe real-key checkout validation",
    expectedImpact: 95,
    costUsd: 300,
    risk: 10,
    dependency: "Billing activation"
  },
  {
    id: "initiative_provider_marketplace_prep",
    type: "feature",
    title: "Prepare provider marketplace expansion",
    expectedImpact: 76,
    costUsd: 2200,
    risk: 44,
    dependency: "Marketplace Ecosystem"
  },
  {
    id: "initiative_customer_onboarding_refinement",
    type: "experiment",
    title: "Optimize onboarding checklist and activation emails",
    expectedImpact: 70,
    costUsd: 450,
    risk: 12,
    dependency: "Customer Rollout"
  }
];

export function generateGoals(kpis = sampleKpis): ExecutiveGoal[] {
  return [
    {
      id: "goal_views_weekly",
      metric: "views",
      current: kpis.views,
      target: Math.round(kpis.views * 1.2),
      timeframe: "weekly",
      owner: "growth_operator",
      rationale: "Increase top-of-funnel reach for enterprise launch momentum."
    },
    {
      id: "goal_qualified_leads_weekly",
      metric: "qualifiedLeads",
      current: kpis.qualifiedLeads,
      target: Math.round(kpis.qualifiedLeads * 1.35),
      timeframe: "weekly",
      owner: "sales",
      rationale: "Convert distribution attention into enterprise pipeline."
    },
    {
      id: "goal_activation_monthly",
      metric: "activationRate",
      current: kpis.activationRate,
      target: Number((kpis.activationRate + 0.12).toFixed(2)),
      timeframe: "monthly",
      owner: "customer_success",
      rationale: "Improve customer onboarding and first workflow success."
    },
    {
      id: "goal_revenue_monthly",
      metric: "revenueUsd",
      current: kpis.revenueUsd,
      target: Math.round(kpis.revenueUsd * 1.25),
      timeframe: "monthly",
      owner: "executive",
      rationale: "Grow paid adoption while billing validation remains controlled."
    }
  ];
}

export function forecastMetric(metric: string, history: number[]): Forecast {
  const average = history.reduce((sum, value) => sum + value, 0) / Math.max(history.length, 1);
  const latest = history[history.length - 1] ?? average;
  const previous = history[history.length - 2] ?? latest;
  const trend = latest - previous;
  const predicted = Math.max(0, Math.round((average + trend * 1.25) * 100) / 100);
  const volatility =
    history.length > 1
      ? history.reduce((sum, value) => sum + Math.abs(value - average), 0) / history.length
      : 0;
  const confidence = Number(Math.max(0.55, Math.min(0.95, 1 - volatility / Math.max(average * 2, 1))).toFixed(2));

  return {
    id: `forecast_${metric}`,
    metric,
    history,
    predicted,
    confidence,
    direction: trend > 0 ? "up" : trend < 0 ? "down" : "flat"
  };
}

export function generateForecasts(): Forecast[] {
  return [
    forecastMetric("views", [8200, 9400, 10800, sampleKpis.views]),
    forecastMetric("qualifiedLeads", [9, 11, 13, sampleKpis.qualifiedLeads]),
    forecastMetric("revenueUsd", [5200, 6100, 7600, sampleKpis.revenueUsd]),
    forecastMetric("activationRate", [0.21, 0.25, 0.28, sampleKpis.activationRate])
  ];
}

export function analyzeCompetitors(): CompetitorSignal[] {
  return [
    {
      id: "signal_ai_ops_fragmentation",
      competitor: "Generic AI tool stacks",
      signal:
        "Competitors remain fragmented across content generation, publishing, billing, audit, and governance.",
      severity: "high",
      suggestedResponse:
        "Position OmegaCrownAI as the unified governed operating system, not another point tool."
    },
    {
      id: "signal_enterprise_compliance_gap",
      competitor: "Creative automation platforms",
      signal:
        "Most creative automation competitors lack visible tenant isolation, audit evidence, and policy governance.",
      severity: "high",
      suggestedResponse:
        "Lead enterprise messaging with compliance evidence, identity, policy, and launch control."
    },
    {
      id: "signal_distribution_optimization",
      competitor: "Social schedulers",
      signal:
        "Distribution tools schedule content but rarely connect creative feedback to executive planning.",
      severity: "medium",
      suggestedResponse:
        "Highlight KPI feedback loops from distribution into creative and executive planning."
    }
  ];
}

export function prioritizeInitiatives(
  initiatives: Initiative[] = sampleInitiatives
): PrioritizedInitiative[] {
  return initiatives
    .map((initiative) => {
      const priorityScore = Number(
        (initiative.expectedImpact * 1.5 - initiative.risk * 0.8 - initiative.costUsd / 250).toFixed(2)
      );

      return {
        ...initiative,
        priorityScore,
        rank: 0
      };
    })
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .map((initiative, index) => ({
      ...initiative,
      rank: index + 1
    }));
}

export function allocateBudget(
  initiatives: PrioritizedInitiative[],
  totalBudgetUsd = 6000
): BudgetAllocation[] {
  const top = initiatives.slice(0, 4);
  const totalScore = top.reduce((sum, initiative) => sum + Math.max(initiative.priorityScore, 1), 0);

  return top.map((initiative) => ({
    category: initiative.title,
    amountUsd: Math.round((Math.max(initiative.priorityScore, 1) / totalScore) * totalBudgetUsd),
    reason: `Allocated based on rank ${initiative.rank}, impact ${initiative.expectedImpact}, risk ${initiative.risk}, and dependency ${initiative.dependency}.`
  }));
}

export function buildExecutivePlan(): ExecutivePlan {
  const distribution = runDistributionPipeline();
  const creative = buildCreativeProductionPackage();
  const reliabilityCost = summarizeCost(sampleTrace);
  const goals = generateGoals();
  const forecasts = generateForecasts();
  const competitorSignals = analyzeCompetitors();
  const initiatives = prioritizeInitiatives();
  const budget = allocateBudget(initiatives);

  const weeklyFocus = [
    "Complete real-key billing validation before unrestricted paid launch.",
    "Promote enterprise compliance evidence and governed AI OS positioning.",
    "Use Creative Super-Department package for premium demo/video assets.",
    "Push Distribution Super-Pipeline toward LinkedIn, email, website, and YouTube.",
    "Watch reliability cost and support load before scaling customer rollout."
  ];

  const triggerCycles = [
    `Creative cycle: ${creative.productionReadiness}`,
    `Distribution cycle: ${distribution.publishJobs.length} publish jobs prepared`,
    `Reliability cost watch: ${reliabilityCost.costRisk}`,
    "Customer success cycle: refine onboarding from activation data",
    "Executive review cycle: compare forecasts to actuals weekly"
  ];

  const draft = {
    phase: "v6.9 Phase 90" as const,
    id: `executive_plan_${Date.now()}`,
    generatedAt: new Date().toISOString(),
    goals,
    forecasts,
    competitorSignals,
    initiatives,
    budget,
    weeklyFocus,
    triggerCycles
  };

  return {
    ...draft,
    planHash: hashIdentityPayload(draft)
  };
}

export function reviewExecutivePlan(plan: ExecutivePlan = buildExecutivePlan()): ExecutiveReview {
  const warnings: string[] = [];
  const wins: string[] = [];

  if (plan.forecasts.some((forecast) => forecast.direction === "up")) {
    wins.push("Growth forecasts show upward momentum in at least one core KPI.");
  }

  if (plan.initiatives[0]?.id === "initiative_billing_validation") {
    wins.push("Billing validation is correctly prioritized as a commercial launch gate.");
  }

  if (plan.budget.some((allocation) => allocation.amountUsd > 2500)) {
    warnings.push("Budget concentration is high; review spend before launch expansion.");
  }

  if (plan.competitorSignals.some((signal) => signal.severity === "high")) {
    warnings.push("Competitor positioning pressure is high; strengthen differentiated messaging.");
  }

  return {
    planId: plan.id,
    status: warnings.length > 1 ? "needs_action" : warnings.length === 1 ? "watch" : "on_track",
    wins,
    risks: warnings,
    nextActions: [
      "Confirm billing readiness before broad paid acquisition.",
      "Convert executive plan into weekly launch control tasks.",
      "Feed competitor signals into creative hooks and distribution variants.",
      "Review KPI forecast accuracy after the next campaign cycle.",
      "Keep legal, compliance, and provider disclaimers company-protective."
    ]
  };
}

export const executiveAutopilotControls = [
  {
    area: "Goal engine",
    control:
      "Convert current KPIs into weekly, monthly, and quarterly targets with owners and rationale."
  },
  {
    area: "Forecast engine",
    control:
      "Predict views, qualified leads, revenue, activation, and other KPIs from recent performance history."
  },
  {
    area: "Competitor intelligence",
    control:
      "Track market signals and convert competitor gaps into positioning opportunities."
  },
  {
    area: "Priority engine",
    control:
      "Rank campaigns, features, experiments, operations, and sales initiatives by impact, cost, and risk."
  },
  {
    area: "Budget allocator",
    control:
      "Assign budget to top initiatives using priority score and risk-aware weighting."
  },
  {
    area: "Executive review loop",
    control:
      "Review wins, risks, next actions, and forecast accuracy on a recurring cadence."
  }
];
