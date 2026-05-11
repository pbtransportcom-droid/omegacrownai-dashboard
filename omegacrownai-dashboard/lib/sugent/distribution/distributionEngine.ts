import { prisma } from "@/lib/db";

export async function ensureDefaultDistributionTargets(companyId: string) {
  const defaults = [
    {
      type: "internal_library",
      label: "Internal Content Library",
      configJson: {
        mode: "internal",
        description: "Stores published media in OmegaCrown AI internal library.",
      },
    },
    {
      type: "podcast_rss",
      label: "Podcast RSS Feed",
      configJson: {
        mode: "rss_stub",
        description: "Podcast RSS publishing foundation.",
      },
    },
    {
      type: "youtube",
      label: "YouTube Channel",
      configJson: {
        mode: "youtube_stub",
        description: "YouTube upload integration placeholder.",
      },
    },
    {
      type: "social_clip",
      label: "Social Clips",
      configJson: {
        mode: "social_stub",
        description: "Shorts/Reels/TikTok publishing placeholder.",
      },
    },
  ];

  const created = [];

  for (const target of defaults) {
    const existing = await prisma.distributionTarget.findFirst({
      where: {
        companyId,
        type: target.type,
        label: target.label,
      },
    });

    if (existing) {
      created.push(existing);
      continue;
    }

    created.push(
      await prisma.distributionTarget.create({
        data: {
          companyId,
          type: target.type,
          label: target.label,
          status: "active",
          configJson: target.configJson,
        },
      })
    );
  }

  return created;
}

export async function createDistributionTarget({
  companyId,
  type,
  label,
  configJson,
}: {
  companyId: string;
  type: string;
  label: string;
  configJson?: any;
}) {
  return prisma.distributionTarget.create({
    data: {
      companyId,
      type,
      label,
      status: "active",
      configJson: configJson || {},
    },
  });
}

export async function listDistributionTargets(companyId: string) {
  const targets = await prisma.distributionTarget.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
    include: {
      publishJobs: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { asset: true },
      },
    },
  });

  return {
    ok: true,
    companyId,
    targets,
  };
}

export async function createPublishJob({
  companyId,
  assetId,
  targetId,
  scheduledAt,
  metadata,
}: {
  companyId: string;
  assetId: string;
  targetId: string;
  scheduledAt?: Date | null;
  metadata?: any;
}) {
  const asset = await prisma.videoAsset.findFirstOrThrow({
    where: {
      id: assetId,
      project: {
        companyId,
      },
    },
  });

  const target = await prisma.distributionTarget.findFirstOrThrow({
    where: {
      id: targetId,
      companyId,
    },
  });

  return prisma.publishJob.create({
    data: {
      companyId,
      assetId: asset.id,
      targetId: target.id,
      status: "queued",
      scheduledAt: scheduledAt || null,
      metadata: metadata || {
        source: "manual_publish_job",
      },
    },
    include: {
      asset: true,
      target: true,
    },
  });
}

export async function listPublishJobs({
  companyId,
  assetId,
}: {
  companyId: string;
  assetId?: string | null;
}) {
  const jobs = await prisma.publishJob.findMany({
    where: {
      companyId,
      ...(assetId ? { assetId } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      asset: true,
      target: true,
    },
  });

  return {
    ok: true,
    companyId,
    jobs,
    summary: {
      jobs: jobs.length,
      queued: jobs.filter((job) => job.status === "queued").length,
      running: jobs.filter((job) => job.status === "running").length,
      completed: jobs.filter((job) => job.status === "completed").length,
      failed: jobs.filter((job) => job.status === "failed").length,
    },
  };
}

export async function getPublishJob({
  companyId,
  jobId,
}: {
  companyId: string;
  jobId: string;
}) {
  return prisma.publishJob.findFirst({
    where: {
      id: jobId,
      companyId,
    },
    include: {
      asset: true,
      target: true,
    },
  });
}

export async function processNextPublishJob() {
  const job = await prisma.publishJob.findFirst({
    where: {
      status: "queued",
      OR: [
        { scheduledAt: null },
        { scheduledAt: { lte: new Date() } },
      ],
    },
    orderBy: { createdAt: "asc" },
    include: {
      asset: true,
      target: true,
    },
  });

  if (!job) {
    return {
      ok: true,
      processed: false,
      message: "No queued publish job.",
    };
  }

  await prisma.publishJob.update({
    where: { id: job.id },
    data: {
      status: "running",
      metadata: {
        ...(job.metadata as any || {}),
        worker: "native_publish_worker",
        startedAt: new Date().toISOString(),
      },
    },
  });

  try {
    const externalId = await publishByTarget(job);

    const completed = await prisma.publishJob.update({
      where: { id: job.id },
      data: {
        status: "completed",
        externalId,
        publishedAt: new Date(),
        metadata: {
          ...(job.metadata as any || {}),
          worker: "native_publish_worker",
          completedAt: new Date().toISOString(),
          externalId,
        },
      },
      include: {
        asset: true,
        target: true,
      },
    });

    return {
      ok: true,
      processed: true,
      job: completed,
    };
  } catch (error: any) {
    const failed = await prisma.publishJob.update({
      where: { id: job.id },
      data: {
        status: "failed",
        errorMessage: error?.message || "Unknown publish error",
        metadata: {
          ...(job.metadata as any || {}),
          worker: "native_publish_worker",
          failedAt: new Date().toISOString(),
          error: error?.message || "Unknown publish error",
        },
      },
      include: {
        asset: true,
        target: true,
      },
    });

    return {
      ok: false,
      processed: true,
      job: failed,
      error: error?.message || "Unknown publish error",
    };
  }
}

async function publishByTarget(job: any) {
  if (job.target.type === "internal_library") {
    return publishToInternalLibrary(job);
  }

  if (job.target.type === "podcast_rss") {
    return publishToPodcastRss(job);
  }

  if (job.target.type === "youtube") {
    return publishToYouTube(job);
  }

  if (job.target.type === "social_clip") {
    return publishToSocialClip(job);
  }

  return `omega_publish_${job.id}`;
}

async function publishToInternalLibrary(job: any) {
  return `library_${job.assetId}_${Date.now()}`;
}

async function publishToPodcastRss(job: any) {
  return `rss_${job.assetId}_${Date.now()}`;
}

async function publishToYouTube(job: any) {
  return `youtube_stub_${job.assetId}_${Date.now()}`;
}

async function publishToSocialClip(job: any) {
  return `social_stub_${job.assetId}_${Date.now()}`;
}

export async function createPublishJobsForLatestRenderedAssets(companyId: string) {
  const targets = await ensureDefaultDistributionTargets(companyId);

  const assets = await prisma.videoAsset.findMany({
    where: {
      project: {
        companyId,
      },
      type: {
        in: ["rendered_video", "rendered_audio", "generated_voice", "generated_music"],
      },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const internalTarget =
    targets.find((target) => target.type === "internal_library") || targets[0];

  const jobs = [];

  for (const asset of assets) {
    const existing = await prisma.publishJob.findFirst({
      where: {
        companyId,
        assetId: asset.id,
        targetId: internalTarget.id,
      },
    });

    if (existing) continue;

    jobs.push(
      await createPublishJob({
        companyId,
        assetId: asset.id,
        targetId: internalTarget.id,
        metadata: {
          source: "auto_publish_latest_rendered_assets",
        },
      })
    );
  }

  return {
    ok: true,
    created: jobs.length,
    jobs,
  };
}

export async function getDistributionDashboard(companyId: string) {
  const [targets, jobs] = await Promise.all([
    prisma.distributionTarget.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      include: {
        publishJobs: {
          orderBy: { createdAt: "desc" },
          take: 5,
          include: { asset: true },
        },
      },
    }),
    prisma.publishJob.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        asset: true,
        target: true,
      },
    }),
  ]);

  return {
    ok: true,
    companyId,
    targets,
    jobs,
    summary: {
      targets: targets.length,
      jobs: jobs.length,
      queued: jobs.filter((job) => job.status === "queued").length,
      running: jobs.filter((job) => job.status === "running").length,
      completed: jobs.filter((job) => job.status === "completed").length,
      failed: jobs.filter((job) => job.status === "failed").length,
    },
  };
}
