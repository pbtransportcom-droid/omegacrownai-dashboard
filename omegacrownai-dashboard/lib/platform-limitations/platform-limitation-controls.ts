import { hashIdentityPayload } from "@/lib/identity-kernel/sovereign-identity-kernel";

export type LimitationSeverity = "notice" | "caution" | "high_review";

export type PlatformLimitation = {
  id: string;
  title: string;
  severity: LimitationSeverity;
  disclosure: string;
  companyProtectiveAction: string;
};

export type SourceReliabilityTier = {
  id: string;
  tier: "verified" | "connected" | "provider_supplied" | "user_supplied" | "unverified";
  description: string;
  allowedUse: string;
  requiredReview: string;
};

export type ProviderDependency = {
  id: string;
  dependency: string;
  risk: string;
  mitigation: string;
};

export type HumanReviewRule = {
  id: string;
  area: string;
  requiredWhen: string;
  reviewer: string;
};

export type PlatformLimitationPackage = {
  phase: "v7.5 Phase 96";
  generatedAt: string;
  customerFacingSummary: string;
  limitations: PlatformLimitation[];
  sourceReliabilityTiers: SourceReliabilityTier[];
  providerDependencies: ProviderDependency[];
  humanReviewRules: HumanReviewRule[];
  researchDisclosure: string;
  packageHash: string;
};

export const customerFacingSummary =
  "OmegaCrownAI depends on the AI providers, data sources, and integrations connected to it. It is strongest for practical business execution, including strategy, content, campaigns, operations, compliance workflows, and launch planning. For specialized academic research, regulated professional advice, or real-time facts, OmegaCrownAI should be connected to trusted sources and reviewed by qualified humans where appropriate.";

export const platformLimitations: PlatformLimitation[] = [
  {
    id: "limitation_provider_dependency",
    title: "Provider and model dependency",
    severity: "notice",
    disclosure:
      "OmegaCrownAI relies on configured AI models, premium providers, APIs, data sources, and platform integrations. Output quality and availability depend on those services being authorized, connected, configured, and operational.",
    companyProtectiveAction:
      "Disclose provider dependency clearly and avoid guaranteeing uninterrupted provider performance."
  },
  {
    id: "limitation_realtime_access",
    title: "Real-time information depends on connected sources",
    severity: "caution",
    disclosure:
      "OmegaCrownAI should not be represented as automatically having perfect real-time web, market, legal, academic, or platform data unless the relevant live data source is connected and verified.",
    companyProtectiveAction:
      "Require connected-source verification for real-time claims, market data, pricing, availability, legal changes, and news-sensitive outputs."
  },
  {
    id: "limitation_specialized_research",
    title: "Specialized academic and technical research",
    severity: "caution",
    disclosure:
      "OmegaCrownAI is strongest for applied business research and execution. Highly specialized academic, scientific, legal, medical, or technical research may require trusted databases, expert-reviewed materials, or external research tools.",
    companyProtectiveAction:
      "Add research caveats and require source review for obscure citations, regulated domains, and specialist claims."
  },
  {
    id: "limitation_prompt_context_quality",
    title: "Prompt and context quality",
    severity: "notice",
    disclosure:
      "The usefulness of OmegaCrownAI outputs depends on prompt clarity, available context, connected data, provider reliability, and configured workflows.",
    companyProtectiveAction:
      "Encourage customers to provide clear goals, source materials, constraints, and review criteria."
  },
  {
    id: "limitation_human_review",
    title: "Human review for high-impact decisions",
    severity: "high_review",
    disclosure:
      "Human review is recommended for legal, financial, medical, compliance, publishing, licensing, security, hiring, and high-impact business decisions.",
    companyProtectiveAction:
      "Require high-impact workflows to surface review guidance and avoid presenting outputs as final professional advice."
  },
  {
    id: "limitation_generated_content",
    title: "Generated creative and publishing risk",
    severity: "caution",
    disclosure:
      "Generated content may require review for factual accuracy, brand fit, platform rules, copyright, licensing, likeness, provider terms, and customer approval before publication.",
    companyProtectiveAction:
      "Route creative, provider, and publishing-sensitive assets through licensing and approval checks before distribution."
  }
];

export const sourceReliabilityTiers: SourceReliabilityTier[] = [
  {
    id: "tier_verified",
    tier: "verified",
    description:
      "Information sourced from attorney-reviewed, expert-reviewed, system-owned, or explicitly approved production materials.",
    allowedUse:
      "Can be used for production guidance when within the reviewed scope.",
    requiredReview:
      "Periodic review by owner; immediate review when laws, contracts, provider terms, or product behavior changes."
  },
  {
    id: "tier_connected",
    tier: "connected",
    description:
      "Information retrieved from authorized connected systems such as internal documents, customer-provided data, analytics, billing systems, or verified APIs.",
    allowedUse:
      "Can support customer-specific answers when permissions and scope are valid.",
    requiredReview:
      "Confirm source freshness, permissions, tenant scope, and data quality."
  },
  {
    id: "tier_provider_supplied",
    tier: "provider_supplied",
    description:
      "Information generated or returned by third-party AI, publishing, analytics, storage, or business providers.",
    allowedUse:
      "Can support workflows, drafts, and analysis, but should be treated as provider-dependent.",
    requiredReview:
      "Review provider terms, source confidence, hallucination risk, latency, and availability."
  },
  {
    id: "tier_user_supplied",
    tier: "user_supplied",
    description:
      "Information uploaded, typed, imported, or connected by the user or customer organization.",
    allowedUse:
      "Can be used within the customer workflow, subject to user permissions and data quality.",
    requiredReview:
      "Customer should verify accuracy, completeness, authority, and permission to use."
  },
  {
    id: "tier_unverified",
    tier: "unverified",
    description:
      "Information with unclear source, stale source, missing citation, uncertain origin, or no connected verification path.",
    allowedUse:
      "Use only as draft, brainstorming, or low-risk directional context.",
    requiredReview:
      "Verify before using in customer-facing, regulated, legal, financial, medical, publishing, or high-impact decisions."
  }
];

export const providerDependencies: ProviderDependency[] = [
  {
    id: "dependency_ai_models",
    dependency: "AI model providers",
    risk:
      "Outputs may vary by model behavior, provider availability, rate limits, latency, safety filters, and context quality.",
    mitigation:
      "Use provider monitoring, fallback providers, output review, policy checks, and source grounding for sensitive workflows."
  },
  {
    id: "dependency_live_data",
    dependency: "Live data and web access",
    risk:
      "Real-time accuracy depends on connected data sources, API freshness, permissions, indexing, and availability.",
    mitigation:
      "Require live-source configuration and freshness metadata for time-sensitive outputs."
  },
  {
    id: "dependency_publishing_platforms",
    dependency: "Publishing platforms",
    risk:
      "Publishing may fail or be restricted due to platform APIs, account permissions, rate limits, content policy, or provider outages.",
    mitigation:
      "Keep approval, retry, rollback, audit, and manual override paths available."
  },
  {
    id: "dependency_payments",
    dependency: "Payment processors",
    risk:
      "Checkout, billing, subscription, invoice, and entitlement flows depend on processor keys, webhooks, and account status.",
    mitigation:
      "Complete real-key validation, monitor webhooks, and keep billing status visible before unrestricted paid acquisition."
  },
  {
    id: "dependency_storage_exports",
    dependency: "Storage and export systems",
    risk:
      "Uploads, exports, downloads, and asset delivery depend on storage configuration, permissions, quotas, and tenant scope.",
    mitigation:
      "Enforce tenant isolation, signed URLs, audit logs, export controls, and post-export validation."
  }
];

export const humanReviewRules: HumanReviewRule[] = [
  {
    id: "review_legal",
    area: "Legal and contracts",
    requiredWhen:
      "Terms, privacy, DPA, provider obligations, customer disputes, regulated claims, or contract interpretation are involved.",
    reviewer: "Attorney or authorized legal reviewer"
  },
  {
    id: "review_financial",
    area: "Financial and billing decisions",
    requiredWhen:
      "Pricing, taxes, refunds, billing disputes, forecasts, investment claims, or high-value spend decisions are involved.",
    reviewer: "Finance owner or qualified financial reviewer"
  },
  {
    id: "review_medical",
    area: "Medical, safety, or health-related guidance",
    requiredWhen:
      "Health, diagnosis, treatment, safety, emergency, or medical decision support is involved.",
    reviewer: "Qualified healthcare professional"
  },
  {
    id: "review_compliance",
    area: "Compliance and data protection",
    requiredWhen:
      "Customer data handling, DPA obligations, cross-tenant access, security incidents, exports, or regulated compliance evidence is involved.",
    reviewer: "Compliance or security owner"
  },
  {
    id: "review_publishing",
    area: "Publishing and creative licensing",
    requiredWhen:
      "Public posts, ads, videos, voiceover, B-roll, music, likeness, third-party assets, or provider-generated media will be published.",
    reviewer: "Publishing owner, brand owner, or licensing reviewer"
  },
  {
    id: "review_security",
    area: "Security and provider credentials",
    requiredWhen:
      "Provider keys, OAuth tokens, secrets, admin access, tenant isolation, marketplace providers, or incident escalation are involved.",
    reviewer: "Security owner"
  }
];

export const researchDisclosure =
  "OmegaCrownAI is designed for applied business execution and practical research. For highly specialized academic, scientific, legal, medical, or technical research, customers should connect trusted databases, provide source materials, require citations where available, and involve qualified human review before relying on outputs.";

export function buildPlatformLimitationPackage(): PlatformLimitationPackage {
  const draft = {
    phase: "v7.5 Phase 96" as const,
    generatedAt: new Date().toISOString(),
    customerFacingSummary,
    limitations: platformLimitations,
    sourceReliabilityTiers,
    providerDependencies,
    humanReviewRules,
    researchDisclosure
  };

  return {
    ...draft,
    packageHash: hashIdentityPayload(draft)
  };
}

export const platformLimitationControls = [
  {
    area: "Customer-facing limitation disclosure",
    control:
      "The platform should clearly disclose that outputs depend on connected models, providers, data sources, prompt quality, and workflow configuration."
  },
  {
    area: "Source reliability classification",
    control:
      "Sources should be classified by reliability tier: verified, connected, provider-supplied, user-supplied, or unverified."
  },
  {
    area: "Provider dependency notice",
    control:
      "Provider availability, latency, model behavior, pricing, rate limits, and API restrictions should be disclosed as operational dependencies."
  },
  {
    area: "Research caution",
    control:
      "Specialized academic, scientific, legal, medical, or technical research should require trusted sources and qualified review."
  },
  {
    area: "Human review guidance",
    control:
      "High-impact legal, financial, medical, compliance, publishing, licensing, security, and business decisions should surface human-review guidance."
  }
];
