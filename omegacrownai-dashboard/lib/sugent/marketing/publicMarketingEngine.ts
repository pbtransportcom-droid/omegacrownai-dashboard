import { prisma } from "@/lib/db";

const DEFAULT_PLANS = [
  {
    tier: "free",
    name: "Free",
    monthlyPriceCents: 0,
    annualPriceCents: 0,
    headline: "Start exploring OmegaCrownAI.",
    description: "For testing onboarding, basic creator workflows, and learning the platform.",
    ctaLabel: "Start Free",
    ctaHref: "/onboarding",
    badge: "Starter Access",
    sortOrder: 1,
    featuresJson: [
      "Customer account and workspace",
      "Manual billing mode",
      "Starter creator dashboard",
      "Basic export review",
    ],
    limitsJson: {
      video_exports: 2,
      podcast_exports: 2,
      storage_mb: 250,
      team_members: 1,
    },
  },
  {
    tier: "starter",
    name: "Starter",
    monthlyPriceCents: 1900,
    annualPriceCents: 19000,
    headline: "For small teams creating branded AI content.",
    description: "Onboarding, creator exports, media library, basic publishing preparation, and support.",
    ctaLabel: "Start Starter",
    ctaHref: "/onboarding",
    badge: "Popular Entry",
    sortOrder: 2,
    featuresJson: [
      "Everything in Free",
      "Creator export dashboard",
      "Video and podcast export support",
      "Public share/download portal",
      "Manual/optional payment provider",
    ],
    limitsJson: {
      video_exports: 20,
      podcast_exports: 20,
      storage_mb: 5000,
      team_members: 3,
    },
  },
  {
    tier: "pro",
    name: "Pro",
    monthlyPriceCents: 4900,
    annualPriceCents: 49000,
    headline: "For growing businesses using OmegaCrownAI every week.",
    description: "More exports, team permissions, publishing integrations, premium provider controls, and storage tracking.",
    ctaLabel: "Start Pro",
    ctaHref: "/onboarding",
    badge: "Recommended",
    sortOrder: 3,
    featuresJson: [
      "Everything in Starter",
      "Team members and permissions",
      "Publishing integration records",
      "Premium provider controls",
      "Storage/CDN tracking",
      "Customer dashboard and API keys",
    ],
    limitsJson: {
      video_exports: 100,
      podcast_exports: 100,
      storage_mb: 50000,
      team_members: 10,
    },
  },
  {
    tier: "studio",
    name: "Studio",
    monthlyPriceCents: 14900,
    annualPriceCents: 149000,
    headline: "For agencies and studios producing at scale.",
    description: "High-volume creator workflows, publishing prep, admin controls, storage hardening, and premium provider usage tracking.",
    ctaLabel: "Start Studio",
    ctaHref: "/onboarding",
    badge: "Scale",
    sortOrder: 4,
    featuresJson: [
      "Everything in Pro",
      "Advanced publishing dashboard",
      "Provider run history",
      "Storage asset versioning",
      "Priority support workflows",
      "Admin support visibility",
    ],
    limitsJson: {
      video_exports: 500,
      podcast_exports: 500,
      storage_mb: 250000,
      team_members: 25,
    },
  },
  {
    tier: "enterprise",
    name: "Enterprise",
    monthlyPriceCents: 0,
    annualPriceCents: 0,
    headline: "For organizations needing sovereign AI operations.",
    description: "Custom onboarding, custom billing, governance controls, support workflows, and launch integration planning.",
    ctaLabel: "Contact Sales",
    ctaHref: "/pricing#contact",
    badge: "Custom",
    sortOrder: 5,
    featuresJson: [
      "Everything in Studio",
      "Custom limits",
      "Manual contract billing",
      "Dedicated rollout support",
      "Governance and admin operations",
      "Custom integrations roadmap",
    ],
    limitsJson: {
      video_exports: "custom",
      podcast_exports: "custom",
      storage_mb: "custom",
      team_members: "custom",
    },
  },
];

export async function seedPublicPricingPlans() {
  const plans = [];

  for (const plan of DEFAULT_PLANS) {
    const saved = await prisma.publicPricingPlan.upsert({
      where: { tier: plan.tier },
      create: {
        ...plan,
        status: "active",
        currency: "usd",
        metadata: {
          source: "v4_phase69_seed",
        },
      },
      update: {
        ...plan,
        status: "active",
        currency: "usd",
        metadata: {
          source: "v4_phase69_seed",
          updatedAt: new Date().toISOString(),
        },
      },
    });

    plans.push(saved);
  }

  return {
    ok: true,
    plans,
  };
}

export async function getPublicMarketingData() {
  let plans = await prisma.publicPricingPlan.findMany({
    where: { status: "active" },
    orderBy: { sortOrder: "asc" },
  });

  if (!plans.length) {
    await seedPublicPricingPlans();
    plans = await prisma.publicPricingPlan.findMany({
      where: { status: "active" },
      orderBy: { sortOrder: "asc" },
    });
  }

  return {
    ok: true,
    plans,
    featureMatrix: [
      { feature: "Customer onboarding", free: true, starter: true, pro: true, studio: true, enterprise: true },
      { feature: "Creator exports", free: "limited", starter: true, pro: true, studio: true, enterprise: true },
      { feature: "Media player/download portal", free: true, starter: true, pro: true, studio: true, enterprise: true },
      { feature: "Team permissions", free: false, starter: "basic", pro: true, studio: true, enterprise: true },
      { feature: "Publishing integrations", free: false, starter: "records", pro: true, studio: true, enterprise: true },
      { feature: "Premium provider controls", free: false, starter: false, pro: true, studio: true, enterprise: true },
      { feature: "Storage/CDN tracking", free: false, starter: "basic", pro: true, studio: true, enterprise: true },
      { feature: "Admin/support workflows", free: false, starter: false, pro: "basic", studio: true, enterprise: true },
      { feature: "Custom billing", free: false, starter: "manual", pro: true, studio: true, enterprise: true },
      { feature: "Custom limits", free: false, starter: false, pro: false, studio: false, enterprise: true },
    ],
    faq: [
      {
        question: "Is payment required to start?",
        answer: "No. OmegaCrownAI supports manual billing and optional payment providers, so onboarding can start without checkout.",
      },
      {
        question: "Which payment providers are supported?",
        answer: "The commercial layer supports manual billing plus provider-ready records for Stripe, Square, and SwipeSimple.",
      },
      {
        question: "Can I publish directly to social platforms?",
        answer: "Phase 65 added provider-ready publishing integrations and simulated publish jobs. Real provider adapters can be connected next.",
      },
      {
        question: "Does OmegaCrownAI support premium AI providers?",
        answer: "Yes. Phase 66 added provider controls for ElevenLabs, PlayHT, AWS Polly, Google TTS, Stability, Runway, Pika, and Omega Native.",
      },
      {
        question: "Can teams use it?",
        answer: "Yes. Team members, roles, permission checks, and permission overrides were added in Phase 64.",
      },
    ],
  };
}

export async function createMarketingLead({
  email,
  name,
  companyName,
  phone,
  source = "pricing",
  interest,
  planInterest,
  message,
  metadata,
}: {
  email: string;
  name?: string | null;
  companyName?: string | null;
  phone?: string | null;
  source?: string | null;
  interest?: string | null;
  planInterest?: string | null;
  message?: string | null;
  metadata?: any;
}) {
  const normalizedEmail = email.trim().toLowerCase();

  const lead = await prisma.marketingLead.create({
    data: {
      email: normalizedEmail,
      name: name || null,
      companyName: companyName || null,
      phone: phone || null,
      source: source || "pricing",
      interest: interest || null,
      planInterest: planInterest || null,
      message: message || null,
      status: "new",
      metadata: {
        ...(metadata || {}),
        sourcePhase: "v4_phase69_marketing_lead",
      },
    },
  });

  return {
    ok: true,
    lead,
  };
}

export async function getMarketingLeadDashboard() {
  const leads = await prisma.marketingLead.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return {
    ok: true,
    leads,
    summary: {
      leads: leads.length,
      new: leads.filter((lead) => lead.status === "new").length,
      contacted: leads.filter((lead) => lead.status === "contacted").length,
      converted: leads.filter((lead) => lead.status === "converted").length,
      ignored: leads.filter((lead) => lead.status === "ignored").length,
    },
  };
}
