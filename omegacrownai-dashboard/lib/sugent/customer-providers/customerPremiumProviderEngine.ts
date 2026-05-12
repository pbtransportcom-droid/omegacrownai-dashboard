import crypto from "crypto";
import { prisma } from "@/lib/db";
import { checkCustomerPermission } from "@/lib/sugent/customer-team/customerTeamEngine";

const SUPPORTED_PROVIDERS = [
  "omega_native",
  "elevenlabs",
  "playht",
  "aws_polly",
  "google_tts",
  "stability",
  "runway",
  "pika",
];

const PROVIDER_CATEGORIES: Record<string, string[]> = {
  omega_native: ["tts", "image", "video", "music"],
  elevenlabs: ["tts"],
  playht: ["tts"],
  aws_polly: ["tts"],
  google_tts: ["tts"],
  stability: ["image"],
  runway: ["video", "image"],
  pika: ["video"],
};

const DEFAULT_MODELS: Record<string, string> = {
  omega_native: "omega_native_v0",
  elevenlabs: "eleven_multilingual_v2",
  playht: "playht_turbo",
  aws_polly: "neural",
  google_tts: "studio",
  stability: "stable-image-core",
  runway: "gen3_alpha",
  pika: "pika_v1",
};

function normalizeProvider(provider?: string | null) {
  const value = String(provider || "omega_native").toLowerCase();
  return SUPPORTED_PROVIDERS.includes(value) ? value : "omega_native";
}

function normalizeCategory(category?: string | null) {
  const value = String(category || "tts").toLowerCase();
  return ["tts", "image", "video", "music"].includes(value) ? value : "tts";
}

function hashValue(value?: string | null) {
  if (!value) return null;
  return crypto.createHash("sha256").update(value).digest("hex");
}

function estimateUsage({
  category,
  prompt,
  outputType,
}: {
  category: string;
  prompt?: string | null;
  outputType?: string | null;
}) {
  if (category === "tts") {
    return {
      usageType: "tts_characters",
      amount: Math.max(String(prompt || "").length, 1),
    };
  }

  if (category === "image") {
    return {
      usageType: "images",
      amount: 1,
    };
  }

  if (category === "video") {
    return {
      usageType: "video_seconds",
      amount: outputType === "short_video" ? 15 : 5,
    };
  }

  return {
    usageType: "music_seconds",
    amount: 15,
  };
}

function providerCanServe(provider: string, category: string) {
  return (PROVIDER_CATEGORIES[provider] || []).includes(category);
}

function fallbackFor(category: string, preferredProvider: string) {
  if (providerCanServe(preferredProvider, category)) return preferredProvider;

  const preferred = SUPPORTED_PROVIDERS.find((provider) => providerCanServe(provider, category));
  return preferred || "omega_native";
}

function simulatedOutputUrl(category: string, provider: string) {
  const stamp = Date.now();

  if (category === "tts") return `/exports/provider-sim/${provider}-tts-${stamp}.mp3`;
  if (category === "image") return `/exports/provider-sim/${provider}-image-${stamp}.png`;
  if (category === "video") return `/exports/provider-sim/${provider}-video-${stamp}.mp4`;
  return `/exports/provider-sim/${provider}-music-${stamp}.mp3`;
}

export function premiumProviderRegistry() {
  return SUPPORTED_PROVIDERS.map((provider) => ({
    provider,
    categories: PROVIDER_CATEGORIES[provider] || [],
    defaultModel: DEFAULT_MODELS[provider],
    status: "available",
    realApiAdapter: false,
    phase: "v4.5_phase66",
  }));
}

export async function connectPremiumProviderCredential({
  organizationId,
  companyId,
  provider,
  category,
  mode = "test",
  status = "connected",
  displayName,
  apiKey,
  defaultModel,
  defaultVoiceId,
  configJson,
  connectedByUserId,
}: {
  organizationId: string;
  companyId?: string | null;
  provider?: string | null;
  category?: string | null;
  mode?: string;
  status?: string;
  displayName?: string | null;
  apiKey?: string | null;
  defaultModel?: string | null;
  defaultVoiceId?: string | null;
  configJson?: any;
  connectedByUserId?: string | null;
}) {
  const normalizedProvider = normalizeProvider(provider);
  const normalizedCategory = normalizeCategory(category);

  if (!providerCanServe(normalizedProvider, normalizedCategory)) {
    return {
      ok: false,
      status: "UNSUPPORTED_CATEGORY",
      reason: `${normalizedProvider} does not support ${normalizedCategory}.`,
      provider: normalizedProvider,
      category: normalizedCategory,
    };
  }

  const existing = await prisma.customerPremiumProviderCredential.findFirst({
    where: {
      organizationId,
      provider: normalizedProvider,
      category: normalizedCategory,
    },
    orderBy: { createdAt: "desc" },
  });

  const data = {
    companyId: companyId || null,
    provider: normalizedProvider,
    category: normalizedCategory,
    status,
    mode,
    displayName: displayName || `${normalizedProvider} ${normalizedCategory}`,
    defaultModel: defaultModel || DEFAULT_MODELS[normalizedProvider] || null,
    defaultVoiceId: defaultVoiceId || null,
    credentialHash: hashValue(apiKey),
    credentialJson: apiKey
      ? {
          placeholderOnly: true,
          credentialHash: hashValue(apiKey),
        }
      : undefined,
    configJson: configJson || {},
    metadata: {
      source: "v4_phase66_premium_provider",
      realApiAdapterPending: true,
    },
    connectedByUserId: connectedByUserId || null,
    connectedAt: status === "connected" ? new Date() : undefined,
  };

  const credential = existing
    ? await prisma.customerPremiumProviderCredential.update({
        where: { id: existing.id },
        data,
      })
    : await prisma.customerPremiumProviderCredential.create({
        data: {
          organizationId,
          ...data,
        },
      });

  await prisma.customerPremiumProviderUsageEvent.create({
    data: {
      organizationId,
      companyId: companyId || null,
      credentialId: credential.id,
      provider: normalizedProvider,
      category: normalizedCategory,
      model: credential.defaultModel,
      usageType: "provider_connection",
      amount: 0,
      status: "recorded",
      requestJson: {
        provider: normalizedProvider,
        category: normalizedCategory,
        mode,
        status,
      },
      responseJson: {
        credentialId: credential.id,
        connected: status === "connected",
      },
      metadata: {
        source: "v4_phase66_provider_connected",
      },
    },
  });

  return {
    ok: true,
    credential,
  };
}

export async function revokePremiumProviderCredential(credentialId: string) {
  const existing = await prisma.customerPremiumProviderCredential.findUnique({
    where: { id: credentialId },
  });

  if (!existing) {
    return {
      ok: false,
      status: "NOT_FOUND",
      reason: "Premium provider credential not found.",
    };
  }

  const credential = await prisma.customerPremiumProviderCredential.update({
    where: { id: credentialId },
    data: {
      status: "revoked",
      revokedAt: new Date(),
      metadata: {
        ...(existing.metadata as any || {}),
        revokedAt: new Date().toISOString(),
      },
    },
  });

  return {
    ok: true,
    credential,
  };
}

export async function runPremiumProviderGeneration({
  organizationId,
  companyId,
  provider,
  category,
  prompt,
  outputType,
  model,
  voiceId,
  createdByUserId,
}: {
  organizationId: string;
  companyId?: string | null;
  provider?: string | null;
  category?: string | null;
  prompt?: string | null;
  outputType?: string | null;
  model?: string | null;
  voiceId?: string | null;
  createdByUserId?: string | null;
}) {
  const requestedProvider = normalizeProvider(provider);
  const normalizedCategory = normalizeCategory(category);
  const selectedProvider = fallbackFor(normalizedCategory, requestedProvider);
  const usedFallback = selectedProvider !== requestedProvider;

  if (createdByUserId) {
    const permission = await checkCustomerPermission({
      organizationId,
      userId: createdByUserId,
      permission: "project:edit",
      resourceType: "organization",
    });

    if (!permission.ok) {
      return {
        ok: false,
        status: "DENIED",
        reason: "User does not have permission to run premium provider generation.",
        permission,
      };
    }
  }

  const credential = await prisma.customerPremiumProviderCredential.findFirst({
    where: {
      organizationId,
      provider: selectedProvider,
      category: normalizedCategory,
      status: "connected",
    },
    orderBy: { createdAt: "desc" },
  });

  const effectiveProvider = credential?.provider || "omega_native";
  const fallbackProvider = credential ? null : "omega_native";

  const run = await prisma.customerPremiumProviderRun.create({
    data: {
      organizationId,
      companyId: companyId || credential?.companyId || null,
      credentialId: credential?.id || null,
      provider: effectiveProvider,
      fallbackProvider: usedFallback || fallbackProvider ? fallbackProvider || selectedProvider : null,
      category: normalizedCategory,
      status: "running",
      inputType: "prompt",
      outputType: outputType || normalizedCategory,
      prompt: prompt || null,
      model: model || credential?.defaultModel || DEFAULT_MODELS[effectiveProvider],
      voiceId: voiceId || credential?.defaultVoiceId || null,
      requestJson: {
        requestedProvider,
        selectedProvider,
        effectiveProvider,
        usedFallback: usedFallback || Boolean(fallbackProvider),
        prompt,
        outputType,
      },
      startedAt: new Date(),
      createdByUserId: createdByUserId || null,
    },
  });

  const usage = estimateUsage({
    category: normalizedCategory,
    prompt,
    outputType,
  });

  const responseJson = {
    simulated: true,
    externalProviderExecuted: false,
    provider: effectiveProvider,
    category: normalizedCategory,
    model: run.model,
    voiceId: run.voiceId,
    outputUrl: simulatedOutputUrl(normalizedCategory, effectiveProvider),
    note: "Phase 66 records provider-ready generation runs. Real provider adapters come later.",
  };

  const completed = await prisma.customerPremiumProviderRun.update({
    where: { id: run.id },
    data: {
      status: "completed",
      completedAt: new Date(),
      outputUrl: String(responseJson.outputUrl),
      responseJson: responseJson as any,
    },
  });

  await prisma.customerPremiumProviderUsageEvent.create({
    data: {
      organizationId,
      companyId: companyId || credential?.companyId || null,
      credentialId: credential?.id || null,
      provider: effectiveProvider,
      category: normalizedCategory,
      model: completed.model,
      usageType: usage.usageType,
      amount: usage.amount,
      costCents: 0,
      entityType: "CustomerPremiumProviderRun",
      entityId: completed.id,
      requestHash: hashValue(JSON.stringify(completed.requestJson || {})),
      responseHash: hashValue(JSON.stringify(responseJson)),
      status: usedFallback || fallbackProvider ? "fallback" : "simulated",
      requestJson: (completed.requestJson as any) || {},
      responseJson,
      metadata: {
        source: "v4_phase66_provider_run",
        requestedProvider,
        selectedProvider,
        effectiveProvider,
      },
    },
  });

  return {
    ok: true,
    run: completed,
    usage,
  };
}

export async function getPremiumProviderDashboard(organizationId: string) {
  const organization = await prisma.customerOrganization.findUnique({
    where: { id: organizationId },
  });

  if (!organization) {
    return {
      ok: false,
      status: "NOT_FOUND",
      reason: "Customer organization not found.",
    };
  }

  const [credentials, runs, usageEvents] = await Promise.all([
    prisma.customerPremiumProviderCredential.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.customerPremiumProviderRun.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.customerPremiumProviderUsageEvent.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  return {
    ok: true,
    organization,
    registry: premiumProviderRegistry(),
    credentials,
    runs,
    usageEvents,
    summary: {
      credentials: credentials.length,
      connectedCredentials: credentials.filter((item) => item.status === "connected").length,
      runs: runs.length,
      completedRuns: runs.filter((item) => item.status === "completed").length,
      usageEvents: usageEvents.length,
      ttsProviders: credentials.filter((item) => item.category === "tts").length,
      imageProviders: credentials.filter((item) => item.category === "image").length,
      videoProviders: credentials.filter((item) => item.category === "video").length,
    },
  };
}
