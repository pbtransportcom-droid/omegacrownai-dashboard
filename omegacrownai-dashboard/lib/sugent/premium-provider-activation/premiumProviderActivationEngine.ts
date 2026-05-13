import { prisma } from "@/lib/db";
import { validateProviderEnvironment } from "@/lib/sugent/provider-secrets/providerSecretsEngine";
import { recordCustomerAdminAction } from "@/lib/sugent/customer-admin/customerAdminEngine";

const ADAPTERS = [
  {
    provider: "elevenlabs",
    category: "tts",
    displayName: "ElevenLabs",
    priority: 10,
    requiredSecrets: ["api_key"],
    capabilities: ["tts", "voice_cloning", "voiceover"],
  },
  {
    provider: "playht",
    category: "tts",
    displayName: "PlayHT",
    priority: 20,
    requiredSecrets: ["api_key", "user_id"],
    capabilities: ["tts", "voiceover"],
  },
  {
    provider: "aws_polly",
    category: "tts",
    displayName: "AWS Polly",
    priority: 30,
    requiredSecrets: ["access_key_id", "secret_access_key", "region"],
    capabilities: ["tts", "neural_tts"],
  },
  {
    provider: "google_tts",
    category: "tts",
    displayName: "Google TTS",
    priority: 40,
    requiredSecrets: ["service_account_json"],
    capabilities: ["tts", "multi_language"],
  },
  {
    provider: "stability",
    category: "image",
    displayName: "Stability AI",
    priority: 10,
    requiredSecrets: ["api_key"],
    capabilities: ["image_generation", "image_editing"],
  },
  {
    provider: "runway",
    category: "video",
    displayName: "Runway",
    priority: 10,
    requiredSecrets: ["api_key"],
    capabilities: ["video_generation", "image_to_video"],
  },
  {
    provider: "pika",
    category: "video",
    displayName: "Pika",
    priority: 20,
    requiredSecrets: ["api_key"],
    capabilities: ["video_generation", "prompt_to_video"],
  },
  {
    provider: "omega_native",
    category: "tts",
    displayName: "Omega Native TTS",
    priority: 999,
    requiredSecrets: [],
    capabilities: ["tts", "fallback"],
  },
  {
    provider: "omega_native",
    category: "image",
    displayName: "Omega Native Image",
    priority: 999,
    requiredSecrets: [],
    capabilities: ["image_generation", "fallback"],
  },
  {
    provider: "omega_native",
    category: "video",
    displayName: "Omega Native Video",
    priority: 999,
    requiredSecrets: [],
    capabilities: ["video_generation", "fallback"],
  },
];

function normalizeMode(mode?: string | null) {
  return String(mode || "test").toLowerCase() === "live" ? "live" : "test";
}

function normalizeCategory(category?: string | null) {
  const value = String(category || "tts").toLowerCase();
  return ["tts", "image", "video"].includes(value) ? value : "tts";
}

function normalizeProvider(provider?: string | null) {
  return String(provider || "").trim().toLowerCase() || "omega_native";
}

function currentPeriod() {
  return new Date().toISOString().slice(0, 7);
}

function estimateUnits(category: string, prompt?: string | null) {
  if (category === "tts") return Math.max(1, Math.ceil(String(prompt || "").length / 500));
  if (category === "image") return 1;
  if (category === "video") return 5;
  return 1;
}

function estimateCostCents(provider: string, category: string, units: number) {
  if (provider === "omega_native") return 0;
  if (category === "tts") return units * 2;
  if (category === "image") return units * 8;
  if (category === "video") return units * 50;
  return 0;
}

function outputForRun(provider: string, category: string, runId: string) {
  if (category === "tts") return `/exports/provider-runs/${runId}/${provider}-audio.mp3`;
  if (category === "image") return `/exports/provider-runs/${runId}/${provider}-image.png`;
  if (category === "video") return `/exports/provider-runs/${runId}/${provider}-video.mp4`;
  return `/exports/provider-runs/${runId}/${provider}-output.json`;
}

export async function seedPremiumProviderAdapters() {
  const adapters = [];

  for (const item of ADAPTERS) {
    for (const mode of ["test", "live"]) {
      const saved = await prisma.premiumProviderAdapter.upsert({
        where: {
          provider_category_mode: {
            provider: item.provider,
            category: item.category,
            mode,
          },
        },
        create: {
          provider: item.provider,
          category: item.category,
          displayName: item.displayName,
          mode,
          status: "available",
          priority: item.priority,
          fallbackEnabled: true,
          requiredSecrets: item.requiredSecrets,
          capabilities: item.capabilities,
          limitsJson: {
            source: "v5_phase76_default_limits",
            maxRunsPerMonth: item.provider === "omega_native" ? 100000 : 1000,
          },
          metadata: {
            source: "v5_phase76_seed",
          },
        },
        update: {
          displayName: item.displayName,
          priority: item.priority,
          fallbackEnabled: true,
          requiredSecrets: item.requiredSecrets,
          capabilities: item.capabilities,
          metadata: {
            source: "v5_phase76_seed",
            updatedAt: new Date().toISOString(),
          },
        },
      });

      adapters.push(saved);
    }
  }

  return {
    ok: true,
    adapters,
  };
}

export async function selectPremiumProviderAdapter({
  provider,
  category,
  mode = "test",
}: {
  provider?: string | null;
  category: string;
  mode?: string | null;
}) {
  await seedPremiumProviderAdapters();

  const normalizedCategory = normalizeCategory(category);
  const normalizedMode = normalizeMode(mode);
  const normalizedProvider = provider ? normalizeProvider(provider) : null;

  const requested = normalizedProvider
    ? await prisma.premiumProviderAdapter.findFirst({
        where: {
          provider: normalizedProvider,
          category: normalizedCategory,
          mode: normalizedMode,
          status: "available",
        },
        orderBy: { priority: "asc" },
      })
    : null;

  if (requested && requested.provider !== "omega_native") {
    const validation = await validateProviderEnvironment({
      provider: requested.provider,
      category: normalizedCategory,
      mode: normalizedMode,
    });

    if (validation.ok) {
      return {
        ok: true,
        adapter: requested,
        usedFallback: false,
        fallbackReason: null,
        validation,
      };
    }

    const fallback = await prisma.premiumProviderAdapter.findFirst({
      where: {
        provider: "omega_native",
        category: normalizedCategory,
        mode: normalizedMode,
        status: "available",
      },
    });

    return {
      ok: true,
      adapter: fallback,
      usedFallback: true,
      fallbackFromProvider: requested.provider,
      fallbackReason: "Requested provider environment is not ready; using Omega Native fallback.",
      validation,
    };
  }

  if (requested) {
    return {
      ok: true,
      adapter: requested,
      usedFallback: false,
      fallbackReason: null,
      validation: null,
    };
  }

  const firstReady = await prisma.premiumProviderAdapter.findFirst({
    where: {
      category: normalizedCategory,
      mode: normalizedMode,
      status: "available",
    },
    orderBy: { priority: "asc" },
  });

  if (firstReady && firstReady.provider !== "omega_native") {
    const validation = await validateProviderEnvironment({
      provider: firstReady.provider,
      category: normalizedCategory,
      mode: normalizedMode,
    });

    if (validation.ok) {
      return {
        ok: true,
        adapter: firstReady,
        usedFallback: false,
        fallbackReason: null,
        validation,
      };
    }
  }

  const fallback = await prisma.premiumProviderAdapter.findFirst({
    where: {
      provider: "omega_native",
      category: normalizedCategory,
      mode: normalizedMode,
      status: "available",
    },
  });

  if (!fallback) {
    return {
      ok: false,
      status: "NO_ADAPTER",
      reason: "No premium provider adapter or fallback adapter is available.",
    };
  }

  return {
    ok: true,
    adapter: fallback,
    usedFallback: true,
    fallbackReason: "No requested provider was ready; using Omega Native fallback.",
    validation: null,
  };
}

async function updateUsage({
  organizationId,
  provider,
  category,
  mode,
  status,
  usedFallback,
  unitsUsed,
  estimatedCostCents,
}: {
  organizationId: string;
  provider: string;
  category: string;
  mode: string;
  status: string;
  usedFallback: boolean;
  unitsUsed: number;
  estimatedCostCents: number;
}) {
  const period = currentPeriod();

  const existing = await prisma.premiumProviderUsage.findUnique({
    where: {
      organizationId_provider_category_mode_period: {
        organizationId,
        provider,
        category,
        mode,
        period,
      },
    },
  });

  const data = {
    runs: (existing?.runs || 0) + 1,
    completedRuns: (existing?.completedRuns || 0) + (status === "completed" ? 1 : 0),
    failedRuns: (existing?.failedRuns || 0) + (status === "failed" ? 1 : 0),
    fallbackRuns: (existing?.fallbackRuns || 0) + (usedFallback ? 1 : 0),
    unitsUsed: (existing?.unitsUsed || 0) + unitsUsed,
    estimatedCostCents: (existing?.estimatedCostCents || 0) + estimatedCostCents,
    metadata: {
      source: "v5_phase76_usage_rollup",
      updatedAt: new Date().toISOString(),
    },
  };

  if (existing) {
    return prisma.premiumProviderUsage.update({
      where: { id: existing.id },
      data,
    });
  }

  return prisma.premiumProviderUsage.create({
    data: {
      organizationId,
      provider,
      category,
      mode,
      period,
      ...data,
    },
  });
}

export async function runPremiumProvider({
  organizationId,
  userId,
  companyId,
  provider,
  category,
  mode = "test",
  inputType,
  outputType,
  prompt,
  voiceId,
  modelName,
  requestJson,
  createdBy = "system",
  actorType = "system",
}: {
  organizationId: string;
  userId?: string | null;
  companyId?: string | null;
  provider?: string | null;
  category: string;
  mode?: string | null;
  inputType?: string | null;
  outputType?: string | null;
  prompt?: string | null;
  voiceId?: string | null;
  modelName?: string | null;
  requestJson?: any;
  createdBy?: string | null;
  actorType?: string;
}) {
  const normalizedCategory = normalizeCategory(category);
  const normalizedMode = normalizeMode(mode);

  const selection = await selectPremiumProviderAdapter({
    provider,
    category: normalizedCategory,
    mode: normalizedMode,
  });

  if (!selection.ok || !selection.adapter) {
    return selection;
  }

  const adapter: any = selection.adapter;
  const selectedProvider = adapter.provider;
  const unitsUsed = estimateUnits(normalizedCategory, prompt);
  const estimatedCostCents = estimateCostCents(selectedProvider, normalizedCategory, unitsUsed);

  const created = await prisma.premiumProviderRun.create({
    data: {
      organizationId,
      userId: userId || null,
      companyId: companyId || null,
      adapterId: adapter.id,
      provider: selectedProvider,
      category: normalizedCategory,
      mode: normalizedMode,
      status: "running",
      usedFallback: Boolean(selection.usedFallback),
      fallbackFromProvider: (selection as any).fallbackFromProvider || null,
      fallbackReason: (selection as any).fallbackReason || null,
      inputType: inputType || "prompt",
      outputType: outputType || (normalizedCategory === "tts" ? "audio" : normalizedCategory),
      prompt: prompt || null,
      voiceId: voiceId || null,
      modelName: modelName || null,
      requestJson: {
        ...(requestJson || {}),
        prompt: prompt || null,
        providerRequested: provider || null,
        providerSelected: selectedProvider,
        category: normalizedCategory,
        source: "v5_phase76_provider_run",
      },
      unitsUsed,
      estimatedCostCents,
      createdBy: createdBy || "system",
      actorType,
      startedAt: new Date(),
      metadata: {
        source: "v5_phase76_provider_run",
        simulatedExecution: true,
        realProviderApiExecuted: false,
      },
    },
  });

  const outputUrl = outputForRun(selectedProvider, normalizedCategory, created.id);

  const completed = await prisma.premiumProviderRun.update({
    where: { id: created.id },
    data: {
      status: selection.usedFallback ? "fallback" : "completed",
      outputUrl,
      responseJson: {
        provider: selectedProvider,
        category: normalizedCategory,
        outputUrl,
        simulated: true,
        realProviderApiExecuted: false,
        message: "Phase 76 simulated premium provider execution. Real provider SDK/API calls can be enabled once production credentials and provider approvals are complete.",
      },
      outputMetadataJson: {
        format: normalizedCategory === "tts" ? "mp3" : normalizedCategory === "image" ? "png" : "mp4",
        unitsUsed,
        estimatedCostCents,
      },
      completedAt: new Date(),
    },
  });

  const usage = await updateUsage({
    organizationId,
    provider: selectedProvider,
    category: normalizedCategory,
    mode: normalizedMode,
    status: completed.status === "fallback" ? "completed" : completed.status,
    usedFallback: completed.usedFallback,
    unitsUsed,
    estimatedCostCents,
  });

  await recordCustomerAdminAction({
    organizationId,
    userId,
    companyId,
    adminUserId: createdBy,
    action: "PREMIUM_PROVIDER_RUN_COMPLETED",
    entityType: "PremiumProviderRun",
    entityId: completed.id,
    severity: completed.usedFallback ? "warning" : "info",
    afterJson: {
      provider: selectedProvider,
      category: normalizedCategory,
      status: completed.status,
      usedFallback: completed.usedFallback,
      outputUrl,
    },
  });

  return {
    ok: true,
    run: completed,
    usage,
    selection,
  };
}

export async function getPremiumProviderActivationDashboard(organizationId?: string | null) {
  await seedPremiumProviderAdapters();

  const runWhere = organizationId ? { organizationId } : {};
  const usageWhere = organizationId ? { organizationId } : {};

  const [adapters, runs, usage] = await Promise.all([
    prisma.premiumProviderAdapter.findMany({
      orderBy: [{ category: "asc" }, { priority: "asc" }, { provider: "asc" }],
      take: 100,
    }),
    prisma.premiumProviderRun.findMany({
      where: runWhere,
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    prisma.premiumProviderUsage.findMany({
      where: usageWhere,
      orderBy: [{ period: "desc" }, { provider: "asc" }],
      take: 100,
    }),
  ]);

  return {
    ok: true,
    adapters,
    runs,
    usage,
    summary: {
      adapters: adapters.length,
      availableAdapters: adapters.filter((item) => item.status === "available").length,
      runs: runs.length,
      completed: runs.filter((item) => item.status === "completed").length,
      fallback: runs.filter((item) => item.status === "fallback").length,
      failed: runs.filter((item) => item.status === "failed").length,
      ttsRuns: runs.filter((item) => item.category === "tts").length,
      imageRuns: runs.filter((item) => item.category === "image").length,
      videoRuns: runs.filter((item) => item.category === "video").length,
      estimatedCostCents: usage.reduce((sum, item) => sum + item.estimatedCostCents, 0),
      unitsUsed: usage.reduce((sum, item) => sum + item.unitsUsed, 0),
    },
  };
}
