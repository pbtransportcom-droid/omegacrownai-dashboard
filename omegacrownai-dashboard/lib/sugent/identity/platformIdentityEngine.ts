import crypto from "crypto";
import { prisma } from "@/lib/db";
import { recordAuditEvent } from "@/lib/sugent/audit/auditEngine";

function stableStringify(value: any): string {
  if (value === null || value === undefined) return "";
  if (typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;

  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
    .join(",")}}`;
}

function sha256(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function buildWatermarkPayload({
  companyId,
  workspaceId,
  projectId,
  projectType,
  assetId,
  source,
  prompt,
  metadata,
}: {
  companyId?: string | null;
  workspaceId?: string | null;
  projectId?: string | null;
  projectType?: string | null;
  assetId?: string | null;
  source?: string | null;
  prompt?: string | null;
  metadata?: any;
}) {
  return {
    platform: "OmegaCrownAI",
    identityVersion: "phase35-v1",
    companyId: companyId || null,
    workspaceId: workspaceId || null,
    projectId: projectId || null,
    projectType: projectType || null,
    assetId: assetId || null,
    source: source || "platform_identity",
    promptHash: prompt ? sha256(prompt) : null,
    issuedAt: new Date().toISOString(),
    policy: {
      promptAccuracyRequired: true,
      factualConsistencyRequired: true,
      legendaryConsistencyRequired: true,
      productionQualityRequired: true,
      antiCloneProtected: true,
    },
    metadata: metadata || {},
  };
}

export async function createPlatformWatermark({
  companyId,
  workspaceId,
  projectId,
  projectType,
  assetId,
  watermarkType = "metadata",
  source,
  prompt,
  metadata,
}: {
  companyId?: string | null;
  workspaceId?: string | null;
  projectId?: string | null;
  projectType?: string | null;
  assetId?: string | null;
  watermarkType?: string;
  source?: string | null;
  prompt?: string | null;
  metadata?: any;
}) {
  const payload = buildWatermarkPayload({
    companyId,
    workspaceId,
    projectId,
    projectType,
    assetId,
    source,
    prompt,
    metadata,
  });

  const payloadText = stableStringify(payload);
  const hash = sha256(payloadText);
  const watermarkKey = `omega:${hash.slice(0, 16)}`;

  const watermark = await prisma.platformWatermark.create({
    data: {
      companyId: companyId || null,
      workspaceId: workspaceId || null,
      projectId: projectId || null,
      projectType: projectType || null,
      assetId: assetId || null,
      watermarkType,
      watermarkKey,
      payloadJson: payload,
      hash,
      status: "active",
    },
  });

  if (companyId) {
    await recordAuditEvent({
      companyId,
      workspaceId: workspaceId || null,
      projectId: projectId || null,
      actorId: "platform-identity",
      actorType: "system",
      action: "PLATFORM_WATERMARK_CREATED",
      entityType: "PlatformWatermark",
      entityId: watermark.id,
      severity: "info",
      metadata: {
        watermarkId: watermark.id,
        watermarkKey,
        hash,
        assetId: assetId || null,
      },
    });
  }

  return watermark;
}

export async function createAssetFingerprint({
  companyId,
  workspaceId,
  projectId,
  projectType,
  assetId,
  sourceType,
  prompt,
  content,
  metadata,
}: {
  companyId?: string | null;
  workspaceId?: string | null;
  projectId?: string | null;
  projectType?: string | null;
  assetId?: string | null;
  sourceType: string;
  prompt?: string | null;
  content?: string | null;
  metadata?: any;
}) {
  const promptHash = prompt ? sha256(prompt) : null;
  const contentHash = content ? sha256(content) : null;

  const lineagePayload = {
    companyId: companyId || null,
    workspaceId: workspaceId || null,
    projectId: projectId || null,
    projectType: projectType || null,
    assetId: assetId || null,
    sourceType,
    promptHash,
    contentHash,
    metadata: metadata || {},
  };

  const lineageHash = sha256(stableStringify(lineagePayload));
  const fingerprint = sha256(`omega-fingerprint|${lineageHash}`);

  const item = await prisma.assetFingerprint.create({
    data: {
      companyId: companyId || null,
      workspaceId: workspaceId || null,
      projectId: projectId || null,
      projectType: projectType || null,
      assetId: assetId || null,
      sourceType,
      fingerprint,
      promptHash,
      contentHash,
      lineageHash,
      metadata: metadata || {},
    },
  });

  if (companyId) {
    await recordAuditEvent({
      companyId,
      workspaceId: workspaceId || null,
      projectId: projectId || null,
      actorId: "platform-identity",
      actorType: "system",
      action: "ASSET_FINGERPRINT_CREATED",
      entityType: "AssetFingerprint",
      entityId: item.id,
      severity: "info",
      metadata: {
        fingerprintId: item.id,
        fingerprint,
        assetId: assetId || null,
        sourceType,
      },
    });
  }

  return item;
}

export async function protectProjectAssets({
  companyId,
  projectId,
  projectType = "video",
}: {
  companyId: string;
  projectId: string;
  projectType?: "video" | "podcast";
}) {
  const created: any[] = [];

  if (projectType === "podcast") {
    const podcast = await prisma.podcastProject.findFirst({
      where: {
        id: projectId,
        companyId,
      },
      include: {
        segments: true,
      },
    });

    if (!podcast) {
      return {
        ok: false,
        status: "NOT_FOUND",
        reason: "Podcast project not found.",
      };
    }

    for (const segment of podcast.segments) {
      const content = String(segment.scriptText || "");
      const fingerprint = await createAssetFingerprint({
        companyId,
        projectId,
        projectType,
        assetId: segment.id,
        sourceType: "podcast_segment",
        prompt: segment.title || podcast.title,
        content,
        metadata: {
          segmentIndex: segment.index,
          title: segment.title,
        },
      });

      const watermark = await createPlatformWatermark({
        companyId,
        projectId,
        projectType,
        assetId: segment.id,
        source: "podcast_segment",
        prompt: content,
        metadata: {
          fingerprintId: fingerprint.id,
          segmentIndex: segment.index,
        },
      });

      created.push({ fingerprint, watermark });
    }
  } else {
    const video = await prisma.videoProject.findFirst({
      where: {
        id: projectId,
        companyId,
      },
      include: {
        scenes: true,
        assets: true,
      },
    });

    if (!video) {
      return {
        ok: false,
        status: "NOT_FOUND",
        reason: "Video project not found.",
      };
    }

    for (const asset of video.assets) {
      const prompt = String((asset.metadata as any)?.promptSeed || (asset.metadata as any)?.text || asset.label || "");
      const content = stableStringify(asset);

      const fingerprint = await createAssetFingerprint({
        companyId,
        projectId,
        projectType,
        assetId: asset.id,
        sourceType: asset.type,
        prompt,
        content,
        metadata: {
          label: asset.label,
          sceneId: asset.sceneId,
          placeholder: asset.placeholder,
          storageKey: asset.storageKey,
        },
      });

      const watermark = await createPlatformWatermark({
        companyId,
        projectId,
        projectType,
        assetId: asset.id,
        source: asset.type,
        prompt,
        metadata: {
          fingerprintId: fingerprint.id,
          label: asset.label,
          sceneId: asset.sceneId,
        },
      });

      created.push({ fingerprint, watermark });
    }

    for (const scene of video.scenes) {
      const prompt = `${scene.title || ""} ${scene.scriptSegment || ""} ${scene.voiceoverText || ""}`.trim();
      const content = stableStringify(scene);

      const fingerprint = await createAssetFingerprint({
        companyId,
        projectId,
        projectType,
        assetId: scene.id,
        sourceType: "video_scene",
        prompt,
        content,
        metadata: {
          sceneIndex: scene.index,
          title: scene.title,
        },
      });

      const watermark = await createPlatformWatermark({
        companyId,
        projectId,
        projectType,
        assetId: scene.id,
        source: "video_scene",
        prompt,
        metadata: {
          fingerprintId: fingerprint.id,
          sceneIndex: scene.index,
        },
      });

      created.push({ fingerprint, watermark });
    }
  }

  return {
    ok: true,
    status: "PROTECTED",
    projectId,
    projectType,
    created,
    summary: {
      records: created.length,
      fingerprints: created.length,
      watermarks: created.length,
    },
  };
}

export async function detectCloneByHash({
  companyId,
  suspectedHash,
  projectId,
  assetId,
}: {
  companyId?: string | null;
  suspectedHash: string;
  projectId?: string | null;
  assetId?: string | null;
}) {
  const matches = await prisma.assetFingerprint.findMany({
    where: {
      ...(companyId ? { companyId } : {}),
      OR: [
        { fingerprint: suspectedHash },
        { promptHash: suspectedHash },
        { contentHash: suspectedHash },
        { lineageHash: suspectedHash },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const exact = matches.length > 0;
  const score = exact ? 100 : 0;

  const event = await prisma.cloneDetectionEvent.create({
    data: {
      companyId: companyId || null,
      projectId: projectId || null,
      assetId: assetId || null,
      suspectedHash,
      matchedHash: matches[0]?.fingerprint || null,
      matchScore: score,
      status: exact ? "matched" : "open",
      reason: exact ? "Exact fingerprint/hash match found." : "No exact fingerprint match found.",
      metadata: {
        matchCount: matches.length,
        matches: matches.map((item) => ({
          id: item.id,
          fingerprint: item.fingerprint,
          projectId: item.projectId,
          assetId: item.assetId,
          sourceType: item.sourceType,
        })),
      },
    },
  });

  if (companyId) {
    await recordAuditEvent({
      companyId,
      projectId: projectId || null,
      actorId: "platform-identity",
      actorType: "system",
      action: "CLONE_DETECTION_RUN",
      entityType: "CloneDetectionEvent",
      entityId: event.id,
      severity: exact ? "warning" : "info",
      metadata: {
        suspectedHash,
        matchScore: score,
        matchCount: matches.length,
      },
    });
  }

  return {
    ok: true,
    event,
    matches,
  };
}

export async function getIdentityDashboard(companyId: string) {
  const [watermarks, fingerprints, cloneEvents] = await Promise.all([
    prisma.platformWatermark.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.assetFingerprint.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.cloneDetectionEvent.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  const fingerprintsByType = fingerprints.reduce((acc: Record<string, number>, item) => {
    acc[item.sourceType] = (acc[item.sourceType] || 0) + 1;
    return acc;
  }, {});

  const watermarksByType = watermarks.reduce((acc: Record<string, number>, item) => {
    acc[item.watermarkType] = (acc[item.watermarkType] || 0) + 1;
    return acc;
  }, {});

  return {
    ok: true,
    companyId,
    watermarks,
    fingerprints,
    cloneEvents,
    fingerprintsByType,
    watermarksByType,
    summary: {
      watermarks: watermarks.length,
      fingerprints: fingerprints.length,
      cloneEvents: cloneEvents.length,
      matchedClones: cloneEvents.filter((event) => event.status === "matched").length,
      activeWatermarks: watermarks.filter((item) => item.status === "active").length,
    },
  };
}
