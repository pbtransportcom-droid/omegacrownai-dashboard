import crypto from "crypto";
import { prisma } from "@/lib/db";
import { recordCustomerAdminAction } from "@/lib/sugent/customer-admin/customerAdminEngine";

const PROVIDERS = [
  {
    provider: "youtube",
    displayName: "YouTube",
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    scopes: ["https://www.googleapis.com/auth/youtube.upload", "https://www.googleapis.com/auth/youtube.readonly"],
  },
  {
    provider: "tiktok",
    displayName: "TikTok",
    authUrl: "https://www.tiktok.com/v2/auth/authorize/",
    tokenUrl: "https://open.tiktokapis.com/v2/oauth/token/",
    scopes: ["user.info.basic", "video.upload", "video.publish"],
  },
  {
    provider: "instagram",
    displayName: "Instagram",
    authUrl: "https://www.facebook.com/v20.0/dialog/oauth",
    tokenUrl: "https://graph.facebook.com/v20.0/oauth/access_token",
    scopes: ["instagram_basic", "instagram_content_publish", "pages_show_list"],
  },
  {
    provider: "linkedin",
    displayName: "LinkedIn",
    authUrl: "https://www.linkedin.com/oauth/v2/authorization",
    tokenUrl: "https://www.linkedin.com/oauth/v2/accessToken",
    scopes: ["openid", "profile", "email", "w_member_social"],
  },
  {
    provider: "x",
    displayName: "X",
    authUrl: "https://twitter.com/i/oauth2/authorize",
    tokenUrl: "https://api.twitter.com/2/oauth2/token",
    scopes: ["tweet.read", "tweet.write", "users.read", "offline.access"],
  },
];

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "https://omegacrownai.com";
}

function hashValue(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function pseudoEncrypt(value: string) {
  const salt = process.env.PROVIDER_SECRET_SALT || "omega-dev-secret-salt";
  return Buffer.from(`${salt}:${value}`).toString("base64");
}

function randomState() {
  return crypto.randomBytes(24).toString("hex");
}

function normalizeProvider(provider?: string | null) {
  const value = String(provider || "").toLowerCase();
  return PROVIDERS.some((item) => item.provider === value) ? value : "youtube";
}

function normalizeMode(mode?: string | null) {
  return String(mode || "test").toLowerCase() === "live" ? "live" : "test";
}

function clientEnvName(provider: string, mode: string) {
  const upper = provider.toUpperCase().replace(/[^A-Z0-9]/g, "_");
  return mode === "live" ? `${upper}_CLIENT_ID_LIVE` : `${upper}_CLIENT_ID_TEST`;
}

function clientSecretEnvName(provider: string, mode: string) {
  const upper = provider.toUpperCase().replace(/[^A-Z0-9]/g, "_");
  return mode === "live" ? `${upper}_CLIENT_SECRET_LIVE` : `${upper}_CLIENT_SECRET_TEST`;
}

function getClientId(provider: string, mode: string) {
  return process.env[clientEnvName(provider, mode)] || process.env[`${provider.toUpperCase()}_CLIENT_ID`] || `phase74_${provider}_client_placeholder`;
}

function getClientSecret(provider: string, mode: string) {
  return process.env[clientSecretEnvName(provider, mode)] || process.env[`${provider.toUpperCase()}_CLIENT_SECRET`] || null;
}

export async function seedOAuthPublishingProviders() {
  const providers = [];

  for (const item of PROVIDERS) {
    for (const mode of ["test", "live"]) {
      const saved = await prisma.customerOAuthProvider.upsert({
        where: {
          provider_mode: {
            provider: item.provider,
            mode,
          },
        },
        create: {
          provider: item.provider,
          displayName: item.displayName,
          category: "publishing",
          mode,
          authUrl: item.authUrl,
          tokenUrl: item.tokenUrl,
          scopes: item.scopes,
          status: "available",
          metadata: {
            source: "v5_phase74_oauth_seed",
          },
        },
        update: {
          displayName: item.displayName,
          authUrl: item.authUrl,
          tokenUrl: item.tokenUrl,
          scopes: item.scopes,
          status: "available",
          metadata: {
            source: "v5_phase74_oauth_seed",
            updatedAt: new Date().toISOString(),
          },
        },
      });

      providers.push(saved);
    }
  }

  return {
    ok: true,
    providers,
  };
}

export async function createOAuthConnectUrl({
  organizationId,
  userId,
  companyId,
  provider,
  mode = "test",
  returnUrl,
}: {
  organizationId: string;
  userId?: string | null;
  companyId?: string | null;
  provider: string;
  mode?: string | null;
  returnUrl?: string | null;
}) {
  await seedOAuthPublishingProviders();

  const normalizedProvider = normalizeProvider(provider);
  const normalizedMode = normalizeMode(mode);

  const oauthProvider = await prisma.customerOAuthProvider.findUnique({
    where: {
      provider_mode: {
        provider: normalizedProvider,
        mode: normalizedMode,
      },
    },
  });

  if (!oauthProvider) {
    return {
      ok: false,
      status: "PROVIDER_NOT_FOUND",
      reason: "OAuth provider not found.",
    };
  }

  const stateValue = randomState();
  const redirectUri = `${appUrl()}/api/oauth/publishing/callback/${normalizedProvider}`;

  const state = await prisma.customerOAuthState.create({
    data: {
      organizationId,
      userId: userId || null,
      companyId: companyId || null,
      providerId: oauthProvider.id,
      provider: normalizedProvider,
      mode: normalizedMode,
      state: stateValue,
      status: "created",
      redirectUri,
      returnUrl: returnUrl || `${appUrl()}/customer-org/${organizationId}/publishing`,
      scopes: oauthProvider.scopes || [],
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      metadata: {
        source: "v5_phase74_oauth_state",
      },
    },
  });

  const clientId = getClientId(normalizedProvider, normalizedMode);
  const scopes = Array.isArray(oauthProvider.scopes) ? oauthProvider.scopes.join(" ") : "";

  const url = new URL(oauthProvider.authUrl || "");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("state", stateValue);

  if (scopes) {
    url.searchParams.set("scope", scopes);
  }

  if (normalizedProvider === "x") {
    url.searchParams.set("code_challenge", "phase74_pkce_placeholder");
    url.searchParams.set("code_challenge_method", "plain");
  }

  if (normalizedProvider === "youtube") {
    url.searchParams.set("access_type", "offline");
    url.searchParams.set("prompt", "consent");
  }

  return {
    ok: true,
    provider: oauthProvider,
    state,
    connectUrl: url.toString(),
    clientConfigured: !clientId.includes("placeholder"),
    clientSecretConfigured: Boolean(getClientSecret(normalizedProvider, normalizedMode)),
  };
}

export async function completeOAuthCallback({
  provider,
  state,
  code,
  error,
}: {
  provider: string;
  state: string;
  code?: string | null;
  error?: string | null;
}) {
  const normalizedProvider = normalizeProvider(provider);

  const existingState = await prisma.customerOAuthState.findUnique({
    where: { state },
  });

  if (!existingState) {
    return {
      ok: false,
      status: "STATE_NOT_FOUND",
      reason: "OAuth state not found.",
    };
  }

  if (existingState.provider !== normalizedProvider) {
    return {
      ok: false,
      status: "PROVIDER_MISMATCH",
      reason: "OAuth provider mismatch.",
    };
  }

  if (existingState.expiresAt && existingState.expiresAt < new Date()) {
    await prisma.customerOAuthState.update({
      where: { id: existingState.id },
      data: { status: "expired" },
    });

    return {
      ok: false,
      status: "STATE_EXPIRED",
      reason: "OAuth state expired.",
    };
  }

  if (error) {
    await prisma.customerOAuthState.update({
      where: { id: existingState.id },
      data: {
        status: "failed",
        metadata: {
          ...(existingState.metadata as any || {}),
          error,
        },
      },
    });

    return {
      ok: false,
      status: "OAUTH_ERROR",
      reason: error,
    };
  }

  const tokenSeed = `${normalizedProvider}:${code || "phase74_code_placeholder"}:${Date.now()}`;
  const accessToken = `phase74_${normalizedProvider}_access_${hashValue(tokenSeed).slice(0, 24)}`;
  const refreshToken = `phase74_${normalizedProvider}_refresh_${hashValue(tokenSeed + ":refresh").slice(0, 24)}`;

  const connection = await prisma.customerOAuthConnection.create({
    data: {
      organizationId: existingState.organizationId,
      userId: existingState.userId,
      companyId: existingState.companyId,
      providerId: existingState.providerId,
      provider: normalizedProvider,
      mode: existingState.mode,
      status: "connected",
      providerAccountId: `phase74_${normalizedProvider}_account`,
      providerAccountName: `${normalizedProvider} connected account`,
      providerAccountHandle: `@omega_${normalizedProvider}`,
      providerAccountUrl: null,
      accessTokenHash: hashValue(accessToken),
      encryptedAccessToken: pseudoEncrypt(accessToken),
      refreshTokenHash: hashValue(refreshToken),
      encryptedRefreshToken: pseudoEncrypt(refreshToken),
      tokenType: "Bearer",
      scope: Array.isArray(existingState.scopes) ? existingState.scopes.join(" ") : "",
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      lastValidatedAt: new Date(),
      metadata: {
        source: "v5_phase74_oauth_connection",
        realTokenExchangeExecuted: false,
        note: "Phase 74 stores OAuth connection shell and token placeholders. Real provider token exchange can be enabled after provider apps are configured.",
      },
    },
  });

  await prisma.customerOAuthState.update({
    where: { id: existingState.id },
    data: {
      status: "used",
      usedAt: new Date(),
    },
  });

  await recordCustomerAdminAction({
    organizationId: existingState.organizationId,
    userId: existingState.userId,
    companyId: existingState.companyId,
    action: "OAUTH_PUBLISHING_CONNECTION_CREATED",
    entityType: "CustomerOAuthConnection",
    entityId: connection.id,
    severity: existingState.mode === "live" ? "warning" : "info",
    afterJson: {
      provider: normalizedProvider,
      mode: existingState.mode,
      status: connection.status,
      providerAccountHandle: connection.providerAccountHandle,
    },
  });

  return {
    ok: true,
    connection: sanitizeConnection(connection),
    returnUrl: existingState.returnUrl,
  };
}

function sanitizeConnection(connection: any) {
  return {
    ...connection,
    encryptedAccessToken: undefined,
    encryptedRefreshToken: undefined,
    accessTokenHash: undefined,
    refreshTokenHash: undefined,
  };
}

export async function disconnectOAuthConnection({
  connectionId,
  disconnectedBy = "system-admin",
}: {
  connectionId: string;
  disconnectedBy?: string;
}) {
  const existing = await prisma.customerOAuthConnection.findUnique({
    where: { id: connectionId },
  });

  if (!existing) {
    return {
      ok: false,
      status: "NOT_FOUND",
      reason: "OAuth connection not found.",
    };
  }

  const connection = await prisma.customerOAuthConnection.update({
    where: { id: connectionId },
    data: {
      status: "disconnected",
      disconnectedAt: new Date(),
      metadata: {
        ...(existing.metadata as any || {}),
        disconnectedAt: new Date().toISOString(),
        disconnectedBy,
      },
    },
  });

  await recordCustomerAdminAction({
    organizationId: existing.organizationId,
    userId: existing.userId,
    companyId: existing.companyId,
    adminUserId: disconnectedBy,
    action: "OAUTH_PUBLISHING_CONNECTION_DISCONNECTED",
    entityType: "CustomerOAuthConnection",
    entityId: connection.id,
    severity: "warning",
    beforeJson: sanitizeConnection(existing),
    afterJson: sanitizeConnection(connection),
  });

  return {
    ok: true,
    connection: sanitizeConnection(connection),
  };
}

export async function validateOAuthConnection(connectionId: string) {
  const existing = await prisma.customerOAuthConnection.findUnique({
    where: { id: connectionId },
  });

  if (!existing) {
    return {
      ok: false,
      status: "NOT_FOUND",
      reason: "OAuth connection not found.",
    };
  }

  const expired = existing.expiresAt ? existing.expiresAt < new Date() : false;

  const connection = await prisma.customerOAuthConnection.update({
    where: { id: connectionId },
    data: {
      status: expired ? "refresh_required" : existing.status,
      lastValidatedAt: new Date(),
      lastError: expired ? "Access token expired; refresh required." : null,
      metadata: {
        ...(existing.metadata as any || {}),
        validatedAt: new Date().toISOString(),
      },
    },
  });

  return {
    ok: !expired,
    status: connection.status,
    connection: sanitizeConnection(connection),
  };
}

export async function getOAuthPublishingDashboard(organizationId?: string | null) {
  await seedOAuthPublishingProviders();

  const where = organizationId ? { organizationId } : {};

  const [providers, connections, states] = await Promise.all([
    prisma.customerOAuthProvider.findMany({
      orderBy: [{ provider: "asc" }, { mode: "asc" }],
      take: 100,
    }),
    prisma.customerOAuthConnection.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    prisma.customerOAuthState.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  const safeConnections = connections.map(sanitizeConnection);

  return {
    ok: true,
    providers,
    connections: safeConnections,
    states,
    summary: {
      providers: providers.length,
      connected: connections.filter((item) => item.status === "connected").length,
      disconnected: connections.filter((item) => item.status === "disconnected").length,
      refreshRequired: connections.filter((item) => item.status === "refresh_required").length,
      states: states.length,
      youtube: connections.filter((item) => item.provider === "youtube").length,
      tiktok: connections.filter((item) => item.provider === "tiktok").length,
      instagram: connections.filter((item) => item.provider === "instagram").length,
      linkedin: connections.filter((item) => item.provider === "linkedin").length,
      x: connections.filter((item) => item.provider === "x").length,
    },
  };
}
