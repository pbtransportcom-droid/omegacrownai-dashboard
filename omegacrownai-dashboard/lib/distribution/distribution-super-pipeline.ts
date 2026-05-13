import { hashIdentityPayload } from "@/lib/identity-kernel/sovereign-identity-kernel";
import {
  PolicyEvaluationContext,
  evaluatePolicies,
  samplePolicies
} from "@/lib/global-policy-engine/global-policy-engine";

export type DistributionChannel =
  | "youtube"
  | "tiktok"
  | "instagram"
  | "x"
  | "linkedin"
  | "facebook"
  | "email"
  | "website";

export type CampaignGoal =
  | "awareness"
  | "conversion"
  | "retention"
  | "lead_generation"
  | "enterprise_pipeline";

export type CampaignStatus =
  | "draft"
  | "review"
  | "scheduled"
  | "publishing"
  | "live"
  | "paused"
  | "completed";

export type PublishStatus =
  | "queued"
  | "blocked"
  | "scheduled"
  | "published"
  | "failed";

export type Campaign = {
  id: string;
  name: string;
  goal: CampaignGoal;
  channels: DistributionChannel[];
  status: CampaignStatus;
  owner: string;
  schedule: {
    startAt: string;
    endAt?: string;
    batchWindowMinutes: number;
  };
  kpis: string[];
  budgetUsd: number;
};

export type ContentVariant = {
  id: string;
  campaignId: string;
  channel: DistributionChannel;
  title: string;
  hook: string;
  callToAction: string;
  payloadHash: string;
  experimentWeight: number;
};

export type PublishJob = {
  id: string;
  campaignId: string;
  variantId: string;
  channel: DistributionChannel;
  scheduledAt: string;
  status: PublishStatus;
  policyDecision: "allow" | "deny";
  reason: string;
};

export type KPIResult = {
  campaignId: string;
  channel: DistributionChannel;
  impressions: number;
  clicks: number;
  conversions: number;
  costUsd: number;
  ctr: number;
  cpa: number;
  score: number;
};

export type DistributionPipelineResult = {
  phase: "v6.7 Phase 88";
  campaign: Campaign;
  variants: ContentVariant[];
  publishJobs: PublishJob[];
  kpis: KPIResult[];
  feedback: string[];
};

export const sampleCampaign: Campaign = {
  id: "campaign_phase88_enterprise_launch",
  name: "OmegaCrownAI Enterprise Launch Distribution",
  goal: "enterprise_pipeline",
  channels: ["linkedin", "youtube", "email", "website"],
  status: "scheduled",
  owner: "growth_operator",
  schedule: {
    startAt: new Date(Date.now() + 3600000).toISOString(),
    batchWindowMinutes: 45
  },
  kpis: ["impressions", "clicks", "conversions", "qualified_leads"],
  budgetUsd: 1500
};

export function createVariants(campaign: Campaign): ContentVariant[] {
  return campaign.channels.flatMap((channel, channelIndex) => {
    const base = {
      campaignId: campaign.id,
      channel
    };

    const variants = [
      {
        title: `${campaign.name}: Governed AI Operating System`,
        hook: "Launch controlled, enterprise-ready AI operations with identity, policy, reliability, and distribution.",
        callToAction: "Book an enterprise walkthrough",
        experimentWeight: 0.5
      },
      {
        title: `${campaign.name}: Sovereign Automation for Teams`,
        hook: "Coordinate agents, policies, audits, and publishing from one governed platform.",
        callToAction: "Start your rollout plan",
        experimentWeight: 0.5
      }
    ];

    return variants.map((variant, variantIndex) => ({
      id: `variant_${campaign.id}_${channel}_${variantIndex + 1}`,
      ...base,
      ...variant,
      payloadHash: hashIdentityPayload({
        campaignId: campaign.id,
        channel,
        channelIndex,
        variantIndex,
        variant
      })
    }));
  });
}

export function evaluateDistributionPolicy(params: {
  campaign: Campaign;
  variant: ContentVariant;
}): {
  decision: "allow" | "deny";
  reason: string;
} {
  const riskLevel =
    params.campaign.goal === "enterprise_pipeline" ? "medium" : "low";

  const context: PolicyEvaluationContext = {
    region: "US",
    agentId: params.campaign.owner,
    channel: "internal",
    actionType: "publish",
    contentType: "text",
    riskLevel,
    identitySignature: "distribution_identity_signature",
    orgId: "org_demo",
    projectId: params.campaign.id,
    metadata: {
      phase: "v6.7 Phase 88",
      distributionChannel: params.variant.channel
    }
  };

  const result = evaluatePolicies({
    policies: samplePolicies,
    context,
    payload: {
      title: params.variant.title,
      hook: params.variant.hook,
      callToAction: params.variant.callToAction
    }
  });

  return {
    decision: result.allowed ? "allow" : "deny",
    reason: result.allowed
      ? "Distribution policy allowed publishing job."
      : result.reasons.join("; ")
  };
}

export function createPublishJobs(params: {
  campaign: Campaign;
  variants: ContentVariant[];
}): PublishJob[] {
  const start = new Date(params.campaign.schedule.startAt).getTime();

  return params.variants.map((variant, index) => {
    const policy = evaluateDistributionPolicy({
      campaign: params.campaign,
      variant
    });

    return {
      id: `publish_${variant.id}`,
      campaignId: params.campaign.id,
      variantId: variant.id,
      channel: variant.channel,
      scheduledAt: new Date(
        start + index * params.campaign.schedule.batchWindowMinutes * 60000
      ).toISOString(),
      status: policy.decision === "allow" ? "scheduled" : "blocked",
      policyDecision: policy.decision,
      reason: policy.reason
    };
  });
}

export function calculateKPIs(params: {
  campaign: Campaign;
  variants: ContentVariant[];
}): KPIResult[] {
  return params.campaign.channels.map((channel, index) => {
    const impressions = 1000 + index * 750;
    const clicks = 80 + index * 35;
    const conversions = 8 + index * 4;
    const costUsd = Number((params.campaign.budgetUsd / params.campaign.channels.length).toFixed(2));
    const ctr = Number((clicks / impressions).toFixed(4));
    const cpa = Number((costUsd / Math.max(conversions, 1)).toFixed(2));
    const score = Number(((conversions * 10 + clicks * 0.5) / Math.max(costUsd, 1)).toFixed(4));

    return {
      campaignId: params.campaign.id,
      channel,
      impressions,
      clicks,
      conversions,
      costUsd,
      ctr,
      cpa,
      score
    };
  });
}

export function generateFeedback(kpis: KPIResult[]): string[] {
  const sorted = [...kpis].sort((a, b) => b.score - a.score);
  const winner = sorted[0];
  const weakest = sorted[sorted.length - 1];

  return [
    `Promote ${winner.channel} because it has the strongest score (${winner.score}).`,
    `Review ${weakest.channel} because it has the weakest score (${weakest.score}).`,
    "Feed winning hooks and CTAs back into the Creative Super-Department.",
    "Send channel-level performance to Executive Autopilot for next budget allocation.",
    "Pause any channel if policy, provider, or cost observability signals degrade."
  ];
}

export function runDistributionPipeline(
  campaign: Campaign = sampleCampaign
): DistributionPipelineResult {
  const variants = createVariants(campaign);
  const publishJobs = createPublishJobs({
    campaign,
    variants
  });
  const kpis = calculateKPIs({
    campaign,
    variants
  });

  return {
    phase: "v6.7 Phase 88",
    campaign,
    variants,
    publishJobs,
    kpis,
    feedback: generateFeedback(kpis)
  };
}

export const distributionControls = [
  {
    area: "Channel abstraction",
    control:
      "Campaigns should publish through channel adapters for YouTube, TikTok, Instagram, X, LinkedIn, Facebook, email, and website."
  },
  {
    area: "Campaign pipeline",
    control:
      "Distribution flow should sequence generate, review, policy check, schedule, publish, measure, and optimize."
  },
  {
    area: "Scheduling and batching",
    control:
      "Publish jobs should be scheduled with batch windows to prevent provider overload and rollout risk."
  },
  {
    area: "A/B variants",
    control:
      "Each channel should support multiple title, hook, CTA, and payload variants."
  },
  {
    area: "KPI feedback loop",
    control:
      "Impressions, clicks, conversions, cost, CTR, CPA, and score should feed future creative and executive decisions."
  },
  {
    area: "Policy integration",
    control:
      "Distribution jobs must pass Global Policy Engine checks before scheduling or publishing."
  }
];
