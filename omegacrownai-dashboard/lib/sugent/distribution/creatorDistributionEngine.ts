import crypto from "crypto";
import { prisma } from "@/lib/db";
import { recordAuditEvent } from "@/lib/sugent/audit/auditEngine";
import { checkCreatorUsageLimit, recordCreatorUsage, recordCreatorUsageBlocked } from "@/lib/sugent/billing/creatorBillingEngine";

function safeSlug(value: string) {
  const base = String(value || "creator-export")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);

  return `${base || "creator-export"}-${Date.now()}`;
}

function buildHashtags(projectType: string, channel: string) {
  const core = ["OmegaCrownAI", "AIContent", "CreatorTools"];

  if (projectType === "podcast") {
    core.push("Podcast", "AIPodcast");
  } else {
    core.push("AIVideo", "VideoMarketing");
  }

  if (channel === "tiktok") core.push("TikTokCreator");
  if (channel === "instagram") core.push("InstagramReels");
  if (channel === "youtube") core.push("YouTube");
  if (channel === "podcast_rss") core.push("RSS");

  return core;
}

function buildPlatformPayload({
  exportAsset,
  channel,
  title,
  description,
  caption,
  hashtags,
  shareUrl,
}: {
  exportAsset: any;
  channel: string;
  title: string;
  description: string;
  caption: string;
  hashtags: string[];
  shareUrl: string;
}) {
  const mediaUrl = exportAsset.publicUrl;

  if (channel === "youtube") {
    return {
      platform: "youtube",
      uploadStatus: "ready",
      title,
      description,
      tags: hashtags,
      mediaUrl,
      privacyStatus: "private",
      note: "Phase 57 prepares YouTube-ready metadata only; no external upload is performed.",
    };
  }

  if (channel === "tiktok") {
    return {
      platform: "tiktok",
      uploadStatus: "ready",
      caption: `${caption}\n\n${hashtags.map((tag) => `#${tag}`).join(" ")}`,
      mediaUrl,
      note: "Phase 57 prepares TikTok-ready metadata only; no external upload is performed.",
    };
  }

  if (channel === "instagram") {
    return {
      platform: "instagram",
      uploadStatus: "ready",
      caption: `${caption}\n\n${hashtags.map((tag) => `#${tag}`).join(" ")}`,
      mediaUrl,
      contentType: exportAsset.projectType === "video" ? "reel" : "audio_preview",
      note: "Phase 57 prepares Instagram-ready metadata only; no external upload is performed.",
    };
  }

  if (channel === "podcast_rss") {
    return {
      platform: "podcast_rss",
      itemStatus: "ready",
      title,
      description,
      enclosure: {
        url: mediaUrl,
        type: exportAsset.mimeType || "audio/mpeg",
        length: exportAsset.sizeBytes || 0,
      },
      guid: exportAsset.id,
      durationSeconds: exportAsset.durationSeconds,
      note: "Phase 57 prepares RSS item metadata only; RSS feed publishing comes later.",
    };
  }

  return {
    platform: "public_share",
    shareStatus: "ready",
    title,
    description,
    mediaUrl,
    shareUrl,
    note: "Public share record prepared.",
  };
}

export async function createCreatorDistribution({
  companyId,
  workspaceId,
  exportId,
  channel = "public_share",
  createdBy = "system-owner",
  actorType = "system",
}: {
  companyId: string;
  workspaceId?: string | null;
  exportId: string;
  channel?: string;
  createdBy?: string | null;
  actorType?: string;
}) {
  const exportAsset = await prisma.creatorExportAsset.findFirst({
    where: {
      id: exportId,
      companyId,
    },
  });

  if (!exportAsset) {
    return {
      ok: false,
      status: "NOT_FOUND",
      reason: "Creator export asset not found.",
    };
  }

  if (exportAsset.status !== "completed" || !exportAsset.publicUrl) {
    return {
      ok: false,
      status: "BLOCKED",
      reason: "Only completed exports with public URLs can be prepared for distribution.",
      export: exportAsset,
    };
  }

  const usageCheck = await checkCreatorUsageLimit({
    companyId,
    workspaceId: workspaceId || exportAsset.workspaceId || null,
    usageType: "distribution",
    amount: 1,
  });

  if (!usageCheck.ok) {
    await recordCreatorUsageBlocked({
      companyId,
      workspaceId: workspaceId || exportAsset.workspaceId || null,
      usageType: "distribution",
      entityType: "CreatorExportAsset",
      entityId: exportId,
      reason: usageCheck.reason,
      metadata: {
        projectId: exportAsset.projectId,
        projectType: exportAsset.projectType,
        channel,
        actorId: createdBy || "system-owner",
        actorType,
        planTier: usageCheck.plan.tier,
      },
    });

    return {
      ok: false,
      status: "LIMIT_EXCEEDED",
      reason: usageCheck.reason,
      usage: usageCheck,
    };
  }

  const title = exportAsset.title || "OmegaCrownAI Creator Export";
  const description =
    exportAsset.description ||
    "Created with OmegaCrownAI creator export pipeline.";
  const hashtags = buildHashtags(exportAsset.projectType, channel);
  const caption = `${title} — created with OmegaCrownAI.`;
  const shareSlug = safeSlug(title);
  const shareUrl = `/share/${shareSlug}`;

  const payload = buildPlatformPayload({
    exportAsset,
    channel,
    title,
    description,
    caption,
    hashtags,
    shareUrl,
  });

  const distribution = await prisma.creatorDistributionRecord.create({
    data: {
      companyId,
      workspaceId: workspaceId || exportAsset.workspaceId || null,
      exportId,
      projectId: exportAsset.projectId,
      projectType: exportAsset.projectType,
      channel,
      status: "ready",
      title,
      description,
      caption,
      hashtags,
      mediaUrl: exportAsset.publicUrl,
      shareSlug,
      shareUrl,
      platformPayloadJson: payload,
      resultJson: {
        prepared: true,
        externalPublishExecuted: false,
        channel,
        preparedAt: new Date().toISOString(),
      },
      createdBy: createdBy || "system-owner",
      actorType,
    },
  });

  await prisma.creatorDistributionEvent.create({
    data: {
      distributionId: distribution.id,
      companyId,
      exportId,
      channel,
      type: "DISTRIBUTION_READY",
      status: "ready",
      message: `Distribution record prepared for ${channel}.`,
      metadata: {
        shareSlug,
        shareUrl,
        mediaUrl: exportAsset.publicUrl,
      },
    },
  });

  await recordCreatorUsage({
    companyId,
    workspaceId: workspaceId || exportAsset.workspaceId || null,
    usageType: "distribution",
    amount: 1,
    entityType: "CreatorDistributionRecord",
    entityId: distribution.id,
    metadata: {
      exportId,
      channel,
      shareSlug,
      shareUrl,
    },
  });

  await recordAuditEvent({
    companyId,
    workspaceId: workspaceId || exportAsset.workspaceId || null,
    projectId: exportAsset.projectId,
    actorId: createdBy || "system-owner",
    actorType,
    action: "CREATOR_DISTRIBUTION_READY",
    entityType: "CreatorDistributionRecord",
    entityId: distribution.id,
    severity: "info",
    metadata: {
      exportId,
      channel,
      shareSlug,
      shareUrl,
      mediaUrl: exportAsset.publicUrl,
    },
  });

  return {
    ok: true,
    status: "READY",
    distribution,
    usage: usageCheck,
  };
}

export async function getCreatorDistributionDashboard(companyId: string) {
  const records = await prisma.creatorDistributionRecord.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      events: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return {
    ok: true,
    companyId,
    records,
    summary: {
      records: records.length,
      ready: records.filter((item) => item.status === "ready").length,
      youtube: records.filter((item) => item.channel === "youtube").length,
      tiktok: records.filter((item) => item.channel === "tiktok").length,
      instagram: records.filter((item) => item.channel === "instagram").length,
      podcastRss: records.filter((item) => item.channel === "podcast_rss").length,
      publicShare: records.filter((item) => item.channel === "public_share").length,
    },
  };
}

export async function getPublicShareBySlug(slug: string) {
  const record = await prisma.creatorDistributionRecord.findFirst({
    where: {
      shareSlug: slug,
      status: "ready",
    },
  });

  return record;
}

function hashIp(value?: string | null) {
  if (!value) return null;
  return crypto.createHash("sha256").update(value).digest("hex");
}

export async function recordSharePortalEvent({
  slug,
  eventType,
  userAgent,
  ip,
  referrer,
  metadata,
}: {
  slug: string;
  eventType: string;
  userAgent?: string | null;
  ip?: string | null;
  referrer?: string | null;
  metadata?: any;
}) {
  const record = await getPublicShareBySlug(slug);

  if (!record) {
    return {
      ok: false,
      status: "NOT_FOUND",
      reason: "Share record not found.",
    };
  }

  const event = await prisma.creatorSharePortalEvent.create({
    data: {
      companyId: record.companyId,
      distributionId: record.id,
      exportId: record.exportId,
      shareSlug: slug,
      eventType,
      status: "recorded",
      userAgent: userAgent || null,
      ipHash: hashIp(ip),
      referrer: referrer || null,
      metadata: metadata || {},
    },
  });

  await prisma.creatorDistributionEvent.create({
    data: {
      distributionId: record.id,
      companyId: record.companyId,
      exportId: record.exportId,
      channel: record.channel,
      type: `SHARE_${eventType.toUpperCase()}`,
      status: "recorded",
      message: `Share portal event recorded: ${eventType}.`,
      metadata: {
        shareSlug: slug,
        eventId: event.id,
      },
    },
  });

  return {
    ok: true,
    event,
  };
}

export async function getSharePortalDetails(slug: string) {
  const record = await prisma.creatorDistributionRecord.findFirst({
    where: {
      shareSlug: slug,
      status: "ready",
    },
    include: {
      events: {
        orderBy: { createdAt: "desc" },
        take: 25,
      },
    },
  });

  if (!record) return null;

  const [exportAsset, portalEvents] = await Promise.all([
    prisma.creatorExportAsset.findFirst({
      where: {
        id: record.exportId,
        companyId: record.companyId,
      },
    }),
    prisma.creatorSharePortalEvent.findMany({
      where: {
        distributionId: record.id,
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  const views = portalEvents.filter((event) => event.eventType === "view").length;
  const downloads = portalEvents.filter((event) => event.eventType === "download").length;
  const opens = portalEvents.filter((event) => event.eventType === "open_media").length;

  return {
    record,
    exportAsset,
    portalEvents,
    summary: {
      views,
      downloads,
      opens,
      events: portalEvents.length,
    },
  };
}
