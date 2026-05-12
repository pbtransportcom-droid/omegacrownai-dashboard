import crypto from "crypto";
import { prisma } from "@/lib/db";
import { recordCustomerAdminAction } from "@/lib/sugent/customer-admin/customerAdminEngine";

const PROVIDER_REGISTRY = [
  { provider: "stripe", category: "payment", requiredSecrets: ["secret_key", "publishable_key", "webhook_secret"] },
  { provider: "square", category: "payment", requiredSecrets: ["access_token", "application_id", "location_id", "webhook_signature_key"] },
  { provider: "swipesimple", category: "payment", requiredSecrets: ["api_key", "merchant_id"] },

  { provider: "youtube", category: "publishing", requiredSecrets: ["client_id", "client_secret", "redirect_uri"] },
  { provider: "tiktok", category: "publishing", requiredSecrets: ["client_key", "client_secret", "redirect_uri"] },
  { provider: "instagram", category: "publishing", requiredSecrets: ["app_id", "app_secret", "redirect_uri"] },
  { provider: "linkedin", category: "publishing", requiredSecrets: ["client_id", "client_secret", "redirect_uri"] },
  { provider: "x", category: "publishing", requiredSecrets: ["client_id", "client_secret", "redirect_uri"] },

  { provider: "elevenlabs", category: "tts", requiredSecrets: ["api_key"] },
  { provider: "playht", category: "tts", requiredSecrets: ["api_key", "user_id"] },
  { provider: "aws_polly", category: "tts", requiredSecrets: ["access_key_id", "secret_access_key", "region"] },
  { provider: "google_tts", category: "tts", requiredSecrets: ["service_account_json"] },

  { provider: "stability", category: "image", requiredSecrets: ["api_key"] },
  { provider: "runway", category: "video", requiredSecrets: ["api_key"] },
  { provider: "pika", category: "video", requiredSecrets: ["api_key"] },

  { provider: "s3", category: "storage", requiredSecrets: ["access_key_id", "secret_access_key", "bucket", "region"] },
  { provider: "gcs", category: "storage", requiredSecrets: ["service_account_json", "bucket"] },
  { provider: "cloudflare_r2", category: "storage", requiredSecrets: ["access_key_id", "secret_access_key", "bucket", "account_id"] },

  { provider: "sentry", category: "monitoring", requiredSecrets: ["dsn"] },
];

function hashValue(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function maskSecret(value: string) {
  if (!value) return "";
  if (value.length <= 8) return "****";
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

function pseudoEncrypt(value: string) {
  const salt = process.env.PROVIDER_SECRET_SALT || "omega-dev-secret-salt";
  return Buffer.from(`${salt}:${value}`).toString("base64");
}

function normalizeMode(mode?: string | null) {
  return String(mode || "test").toLowerCase() === "live" ? "live" : "test";
}

function normalizeProvider(provider?: string | null) {
  return String(provider || "").trim().toLowerCase();
}

function registryEntry(provider: string, category?: string | null) {
  return PROVIDER_REGISTRY.find((item) =>
    item.provider === provider && (!category || item.category === category)
  );
}

export function getProviderActivationRegistry() {
  return PROVIDER_REGISTRY.map((item) => ({
    ...item,
    phase: "v5_phase71",
    realActivationReady: false,
  }));
}

export async function seedProviderEnvironments() {
  const environments = [];

  for (const item of PROVIDER_REGISTRY) {
    for (const mode of ["test", "live"]) {
      const environment = await prisma.providerEnvironment.upsert({
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
          mode,
          status: "inactive",
          displayName: `${item.provider} ${mode}`,
          liveEnabled: false,
          testEnabled: mode === "test",
          requiredSecrets: item.requiredSecrets,
          validationJson: {
            requiredSecretsPresent: false,
            liveGuardEnabled: mode === "live",
          },
          metadata: {
            source: "v5_phase71_seed",
          },
        },
        update: {
          requiredSecrets: item.requiredSecrets,
          metadata: {
            source: "v5_phase71_seed",
            updatedAt: new Date().toISOString(),
          },
        },
      });

      environments.push(environment);
    }
  }

  return {
    ok: true,
    environments,
  };
}

export async function upsertProviderSecret({
  provider,
  category,
  mode = "test",
  secretName,
  secretType = "api_key",
  value,
  createdByAdminId = "system-admin",
  reason,
}: {
  provider: string;
  category: string;
  mode?: string;
  secretName: string;
  secretType?: string;
  value: string;
  createdByAdminId?: string | null;
  reason?: string | null;
}) {
  const normalizedProvider = normalizeProvider(provider);
  const normalizedMode = normalizeMode(mode);

  if (!value) {
    return {
      ok: false,
      status: "BAD_REQUEST",
      reason: "Secret value is required.",
    };
  }

  const environment = await prisma.providerEnvironment.upsert({
    where: {
      provider_category_mode: {
        provider: normalizedProvider,
        category,
        mode: normalizedMode,
      },
    },
    create: {
      provider: normalizedProvider,
      category,
      mode: normalizedMode,
      status: "inactive",
      displayName: `${normalizedProvider} ${normalizedMode}`,
      requiredSecrets: registryEntry(normalizedProvider, category)?.requiredSecrets || [],
      metadata: {
        source: "v5_phase71_secret_upsert_environment",
      },
    },
    update: {},
  });

  const secretHash = hashValue(value);
  const existing = await prisma.providerSecret.findFirst({
    where: {
      provider: normalizedProvider,
      category,
      mode: normalizedMode,
      secretName,
      status: "active",
    },
    orderBy: { createdAt: "desc" },
  });

  if (existing) {
    await prisma.providerSecret.update({
      where: { id: existing.id },
      data: {
        status: "rotated",
        rotatedAt: new Date(),
        rotatedByAdminId: createdByAdminId || null,
      },
    });
  }

  const secret = await prisma.providerSecret.create({
    data: {
      environmentId: environment.id,
      provider: normalizedProvider,
      category,
      mode: normalizedMode,
      secretName,
      secretType,
      status: "active",
      keyPrefix: value.slice(0, 6),
      secretHash,
      encryptedValue: pseudoEncrypt(value),
      maskedValue: maskSecret(value),
      lastFour: value.slice(-4),
      createdByAdminId: createdByAdminId || null,
      metadata: {
        source: "v5_phase71_provider_secret",
        realSecretStored: true,
      },
    },
  });

  if (existing) {
    await prisma.providerSecretRotation.create({
      data: {
        secretId: secret.id,
        provider: normalizedProvider,
        category,
        mode: normalizedMode,
        rotationType: "manual",
        status: "completed",
        oldSecretHash: existing.secretHash,
        newSecretHash: secretHash,
        rotatedByAdminId: createdByAdminId || null,
        reason: reason || "Secret rotated.",
        metadata: {
          previousSecretId: existing.id,
          newSecretId: secret.id,
        },
      },
    });
  }

  await recordCustomerAdminAction({
    adminUserId: createdByAdminId,
    action: existing ? "PROVIDER_SECRET_ROTATED" : "PROVIDER_SECRET_CREATED",
    entityType: "ProviderSecret",
    entityId: secret.id,
    severity: normalizedMode === "live" ? "warning" : "info",
    reason: reason || "Provider secret upsert.",
    afterJson: {
      provider: normalizedProvider,
      category,
      mode: normalizedMode,
      secretName,
      secretType,
      maskedValue: secret.maskedValue,
    },
    metadata: {
      source: "v5_phase71_provider_secret_action",
    },
  });

  return {
    ok: true,
    secret: {
      ...secret,
      encryptedValue: undefined,
      secretHash: undefined,
    },
  };
}

export async function validateProviderEnvironment({
  provider,
  category,
  mode = "test",
}: {
  provider: string;
  category: string;
  mode?: string;
}) {
  const normalizedProvider = normalizeProvider(provider);
  const normalizedMode = normalizeMode(mode);
  const entry = registryEntry(normalizedProvider, category);
  const requiredSecrets = entry?.requiredSecrets || [];

  const environment = await prisma.providerEnvironment.findUnique({
    where: {
      provider_category_mode: {
        provider: normalizedProvider,
        category,
        mode: normalizedMode,
      },
    },
  });

  if (!environment) {
    return {
      ok: false,
      status: "NOT_FOUND",
      reason: "Provider environment not found.",
    };
  }

  const activeSecrets = await prisma.providerSecret.findMany({
    where: {
      provider: normalizedProvider,
      category,
      mode: normalizedMode,
      status: "active",
    },
  });

  const present = new Set(activeSecrets.map((secret) => secret.secretName));
  const missing = requiredSecrets.filter((secretName) => !present.has(secretName));

  const liveBlocked = normalizedMode === "live" && missing.length > 0;
  const status = missing.length === 0 ? "ready" : "configured";

  const updated = await prisma.providerEnvironment.update({
    where: { id: environment.id },
    data: {
      status: liveBlocked ? "blocked" : status,
      lastValidatedAt: new Date(),
      lastError: liveBlocked ? `Missing live secrets: ${missing.join(", ")}` : null,
      validationJson: {
        requiredSecrets,
        presentSecrets: Array.from(present),
        missingSecrets: missing,
        requiredSecretsPresent: missing.length === 0,
        liveBlocked,
      },
    },
  });

  return {
    ok: !liveBlocked,
    environment: updated,
    requiredSecrets,
    presentSecrets: Array.from(present),
    missingSecrets: missing,
    status: updated.status,
  };
}

export async function setProviderEnvironmentActivation({
  provider,
  category,
  mode = "test",
  liveEnabled,
  testEnabled,
  adminUserId = "system-admin",
  reason,
}: {
  provider: string;
  category: string;
  mode?: string;
  liveEnabled?: boolean;
  testEnabled?: boolean;
  adminUserId?: string | null;
  reason?: string | null;
}) {
  const validation = await validateProviderEnvironment({ provider, category, mode });

  if (!validation.environment) {
    return validation;
  }

  const normalizedMode = normalizeMode(mode);

  if (normalizedMode === "live" && liveEnabled && validation.missingSecrets.length > 0) {
    return {
      ok: false,
      status: "LIVE_BLOCKED",
      reason: "Cannot enable live mode until all required secrets are present.",
      validation,
    };
  }

  const before = validation.environment;

  const environment = await prisma.providerEnvironment.update({
    where: { id: before.id },
    data: {
      liveEnabled: typeof liveEnabled === "boolean" ? liveEnabled : before.liveEnabled,
      testEnabled: typeof testEnabled === "boolean" ? testEnabled : before.testEnabled,
      status: normalizedMode === "live" && liveEnabled ? "ready" : before.status,
      metadata: {
        ...(before.metadata as any || {}),
        activationUpdatedAt: new Date().toISOString(),
        activationUpdatedBy: adminUserId || "system-admin",
      },
    },
  });

  await recordCustomerAdminAction({
    adminUserId,
    action: "PROVIDER_ENVIRONMENT_ACTIVATION_UPDATED",
    entityType: "ProviderEnvironment",
    entityId: environment.id,
    severity: normalizedMode === "live" ? "warning" : "info",
    reason: reason || "Provider environment activation updated.",
    beforeJson: before,
    afterJson: environment,
    metadata: {
      source: "v5_phase71_activation_guard",
    },
  });

  return {
    ok: true,
    environment,
    validation,
  };
}

export async function rotateProviderSecret({
  secretId,
  value,
  rotatedByAdminId = "system-admin",
  reason,
}: {
  secretId: string;
  value: string;
  rotatedByAdminId?: string | null;
  reason?: string | null;
}) {
  const existing = await prisma.providerSecret.findUnique({
    where: { id: secretId },
  });

  if (!existing) {
    return {
      ok: false,
      status: "NOT_FOUND",
      reason: "Provider secret not found.",
    };
  }

  return upsertProviderSecret({
    provider: existing.provider,
    category: existing.category,
    mode: existing.mode,
    secretName: existing.secretName,
    secretType: existing.secretType,
    value,
    createdByAdminId: rotatedByAdminId,
    reason: reason || "Manual secret rotation.",
  });
}

export async function revokeProviderSecret({
  secretId,
  revokedByAdminId = "system-admin",
  reason,
}: {
  secretId: string;
  revokedByAdminId?: string | null;
  reason?: string | null;
}) {
  const existing = await prisma.providerSecret.findUnique({
    where: { id: secretId },
  });

  if (!existing) {
    return {
      ok: false,
      status: "NOT_FOUND",
      reason: "Provider secret not found.",
    };
  }

  const secret = await prisma.providerSecret.update({
    where: { id: secretId },
    data: {
      status: "revoked",
      revokedAt: new Date(),
      metadata: {
        ...(existing.metadata as any || {}),
        revokedAt: new Date().toISOString(),
        revokedByAdminId,
      },
    },
  });

  await recordCustomerAdminAction({
    adminUserId: revokedByAdminId,
    action: "PROVIDER_SECRET_REVOKED",
    entityType: "ProviderSecret",
    entityId: secret.id,
    severity: "warning",
    reason: reason || "Provider secret revoked.",
    beforeJson: {
      provider: existing.provider,
      category: existing.category,
      mode: existing.mode,
      secretName: existing.secretName,
      status: existing.status,
    },
    afterJson: {
      provider: secret.provider,
      category: secret.category,
      mode: secret.mode,
      secretName: secret.secretName,
      status: secret.status,
    },
  });

  return {
    ok: true,
    secret: {
      ...secret,
      encryptedValue: undefined,
      secretHash: undefined,
    },
  };
}

export async function getProviderSecretsDashboard() {
  await seedProviderEnvironments();

  const [environments, secrets, rotations] = await Promise.all([
    prisma.providerEnvironment.findMany({
      orderBy: [{ category: "asc" }, { provider: "asc" }, { mode: "asc" }],
      take: 200,
    }),
    prisma.providerSecret.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    prisma.providerSecretRotation.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  const safeSecrets = secrets.map((secret) => ({
    ...secret,
    encryptedValue: undefined,
    secretHash: undefined,
  }));

  return {
    ok: true,
    registry: getProviderActivationRegistry(),
    environments,
    secrets: safeSecrets,
    rotations,
    summary: {
      environments: environments.length,
      ready: environments.filter((item) => item.status === "ready").length,
      configured: environments.filter((item) => item.status === "configured").length,
      blocked: environments.filter((item) => item.status === "blocked").length,
      activeSecrets: secrets.filter((item) => item.status === "active").length,
      liveEnabled: environments.filter((item) => item.mode === "live" && item.liveEnabled).length,
      testEnabled: environments.filter((item) => item.mode === "test" && item.testEnabled).length,
      rotations: rotations.length,
    },
  };
}

export async function getProductionEnvironmentReadiness() {
  const dashboard = await getProviderSecretsDashboard();

  const liveEnvironments = dashboard.environments.filter((item) => item.mode === "live");
  const liveReady = liveEnvironments.filter((item) => item.status === "ready" && item.liveEnabled);

  return {
    ok: true,
    status: liveReady.length > 0 ? "LIVE_READY_PARTIAL" : "TEST_READY",
    summary: dashboard.summary,
    live: {
      total: liveEnvironments.length,
      readyEnabled: liveReady.length,
      blocked: liveEnvironments.filter((item) => item.status === "blocked").length,
      inactive: liveEnvironments.filter((item) => item.status === "inactive").length,
    },
    test: {
      enabled: dashboard.environments.filter((item) => item.mode === "test" && item.testEnabled).length,
    },
    note: "Phase 71 establishes the secrets vault and activation guardrails. Later phases activate real provider adapters.",
  };
}
