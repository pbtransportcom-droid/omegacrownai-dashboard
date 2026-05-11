import { prisma } from "@/lib/db";
import { runCreativeStudioFlow } from "@/lib/sugent/creative-agents/coordinator";
import { createRenderJob, processNextRenderJob } from "@/lib/sugent/video/render";
import {
  createPublishJobsForLatestRenderedAssets,
  processNextPublishJob,
} from "@/lib/sugent/distribution/distributionEngine";
import { updateProjectVersionStatus } from "@/lib/sugent/versioning/versionEngine";
import {
  assertQAPassForProject,
  createQAScorecardForVersion,
  getLatestQAScorecard,
} from "@/lib/sugent/quality/qaScorecardEngine";

export async function getRuntimeProjects(companyId?: string) {
  const whereCompany = companyId ? { companyId } : {};

  const [videos, podcasts] = await Promise.all([
    prisma.videoProject.findMany({
      where: whereCompany,
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        scenes: true,
        assets: true,
        timeline: {
          include: {
            tracks: {
              include: {
                clips: true,
              },
            },
          },
        },
        renderJobs: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: { outputAsset: true },
        },
      },
    }),
    prisma.podcastProject.findMany({
      where: whereCompany,
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        outline: true,
        segments: true,
      },
    }),
  ]);

  const videoStates = await Promise.all(
    videos.map(async (project) => {
      const [latestVersion, reviewThreads, latestPublish, latestQA] = await Promise.all([
        prisma.projectVersion.findFirst({
          where: {
            companyId: project.companyId,
            projectId: project.id,
            projectType: "video",
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.reviewThread.findMany({
          where: {
            companyId: project.companyId,
            projectId: project.id,
            projectType: "video",
          },
        }),
        prisma.publishJob.findFirst({
          where: {
            companyId: project.companyId,
            asset: {
              projectId: project.id,
            },
          },
          orderBy: { createdAt: "desc" },
        }),
        getLatestQAScorecard({
          companyId: project.companyId,
          projectId: project.id,
          projectType: "video",
        }),
      ]);

      return {
        projectId: project.id,
        companyId: project.companyId,
        title: project.title,
        type: "VIDEO",
        status: project.status,
        hasScenes: project.scenes.length > 0,
        hasAssets: project.assets.length > 0,
        hasTimeline: Boolean(project.timeline),
        hasNormalizedTimeline: Boolean(project.timeline?.tracks?.length),
        latestVersion,
        latestQA,
        openReviewThreads: reviewThreads.filter((thread) => thread.status === "open").length,
        latestRender: project.renderJobs[0] || null,
        latestPublish,
      };
    })
  );

  const podcastStates = await Promise.all(
    podcasts.map(async (project) => {
      const [latestVersion, reviewThreads, latestQA] = await Promise.all([
        prisma.projectVersion.findFirst({
          where: {
            companyId: project.companyId,
            projectId: project.id,
            projectType: "podcast",
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.reviewThread.findMany({
          where: {
            companyId: project.companyId,
            projectId: project.id,
            projectType: "podcast",
          },
        }),
        getLatestQAScorecard({
          companyId: project.companyId,
          projectId: project.id,
          projectType: "podcast",
        }),
      ]);

      return {
        projectId: project.id,
        companyId: project.companyId,
        title: project.title,
        type: "PODCAST",
        status: project.status,
        hasScenes: project.segments.length > 0,
        hasAssets: project.segments.some((segment) => Boolean(segment.voiceAssetId)),
        hasTimeline: Boolean(project.outline),
        hasNormalizedTimeline: Boolean(project.outline),
        latestVersion,
        latestQA,
        openReviewThreads: reviewThreads.filter((thread) => thread.status === "open").length,
        latestRender: null,
        latestPublish: null,
      };
    })
  );

  return {
    ok: true,
    projects: [...videoStates, ...podcastStates],
  };
}

export async function runRuntimeVideoFromBrief({
  companyId,
  brief,
  title,
  autoApprove = false,
}: {
  companyId: string;
  brief: string;
  title?: string | null;
  autoApprove?: boolean;
}) {
  return runCreativeStudioFlow({
    companyId,
    mode: "video",
    brief,
    title: title || "Runtime Coordinator Video",
    autoApprove,
  });
}

export async function approveLatestVersion({
  companyId,
  projectId,
  projectType = "video",
}: {
  companyId: string;
  projectId: string;
  projectType?: "video" | "podcast";
}) {
  const version = await prisma.projectVersion.findFirst({
    where: {
      companyId,
      projectId,
      projectType,
    },
    orderBy: { createdAt: "desc" },
  });

  if (!version) {
    return {
      ok: false,
      status: "BLOCKED",
      reason: "No version exists to approve.",
    };
  }

  const scorecard = await createQAScorecardForVersion({
    companyId,
    versionId: version.id,
  });

  if (scorecard.overallScore < 70 || scorecard.status === "blocked") {
    return {
      ok: false,
      status: "QA_BLOCKED",
      reason: `QA score too low for approval: ${scorecard.overallScore}.`,
      scorecard,
    };
  }

  const approved = await updateProjectVersionStatus({
    companyId,
    versionId: version.id,
    status: "approved",
  });

  return {
    ok: true,
    status: "APPROVED",
    version: approved,
    scorecard,
  };
}

export async function renderIfApproved({
  companyId,
  projectId,
}: {
  companyId: string;
  projectId: string;
}) {
  const approvedVersion = await prisma.projectVersion.findFirst({
    where: {
      companyId,
      projectId,
      projectType: "video",
      status: "approved",
    },
    orderBy: { createdAt: "desc" },
  });

  if (!approvedVersion) {
    return {
      ok: false,
      status: "BLOCKED",
      reason: "No approved video version exists. Approve a version before rendering.",
    };
  }

  const qa = await assertQAPassForProject({
    companyId,
    projectId,
    projectType: "video",
    minimumScore: 70,
  });

  if (!qa.ok) {
    return qa;
  }

  const existingRunning = await prisma.renderJob.findFirst({
    where: {
      projectId,
      status: {
        in: ["queued", "running"],
      },
    },
  });

  if (existingRunning) {
    return {
      ok: true,
      status: "ALREADY_QUEUED",
      renderJob: existingRunning,
    };
  }

  const renderJob = await createRenderJob({
    companyId,
    projectId,
    type: "video",
  });

  return {
    ok: true,
    status: "QUEUED",
    renderJob,
  };
}

export async function publishIfRendered({
  companyId,
  projectId,
}: {
  companyId: string;
  projectId: string;
}) {
  const completedRender = await prisma.renderJob.findFirst({
    where: {
      projectId,
      project: {
        companyId,
      },
      status: "completed",
      outputAssetId: {
        not: null,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!completedRender) {
    return {
      ok: false,
      status: "BLOCKED",
      reason: "No completed render exists. Complete a render before publishing.",
    };
  }

  const result = await createPublishJobsForLatestRenderedAssets(companyId);

  return {
    ok: true,
    status: "PUBLISH_JOBS_CREATED",
    renderJobId: completedRender.id,
    result,
  };
}

export async function runOneRenderWorker() {
  const result = await processNextRenderJob();

  return {
    ok: true,
    result,
  };
}

export async function runOnePublishWorker() {
  const result = await processNextPublishJob();

  return {
    ok: true,
    result,
  };
}

export async function approveRenderAndPublish({
  companyId,
  projectId,
}: {
  companyId: string;
  projectId: string;
}) {
  const approval = await approveLatestVersion({
    companyId,
    projectId,
    projectType: "video",
  });

  if (!approval.ok) return approval;

  const render = await renderIfApproved({
    companyId,
    projectId,
  });

  return {
    ok: render.ok,
    status: render.status,
    approval,
    render,
  };
}
