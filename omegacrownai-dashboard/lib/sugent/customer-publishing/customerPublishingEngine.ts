import crypto from "crypto";
import { prisma } from "@/lib/db";
import { checkCustomerPermission } from "@/lib/sugent/customer-team/customerTeamEngine";

const SUPPORTED_PROVIDERS = ["youtube", "tiktok", "instagram", "linkedin", "x", "webhook", "s3", "gcs"];

function normalizeProvider(provider?: string | null) {
  const value = String(provider || "webhook").toLowerCase();
  return SUPPORTED_PROVIDERS.includes(value) ? value : "webhook";
}

function categoryForProvider(provider: string) {
  if (["s3", "gcs"].includes(provider)) return "cloud_export";
  if (provider === "webhook") return "webhook";
  return "publishing";
}

function targetTypeForProvider(provider: string) {
  if (["s3", "gcs"].includes(provider)) return "cloud_export";
  if (provider === "webhook") return "webhook";
  return "social";
}

function hashValue(value?: string | null) {
  if (!value) return null;
  return crypto.createHash("sha256").update(value).digest("hex");
}

function buildProviderReadyPayload({
  provider,
  title,
  description,
  caption,
  mediaUrl,
  destinationUrl,
}: {
  provider: string;
  title?: string | null;
  description?: string | null;
  caption?: string | null;
  mediaUrl?: string | null;
  destinationUrl?: string | null;
}) {
  if (provider === "youtube") {
    return {
      provider,
      uploadStatus: "queued",
      privacyStatus: "private",
      title: title || "OmegaCrownAI Export",
      description: description || "",
      mediaUrl,
      tags: ["OmegaCrownAI", "AIContent", "CreatorTools"],
      note: "Phase 65 creates YouTube-ready publish jobs; real upload adapter comes later.",
    };
  }

  if (provider === "tiktok") {
    return {
      provider,
      uploadStatus: "queued",
      caption: caption || title || "Created with OmegaCrownAI",
      mediaUrl,
      note: "Phase 65 creates TikTok-ready publish jobs; real upload adapter comes later.",
    };
  }

  if (provider === "instagram") {
    return {
      provider,
      uploadStatus: "queued",
      contentType: "reel",
      caption: caption || title || "Created with OmegaCrownAI",
      mediaUrl,
      note: "Phase 65 creates Instagram-ready publish jobs; real upload adapter comes later.",
    };
  }

  if (provider === "linkedin") {
    return {
      provider,
      uploadStatus: "queued",
      text: caption || description || title || "Created with OmegaCrownAI",
      mediaUrl,
      note: "Phase 65 creates LinkedIn-ready publish jobs; real upload adapter comes later.",
    };
  }

  if (provider === "x") {
    return {
      provider,
      uploadStatus: "queued",
      text: caption || title || "Created with OmegaCrownAI",
      mediaUrl,
      note: "Phase 65 creates X-ready publish jobs; real upload adapter comes later.",
    };
  }

  if (provider === "s3" || provider === "gcs") {
    return {
      provider,
      exportStatus: "queued",
      sourceUrl: mediaUrl,
      destinationUrl,
      note: `Phase 65 creates ${provider.toUpperCase()} export-ready jobs; real cloud transfer adapter comes later.`,
    };
  }

  return {
    provider: "webhook",
    deliveryStatus: "queued",
    destinationUrl,
    payload: {
      title,
      description,
      caption,
      mediaUrl,
    },
    note: "Phase 65 creates webhook-ready publish jobs; real delivery adapter comes later.",
  };
}

export async function connectCustomerExternalAccount({
  organizationId,
  companyId,
  provider,
  mode = "test",
  status = "connected",
  displayName,
  externalAccountId,
  accessToken,
  refreshToken,
  scopes,
  metadata,
  connectedByUserId,
}: {
  organizationId: string;
  companyId?: string | null;
  provider?: string | null;
  mode?: string;
  status?: string;
  displayName?: string | null;
  externalAccountId?: string | null;
  accessToken?: string | null;
  refreshToken?: string | null;
  scopes?: any;
  metadata?: any;
  connectedByUserId?: string | null;
}) {
  const normalizedProvider = normalizeProvider(provider);
  const category = categoryForProvider(normalizedProvider);

  const existing = await prisma.customerExternalAccount.findFirst({
    where: {
      organizationId,
      provider: normalizedProvider,
      externalAccountId: externalAccountId || null,
    },
    orderBy: { createdAt: "desc" },
  });

  const data = {
    companyId: companyId || null,
    provider: normalizedProvider,
    category,
    status,
    mode,
    displayName: displayName || `${normalizedProvider} account`,
    externalAccountId: externalAccountId || null,
    accessTokenHash: hashValue(accessToken),
    refreshTokenHash: hashValue(refreshToken),
    tokenJson: accessToken || refreshToken ? {
      placeholderOnly: true,
      accessTokenHash: hashValue(accessToken),
      refreshTokenHash: hashValue(refreshToken),
    } : undefined,
    scopes: scopes || [],
    metadata: {
      ...(metadata || {}),
      source: "v4_phase65_external_account",
      realOAuthPending: true,
    },
    connectedByUserId: connectedByUserId || null,
    connectedAt: status === "connected" ? new Date() : undefined,
  };

  const account = existing
    ? await prisma.customerExternalAccount.update({
        where: { id: existing.id },
        data,
      })
    : await prisma.customerExternalAccount.create({
        data: {
          organizationId,
          ...data,
        },
      });

  await prisma.customerPublishingEvent.create({
    data: {
      organizationId,
      provider: normalizedProvider,
      type: "EXTERNAL_ACCOUNT_CONNECTED",
      status: "recorded",
      message: `External account prepared for ${normalizedProvider}.`,
      metadata: {
        externalAccountId: account.id,
        category,
        mode,
        status,
      },
    },
  });

  return {
    ok: true,
    account,
  };
}

export async function disconnectCustomerExternalAccount(accountId: string) {
  const existing = await prisma.customerExternalAccount.findUnique({
    where: { id: accountId },
  });

  if (!existing) {
    return {
      ok: false,
      status: "NOT_FOUND",
      reason: "External account not found.",
    };
  }

  const account = await prisma.customerExternalAccount.update({
    where: { id: accountId },
    data: {
      status: "revoked",
      revokedAt: new Date(),
      metadata: {
        ...(existing.metadata as any || {}),
        revokedAt: new Date().toISOString(),
      },
    },
  });

  await prisma.customerPublishingEvent.create({
    data: {
      organizationId: existing.organizationId,
      provider: existing.provider,
      type: "EXTERNAL_ACCOUNT_REVOKED",
      status: "recorded",
      message: `External account revoked for ${existing.provider}.`,
      metadata: {
        externalAccountId: account.id,
      },
    },
  });

  return {
    ok: true,
    account,
  };
}

export async function queueCustomerPublishingJob({
  organizationId,
  companyId,
  externalAccountId,
  exportId,
  projectId,
  projectType,
  provider,
  title,
  description,
  caption,
  mediaUrl,
  destinationUrl,
  createdByUserId,
}: {
  organizationId: string;
  companyId?: string | null;
  externalAccountId?: string | null;
  exportId?: string | null;
  projectId?: string | null;
  projectType?: string | null;
  provider?: string | null;
  title?: string | null;
  description?: string | null;
  caption?: string | null;
  mediaUrl?: string | null;
  destinationUrl?: string | null;
  createdByUserId?: string | null;
}) {
  const normalizedProvider = normalizeProvider(provider);

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
        reason: "User does not have permission to queue publishing jobs.",
        permission,
      };
    }
  }

  const account = externalAccountId
    ? await prisma.customerExternalAccount.findUnique({ where: { id: externalAccountId } })
    : await prisma.customerExternalAccount.findFirst({
        where: {
          organizationId,
          provider: normalizedProvider,
          status: "connected",
        },
        orderBy: { createdAt: "desc" },
      });

  if (!account && !["webhook", "s3", "gcs"].includes(normalizedProvider)) {
    return {
      ok: false,
      status: "NO_ACCOUNT",
      reason: `No connected ${normalizedProvider} account found.`,
    };
  }

  const requestJson = buildProviderReadyPayload({
    provider: normalizedProvider,
    title,
    description,
    caption,
    mediaUrl,
    destinationUrl,
  });

  const job = await prisma.customerPublishingJob.create({
    data: {
      organizationId,
      companyId: companyId || account?.companyId || null,
      externalAccountId: account?.id || null,
      exportId: exportId || null,
      projectId: projectId || null,
      projectType: projectType || null,
      provider: normalizedProvider,
      targetType: targetTypeForProvider(normalizedProvider),
      status: "queued",
      title: title || "OmegaCrownAI Publish Job",
      description: description || null,
      caption: caption || null,
      mediaUrl: mediaUrl || null,
      destinationUrl: destinationUrl || null,
      requestJson,
      createdByUserId: createdByUserId || null,
    },
  });

  await prisma.customerPublishingEvent.create({
    data: {
      organizationId,
      publishingJobId: job.id,
      provider: normalizedProvider,
      type: "PUBLISHING_JOB_QUEUED",
      status: "queued",
      message: `Publishing job queued for ${normalizedProvider}.`,
      metadata: {
        jobId: job.id,
        externalAccountId: account?.id || null,
        exportId,
        projectId,
      },
    },
  });

  return {
    ok: true,
    job,
  };
}

export async function runCustomerPublishingJob(jobId: string) {
  const existing = await prisma.customerPublishingJob.findUnique({
    where: { id: jobId },
  });

  if (!existing) {
    return {
      ok: false,
      status: "NOT_FOUND",
      reason: "Publishing job not found.",
    };
  }

  const running = await prisma.customerPublishingJob.update({
    where: { id: jobId },
    data: {
      status: "running",
      attempt: { increment: 1 },
      startedAt: new Date(),
    },
  });

  await prisma.customerPublishingEvent.create({
    data: {
      organizationId: existing.organizationId,
      publishingJobId: jobId,
      provider: existing.provider,
      type: "PUBLISHING_JOB_STARTED",
      status: "running",
      message: `Publishing job started for ${existing.provider}.`,
      metadata: {
        attempt: running.attempt,
      },
    },
  });

  const published = await prisma.customerPublishingJob.update({
    where: { id: jobId },
    data: {
      status: "published",
      publishedAt: new Date(),
      responseJson: {
        simulated: true,
        externalPublishExecuted: false,
        provider: existing.provider,
        providerReadyPayload: existing.requestJson,
        note: "Phase 65 marks provider-ready jobs as published in simulation mode. Real provider adapters come later.",
      },
      externalPostId: `sim_${existing.provider}_${Date.now()}`,
      externalUrl: existing.destinationUrl || existing.mediaUrl || null,
    },
  });

  await prisma.customerPublishingEvent.create({
    data: {
      organizationId: existing.organizationId,
      publishingJobId: jobId,
      provider: existing.provider,
      type: "PUBLISHING_JOB_PUBLISHED",
      status: "published",
      message: `Publishing job completed for ${existing.provider}.`,
      metadata: {
        jobId,
        externalPostId: published.externalPostId,
        simulated: true,
      },
    },
  });

  return {
    ok: true,
    job: published,
  };
}

export async function getCustomerPublishingDashboard(organizationId: string) {
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

  const [accounts, jobs, events] = await Promise.all([
    prisma.customerExternalAccount.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.customerPublishingJob.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.customerPublishingEvent.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  return {
    ok: true,
    organization,
    accounts,
    jobs,
    events,
    supportedProviders: SUPPORTED_PROVIDERS,
    summary: {
      accounts: accounts.length,
      connectedAccounts: accounts.filter((item) => item.status === "connected").length,
      jobs: jobs.length,
      queued: jobs.filter((item) => item.status === "queued").length,
      running: jobs.filter((item) => item.status === "running").length,
      published: jobs.filter((item) => item.status === "published").length,
      failed: jobs.filter((item) => item.status === "failed").length,
    },
  };
}
