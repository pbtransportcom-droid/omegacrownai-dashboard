import { prisma } from "@/lib/db";

type ProjectType = "video" | "podcast" | "VIDEO" | "PODCAST";

function normalizeProjectType(projectType: ProjectType) {
  return String(projectType).toLowerCase();
}

export async function createProjectVersion({
  companyId,
  projectId,
  projectType,
  label,
  parentVersionId,
  createdById,
}: {
  companyId: string;
  projectId: string;
  projectType: ProjectType;
  label?: string | null;
  parentVersionId?: string | null;
  createdById?: string | null;
}) {
  const normalizedType = normalizeProjectType(projectType);

  const snapshotJson =
    normalizedType === "video"
      ? await buildVideoSnapshot({ companyId, projectId })
      : await buildPodcastSnapshot({ companyId, projectId });

  return prisma.projectVersion.create({
    data: {
      companyId,
      projectId,
      projectType: normalizedType,
      label: label || `v-${new Date().toISOString()}`,
      parentVersionId: parentVersionId || null,
      createdById: createdById || null,
      snapshotJson,
      status: "draft",
    },
  });
}

async function buildVideoSnapshot({
  companyId,
  projectId,
}: {
  companyId: string;
  projectId: string;
}) {
  const project = await prisma.videoProject.findFirstOrThrow({
    where: { id: projectId, companyId },
    include: {
      script: true,
      timeline: {
        include: {
          tracks: {
            orderBy: { index: "asc" },
            include: {
              clips: {
                orderBy: { startTimeSeconds: "asc" },
                include: {
                  asset: true,
                  scene: true,
                },
              },
            },
          },
        },
      },
      scenes: {
        orderBy: { index: "asc" },
        include: {
          assets: true,
        },
      },
      assets: true,
      renderJobs: {
        orderBy: { createdAt: "desc" },
        include: { outputAsset: true },
      },
    },
  });

  return {
    version: "phase22-video-snapshot",
    capturedAt: new Date().toISOString(),
    project: {
      id: project.id,
      title: project.title,
      description: project.description,
      status: project.status,
      aspectRatio: project.aspectRatio,
      durationSeconds: project.durationSeconds,
      brandOverlay: project.brandOverlay,
    },
    script: project.script,
    scenes: project.scenes,
    timeline: project.timeline
      ? {
          id: project.timeline.id,
          fps: project.timeline.fps,
          durationSeconds: project.timeline.durationSeconds,
          structureJson: project.timeline.structureJson,
          tracks: project.timeline.tracks,
        }
      : null,
    assets: project.assets.map((asset) => ({
      id: asset.id,
      type: asset.type,
      label: asset.label,
      sceneId: asset.sceneId,
      storageKey: asset.storageKey,
      format: asset.format,
      placeholder: asset.placeholder,
      metadata: asset.metadata,
    })),
    renderJobs: project.renderJobs,
  };
}

async function buildPodcastSnapshot({
  companyId,
  projectId,
}: {
  companyId: string;
  projectId: string;
}) {
  const project = await prisma.podcastProject.findFirstOrThrow({
    where: { id: projectId, companyId },
    include: {
      outline: true,
      segments: {
        orderBy: { index: "asc" },
        include: {
          voiceAsset: true,
        },
      },
    },
  });

  return {
    version: "phase22-podcast-snapshot",
    capturedAt: new Date().toISOString(),
    project: {
      id: project.id,
      title: project.title,
      description: project.description,
      status: project.status,
      language: project.language,
      tone: project.tone,
      durationSeconds: project.durationSeconds,
    },
    outline: project.outline,
    segments: project.segments,
  };
}

export async function listProjectVersions({
  companyId,
  projectId,
}: {
  companyId: string;
  projectId: string;
}) {
  return prisma.projectVersion.findMany({
    where: {
      companyId,
      projectId,
    },
    orderBy: { createdAt: "desc" },
    include: {
      children: true,
      reviewThreads: {
        orderBy: { createdAt: "desc" },
        include: {
          comments: true,
        },
      },
    },
  });
}

export async function getProjectVersion({
  companyId,
  versionId,
}: {
  companyId: string;
  versionId: string;
}) {
  return prisma.projectVersion.findFirst({
    where: {
      id: versionId,
      companyId,
    },
    include: {
      parentVersion: true,
      children: true,
      reviewThreads: {
        orderBy: { createdAt: "desc" },
        include: {
          comments: true,
        },
      },
    },
  });
}

export async function updateProjectVersionStatus({
  companyId,
  versionId,
  status,
}: {
  companyId: string;
  versionId: string;
  status: "draft" | "in_review" | "approved" | "rejected" | "DRAFT" | "IN_REVIEW" | "APPROVED" | "REJECTED";
}) {
  const normalizedStatus = String(status).toLowerCase();

  if (!["draft", "in_review", "approved", "rejected"].includes(normalizedStatus)) {
    throw new Error("INVALID_VERSION_STATUS");
  }

  return prisma.projectVersion.update({
    where: { id: versionId },
    data: {
      status: normalizedStatus,
    },
  });
}

export async function getVersioningDashboard(companyId: string) {
  const [versions, threads] = await Promise.all([
    prisma.projectVersion.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        reviewThreads: {
          include: {
            comments: true,
          },
        },
      },
    }),
    prisma.reviewThread.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        comments: true,
        version: true,
      },
    }),
  ]);

  return {
    ok: true,
    companyId,
    versions,
    threads,
    summary: {
      versions: versions.length,
      draft: versions.filter((version) => version.status === "draft").length,
      inReview: versions.filter((version) => version.status === "in_review").length,
      approved: versions.filter((version) => version.status === "approved").length,
      rejected: versions.filter((version) => version.status === "rejected").length,
      threads: threads.length,
      openThreads: threads.filter((thread) => thread.status === "open").length,
      resolvedThreads: threads.filter((thread) => thread.status === "resolved").length,
    },
  };
}
