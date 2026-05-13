import { hashIdentityPayload } from "@/lib/identity-kernel/sovereign-identity-kernel";
import {
  PolicyEvaluationContext,
  evaluatePolicies,
  samplePolicies
} from "@/lib/global-policy-engine/global-policy-engine";
import { summarizeCost, sampleTrace } from "@/lib/reliability/reliability-engine";

export type ProviderCategory =
  | "ai_model"
  | "image"
  | "video"
  | "audio"
  | "publishing"
  | "analytics"
  | "storage"
  | "payments"
  | "automation";

export type ProviderVerificationStatus =
  | "unverified"
  | "review"
  | "verified"
  | "suspended";

export type ProviderScope =
  | "generate:text"
  | "generate:image"
  | "generate:video"
  | "generate:audio"
  | "publish:social"
  | "read:analytics"
  | "write:storage"
  | "billing:usage"
  | "automation:execute";

export type MarketplaceProvider = {
  id: string;
  name: string;
  category: ProviderCategory;
  capabilities: string[];
  scopes: ProviderScope[];
  verified: boolean;
  status: ProviderVerificationStatus;
  revenueSharePercent: number;
  riskLevel: "low" | "medium" | "high";
};

export type ProviderModule = {
  id: string;
  providerId: string;
  name: string;
  entrypoint: string;
  permissions: ProviderScope[];
  sandboxRequired: boolean;
};

export type ProviderVerificationResult = {
  providerId: string;
  status: ProviderVerificationStatus;
  checks: {
    name: string;
    passed: boolean;
    detail: string;
  }[];
  recommendation: string;
};

export type SandboxExecutionResult = {
  moduleId: string;
  providerId: string;
  allowed: boolean;
  output: Record<string, unknown>;
  policyDecision: "allow" | "deny";
  executionHash: string;
};

export type ProviderBillingSummary = {
  providerId: string;
  usageUsd: number;
  platformFeeUsd: number;
  providerPayoutUsd: number;
  revenueSharePercent: number;
  settlementStatus: "pending" | "ready" | "blocked";
};

export const sampleProviders: MarketplaceProvider[] = [
  {
    id: "provider_premium_image",
    name: "Premium Image Generator",
    category: "image",
    capabilities: ["product_render", "campaign_visual", "thumbnail"],
    scopes: ["generate:image", "write:storage", "billing:usage"],
    verified: true,
    status: "verified",
    revenueSharePercent: 20,
    riskLevel: "medium"
  },
  {
    id: "provider_social_publish",
    name: "Social Publishing Adapter",
    category: "publishing",
    capabilities: ["linkedin_publish", "x_publish", "youtube_schedule"],
    scopes: ["publish:social", "read:analytics", "billing:usage"],
    verified: true,
    status: "verified",
    revenueSharePercent: 15,
    riskLevel: "medium"
  },
  {
    id: "provider_audio_voice",
    name: "Commercial Voice Studio",
    category: "audio",
    capabilities: ["voiceover", "audio_cleanup", "sound_design"],
    scopes: ["generate:audio", "write:storage", "billing:usage"],
    verified: false,
    status: "review",
    revenueSharePercent: 25,
    riskLevel: "high"
  }
];

export const sampleModules: ProviderModule[] = [
  {
    id: "module_image_campaign_visual",
    providerId: "provider_premium_image",
    name: "Campaign Visual Generator",
    entrypoint: "generateCampaignVisual",
    permissions: ["generate:image", "write:storage"],
    sandboxRequired: true
  },
  {
    id: "module_social_publish_job",
    providerId: "provider_social_publish",
    name: "Social Publish Job",
    entrypoint: "publishToChannel",
    permissions: ["publish:social", "read:analytics"],
    sandboxRequired: true
  },
  {
    id: "module_voiceover_generation",
    providerId: "provider_audio_voice",
    name: "Voiceover Generation",
    entrypoint: "generateVoiceover",
    permissions: ["generate:audio", "write:storage"],
    sandboxRequired: true
  }
];

export function listProviders(): MarketplaceProvider[] {
  return sampleProviders;
}

export function verifyProvider(provider: MarketplaceProvider): ProviderVerificationResult {
  const checks = [
    {
      name: "Verified status",
      passed: provider.verified && provider.status === "verified",
      detail: provider.verified
        ? "Provider is marked verified."
        : "Provider requires verification before broad marketplace availability."
    },
    {
      name: "Scopes declared",
      passed: provider.scopes.length > 0,
      detail: "Provider must declare required permissions and scopes."
    },
    {
      name: "Revenue share configured",
      passed: provider.revenueSharePercent >= 0 && provider.revenueSharePercent <= 50,
      detail: "Revenue share must be configured within approved marketplace limits."
    },
    {
      name: "Risk review",
      passed: provider.riskLevel !== "high" || provider.status === "verified",
      detail:
        "High-risk providers require stronger verification, policy review, and sandbox enforcement."
    }
  ];

  const passed = checks.every((check) => check.passed);

  return {
    providerId: provider.id,
    status: passed ? "verified" : "review",
    checks,
    recommendation: passed
      ? "Provider is ready for controlled marketplace availability."
      : "Keep provider in review until verification, scopes, billing, and risk controls pass."
  };
}

export function hasPermission(
  provider: MarketplaceProvider,
  permission: ProviderScope
): boolean {
  return provider.scopes.includes(permission);
}

export function runProviderSandbox(params: {
  provider: MarketplaceProvider;
  module: ProviderModule;
  input: Record<string, unknown>;
}): SandboxExecutionResult {
  const missingPermissions = params.module.permissions.filter(
    (permission) => !hasPermission(params.provider, permission)
  );

  const policyContext: PolicyEvaluationContext = {
    region: "US",
    agentId: "marketplace_provider_runtime",
    channel: "marketplace",
    actionType: "execute",
    contentType: "data",
    riskLevel: params.provider.riskLevel,
    identitySignature: "marketplace_provider_identity_signature",
    orgId: "org_demo",
    projectId: params.module.id,
    metadata: {
      phase: "v7.0 Phase 91",
      providerId: params.provider.id,
      moduleId: params.module.id
    }
  };

  const policy = evaluatePolicies({
    policies: samplePolicies,
    context: policyContext,
    payload: params.input
  });

  const allowed =
    missingPermissions.length === 0 &&
    policy.allowed &&
    params.provider.status !== "suspended";

  const output = allowed
    ? {
        ok: true,
        provider: params.provider.name,
        module: params.module.name,
        result: "Sandbox execution accepted for controlled marketplace runtime."
      }
    : {
        ok: false,
        missingPermissions,
        reason: policy.allowed
          ? "Provider permission or status check failed."
          : policy.reasons.join("; ")
      };

  return {
    moduleId: params.module.id,
    providerId: params.provider.id,
    allowed,
    output,
    policyDecision: policy.allowed ? "allow" : "deny",
    executionHash: hashIdentityPayload({
      provider: params.provider,
      module: params.module,
      input: params.input,
      allowed,
      output
    })
  };
}

export function summarizeProviderBilling(
  provider: MarketplaceProvider,
  usageUsd = summarizeCost(sampleTrace).totalUsd * 100
): ProviderBillingSummary {
  const platformFeeUsd = Number(
    (usageUsd * (provider.revenueSharePercent / 100)).toFixed(2)
  );
  const providerPayoutUsd = Number((usageUsd - platformFeeUsd).toFixed(2));

  return {
    providerId: provider.id,
    usageUsd: Number(usageUsd.toFixed(2)),
    platformFeeUsd,
    providerPayoutUsd,
    revenueSharePercent: provider.revenueSharePercent,
    settlementStatus:
      provider.status === "verified"
        ? "ready"
        : provider.status === "suspended"
          ? "blocked"
          : "pending"
  };
}

export function buildMarketplaceReport() {
  const providers = listProviders();
  const verifications = providers.map(verifyProvider);
  const sandboxRuns = sampleModules.map((module) => {
    const provider =
      providers.find((candidate) => candidate.id === module.providerId) ??
      providers[0];

    return runProviderSandbox({
      provider,
      module,
      input: {
        request: "controlled marketplace execution"
      }
    });
  });
  const billing = providers.map((provider) => summarizeProviderBilling(provider));

  return {
    phase: "v7.0 Phase 91",
    providers,
    modules: sampleModules,
    verifications,
    sandboxRuns,
    billing,
    marketplaceReadiness: verifications.every(
      (verification) => verification.status === "verified"
    )
      ? "ready"
      : "controlled_review",
    recommendations: [
      "Keep high-risk providers in review until verification and licensing pass.",
      "Require scopes for every provider module before sandbox execution.",
      "Use policy engine checks before marketplace runtime actions.",
      "Do not expose provider secrets, raw tokens, or private keys in marketplace APIs.",
      "Route provider billing through controlled settlement and audit events."
    ]
  };
}

export const marketplaceEcosystemControls = [
  {
    area: "Provider registry",
    control:
      "Providers must declare category, capabilities, scopes, verification status, risk, and revenue share."
  },
  {
    area: "Provider verification",
    control:
      "Providers must pass verification, scope, billing, and risk checks before broad availability."
  },
  {
    area: "Sandbox runtime",
    control:
      "Provider modules execute through a controlled sandbox with policy, scope, and status checks."
  },
  {
    area: "Permissions and scopes",
    control:
      "Modules can only run when their requested permissions are included in the provider scope list."
  },
  {
    area: "Provider billing",
    control:
      "Usage, platform fees, provider payout, revenue share, and settlement status must be visible."
  },
  {
    area: "Company protection",
    control:
      "High-risk providers, licensing-sensitive modules, and suspended providers must be blocked or held for review."
  }
];
