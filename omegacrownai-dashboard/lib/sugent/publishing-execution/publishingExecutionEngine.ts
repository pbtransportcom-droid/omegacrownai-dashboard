import { prisma } from "@/lib/db";
import { validateOAuthConnection } from "@/lib/sugent/oauth-publishing/oauthPublishingEngine";
import { recordCustomerAdminAction } from "@/lib/sugent/customer-admin/customerAdminEngine";

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "https://omegacrownai.com";
}

function normalizeProvider(provider?: string | null) {
  const value = String(provider || "youtube").toLowerCase();
  return ["youtube", "tiktok", "instagram", "linkedin", "x"].includes(value) ? value : "youtube";
}

function makeProviderPostId(provider: string) {
  return `phase75_${provider}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function makeProviderPostUrl(provider: string, postId: string) {
  const map: Record<string, string> = {
    youtube: "https://youtube.com/watch?v=",
    tiktok: "https://www.tiktok.com/@omega/video/",
    instagram: "https://www.instagram.com/p/",
    linkedin: "https://www.linkedin.com/feed/update/",
    x: "https://x.com/omega/status/",
  };

  return `${map[provider] || "https://omegacrownai.com/publish/"}${postId}`;
}

export async function createPublishingExecutionAttempt({
  organizationId,
  userId,
  companyId,
  connectionId,
  publishJobId,
  exportId,
  provider,
  title,
  description,
  mediaUrl,
  thumbnailUrl,
  caption,
  hashtags,
  createdBy = "system",
  actorType = "system",
}: {
  organizationId: string;
  userId?: string | null;
  companyId?: string | null;
  connectionId?: string | null;
  publishJobId?: string | null;
  exportId?: string | null;
  provider: string;
  title?: string | null;
  description?: string | null;
  mediaUrl?: string | null;
  thumbnailUrl?: string | null;
  caption?: string | null;
  hashtags?: any;
  createdBy?: string | null;
  actorType?: string;
}) {
  const normalizedProvider = normalizeProvider(provider);

  let selectedConnectionId = connectionId || null;
  let mode = "test";

  if (!selectedConnectionId) {
    const connection = await prisma.customerOAuthConnection.findFirst({
      where: {
        organizationId,
        provider: normalizedProvider,
        status: "connected",
      },
      orderBy: { createdAt: "desc" },
    });

    selectedConnectionId = connection?.id || null;
    mode = connection?.mode || "test";
  } else {
    const connection = await prisma.customerOAuthConnection.findUnique({
      where: { id: selectedConnectionId },
    });

    mode = connection?.mode || "test";
  }

  const attempt = await prisma.publishingExecutionAttempt.create({
    data: {
      organizationId,
      userId: userId || null,
      companyId: companyId || null,
      connectionId: selectedConnectionId,
      publishJobId: publishJobId || null,
      exportId: exportId || null,
      provider: normalizedProvider,
      mode,
      status: "queued",
      attemptNumber: 1,
      maxAttempts: 3,
      title: title || "OmegaCrownAI Published Content",
      description: description || null,
      mediaUrl: mediaUrl || null,
      thumbnailUrl: thumbnailUrl || null,
      caption: caption || null,
      hashtags: hashtags || [],
      createdBy: createdBy || "system",
      actorType,
      requestJson: {
        provider: normalizedProvider,
        title: title || "OmegaCrownAI Published Content",
        mediaUrl: mediaUrl || null,
        caption: caption || null,
        source: "v5_phase75_attempt_create",
      },
      metadata: {
        source: "v5_phase75_publishing_execution",
        realProviderApiExecuted: false,
      },
    },
  });

  await recordCustomerAdminAction({
    organizationId,
    userId,
    companyId,
    adminUserId: createdBy,
    action: "PUBLISHING_EXECUTION_ATTEMPT_CREATED",
    entityType: "PublishingExecutionAttempt",
    entityId: attempt.id,
    severity: "info",
    afterJson: {
      provider: normalizedProvider,
      status: attempt.status,
      connectionId: selectedConnectionId,
    },
  });

  return {
    ok: true,
    attempt,
  };
}

export async function runPublishingExecutionAttempt(attemptId: string) {
  const attempt = await prisma.publishingExecutionAttempt.findUnique({
    where: { id: attemptId },
  });

  if (!attempt) {
    return {
      ok: false,
      status: "NOT_FOUND",
      reason: "Publishing execution attempt not found.",
    };
  }

  if (["published", "cancelled"].includes(attempt.status)) {
    return {
      ok: true,
      status: "NOOP",
      reason: `Attempt already ${attempt.status}.`,
      attempt,
    };
  }

  await prisma.publishingExecutionAttempt.update({
    where: { id: attempt.id },
    data: {
      status: "running",
      startedAt: new Date(),
    },
  });

  if (!attempt.connectionId) {
    const failed = await prisma.publishingExecutionAttempt.update({
      where: { id: attempt.id },
      data: {
        status: "failed",
        failedAt: new Date(),
        error: "No connected OAuth publishing account found for provider.",
        nextRetryAt: attempt.attemptNumber < attempt.maxAttempts ? new Date(Date.now() + 5 * 60 * 1000) : null,
      },
    });

    return {
      ok: false,
      status: "NO_CONNECTION",
      attempt: failed,
    };
  }

  const validation = await validateOAuthConnection(attempt.connectionId);

  if (!validation.ok) {
    const failed = await prisma.publishingExecutionAttempt.update({
      where: { id: attempt.id },
      data: {
        status: "failed",
        failedAt: new Date(),
        error: `OAuth connection validation failed: ${validation.status}`,
        responseJson: validation,
        nextRetryAt: attempt.attemptNumber < attempt.maxAttempts ? new Date(Date.now() + 5 * 60 * 1000) : null,
      },
    });

    return {
      ok: false,
      status: "CONNECTION_INVALID",
      attempt: failed,
      validation,
    };
  }

  const providerPostId = makeProviderPostId(attempt.provider);
  const providerPostUrl = makeProviderPostUrl(attempt.provider, providerPostId);

  const responseJson = {
    provider: attempt.provider,
    simulated: true,
    realProviderApiExecuted: false,
    providerPostId,
    providerPostUrl,
    message: "Phase 75 simulated provider execution. Real API publishing can be enabled per provider in Phase 75.1+ once app approvals/scopes are complete.",
  };

  const published = await prisma.publishingExecutionAttempt.update({
    where: { id: attempt.id },
    data: {
      status: "published",
      providerPostId,
      providerPostUrl,
      responseJson,
      completedAt: new Date(),
      error: null,
      metadata: {
        ...(attempt.metadata as any || {}),
        publishedAt: new Date().toISOString(),
        realProviderApiExecuted: false,
      },
    },
  });

  await prisma.publishingWebhookDelivery.create({
    data: {
      attemptId: published.id,
      organizationId: published.organizationId,
      provider: published.provider,
      targetUrl: `${appUrl()}/api/internal/publishing/webhook-placeholder`,
      status: "skipped",
      payloadJson: {
        attemptId: published.id,
        provider: published.provider,
        status: published.status,
        providerPostUrl,
      },
      metadata: {
        source: "v5_phase75_webhook_placeholder",
        reason: "No external webhook targets configured yet.",
      },
    },
  });

  await recordCustomerAdminAction({
    organizationId: published.organizationId,
    userId: published.userId,
    companyId: published.companyId,
    adminUserId: published.createdBy,
    action: "PUBLISHING_EXECUTION_PUBLISHED",
    entityType: "PublishingExecutionAttempt",
    entityId: published.id,
    severity: published.mode === "live" ? "warning" : "info",
    afterJson: {
      provider: published.provider,
      status: published.status,
      providerPostUrl,
      simulated: true,
    },
  });

  return {
    ok: true,
    attempt: published,
  };
}

export async function retryPublishingExecutionAttempt({
  attemptId,
  retriedBy = "system-admin",
}: {
  attemptId: string;
  retriedBy?: string;
}) {
  const existing = await prisma.publishingExecutionAttempt.findUnique({
    where: { id: attemptId },
  });

  if (!existing) {
    return {
      ok: false,
      status: "NOT_FOUND",
      reason: "Publishing execution attempt not found.",
    };
  }

  if (existing.attemptNumber >= existing.maxAttempts) {
    return {
      ok: false,
      status: "MAX_ATTEMPTS_REACHED",
      reason: "Cannot retry because maxAttempts has been reached.",
      attempt: existing,
    };
  }

  const retry = await prisma.publishingExecutionAttempt.update({
    where: { id: attemptId },
    data: {
      status: "retrying",
      attemptNumber: existing.attemptNumber + 1,
      error: null,
      nextRetryAt: null,
      metadata: {
        ...(existing.metadata as any || {}),
        retriedBy,
        retriedAt: new Date().toISOString(),
      },
    },
  });

  await recordCustomerAdminAction({
    organizationId: retry.organizationId,
    userId: retry.userId,
    companyId: retry.companyId,
    adminUserId: retriedBy,
    action: "PUBLISHING_EXECUTION_RETRY_REQUESTED",
    entityType: "PublishingExecutionAttempt",
    entityId: retry.id,
    severity: "warning",
    beforeJson: existing,
    afterJson: retry,
  });

  return runPublishingExecutionAttempt(retry.id);
}

export async function cancelPublishingExecutionAttempt({
  attemptId,
  cancelledBy = "system-admin",
}: {
  attemptId: string;
  cancelledBy?: string;
}) {
  const existing = await prisma.publishingExecutionAttempt.findUnique({
    where: { id: attemptId },
  });

  if (!existing) {
    return {
      ok: false,
      status: "NOT_FOUND",
      reason: "Publishing execution attempt not found.",
    };
  }

  const cancelled = await prisma.publishingExecutionAttempt.update({
    where: { id: attemptId },
    data: {
      status: "cancelled",
      metadata: {
        ...(existing.metadata as any || {}),
        cancelledBy,
        cancelledAt: new Date().toISOString(),
      },
    },
  });

  return {
    ok: true,
    attempt: cancelled,
  };
}

export async function getPublishingExecutionDashboard(organizationId?: string | null) {
  const where = organizationId ? { organizationId } : {};

  const [attempts, webhookDeliveries, connections] = await Promise.all([
    prisma.publishingExecutionAttempt.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        webhookDeliveries: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    }),
    prisma.publishingWebhookDelivery.findMany({
      where: organizationId ? { organizationId } : {},
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.customerOAuthConnection.findMany({
      where: organizationId ? { organizationId } : {},
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  return {
    ok: true,
    attempts,
    webhookDeliveries,
    connections: connections.map((connection: any) => ({
      ...connection,
      encryptedAccessToken: undefined,
      encryptedRefreshToken: undefined,
      accessTokenHash: undefined,
      refreshTokenHash: undefined,
    })),
    summary: {
      attempts: attempts.length,
      queued: attempts.filter((attempt) => attempt.status === "queued").length,
      running: attempts.filter((attempt) => attempt.status === "running").length,
      published: attempts.filter((attempt) => attempt.status === "published").length,
      failed: attempts.filter((attempt) => attempt.status === "failed").length,
      retrying: attempts.filter((attempt) => attempt.status === "retrying").length,
      cancelled: attempts.filter((attempt) => attempt.status === "cancelled").length,
      webhookDeliveries: webhookDeliveries.length,
      connectedAccounts: connections.filter((connection) => connection.status === "connected").length,
    },
  };
}
