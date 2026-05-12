import { prisma } from "@/lib/db";

export async function createCreatorRenderJob({
  companyId,
  workspaceId,
  projectId,
  projectType = "video",
  exportId,
  format,
  renderer,
  inputJson,
  createdBy = "system-owner",
  actorType = "system",
}: {
  companyId: string;
  workspaceId?: string | null;
  projectId: string;
  projectType?: string;
  exportId?: string | null;
  format?: string | null;
  renderer?: string | null;
  inputJson?: any;
  createdBy?: string | null;
  actorType?: string;
}) {
  const job = await prisma.creatorRenderJob.create({
    data: {
      companyId,
      workspaceId: workspaceId || null,
      projectId,
      projectType,
      exportId: exportId || null,
      status: "queued",
      progress: 0,
      attempt: 0,
      maxAttempts: 3,
      format: format || null,
      renderer: renderer || null,
      inputJson: inputJson || {},
      createdBy: createdBy || "system-owner",
      actorType,
      queuedAt: new Date(),
    },
  });

  await prisma.creatorRenderJobEvent.create({
    data: {
      jobId: job.id,
      companyId,
      projectId,
      projectType,
      type: "JOB_QUEUED",
      status: "queued",
      progress: 0,
      message: "Creator render job queued.",
      metadata: {
        format,
        renderer,
      },
    },
  });

  return job;
}

export async function updateCreatorRenderJob({
  jobId,
  status,
  progress,
  message,
  metadata,
  outputJson,
  error,
}: {
  jobId: string;
  status?: string;
  progress?: number;
  message?: string;
  metadata?: any;
  outputJson?: any;
  error?: string | null;
}) {
  const existing = await prisma.creatorRenderJob.findUniqueOrThrow({
    where: { id: jobId },
  });

  const nextProgress =
    typeof progress === "number"
      ? Math.max(0, Math.min(100, Math.round(progress)))
      : existing.progress;

  const data: any = {
    progress: nextProgress,
  };

  if (status) data.status = status;
  if (outputJson !== undefined) data.outputJson = outputJson;
  if (error !== undefined) data.error = error;

  if (status === "running" && !existing.startedAt) {
    data.startedAt = new Date();
  }

  if (status === "completed") {
    data.completedAt = new Date();
    data.progress = 100;
    data.error = null;
  }

  if (status === "failed") {
    data.failedAt = new Date();
  }

  const job = await prisma.creatorRenderJob.update({
    where: { id: jobId },
    data,
  });

  await prisma.creatorRenderJobEvent.create({
    data: {
      jobId,
      companyId: existing.companyId,
      projectId: existing.projectId,
      projectType: existing.projectType,
      type: status ? `JOB_${status.toUpperCase()}` : "JOB_PROGRESS",
      status: status || existing.status,
      progress: job.progress,
      message: message || null,
      metadata: metadata || {},
    },
  });

  return job;
}

export async function retryCreatorRenderJob(jobId: string) {
  const job = await prisma.creatorRenderJob.findUniqueOrThrow({
    where: { id: jobId },
  });

  if (job.attempt >= job.maxAttempts) {
    return prisma.creatorRenderJob.update({
      where: { id: jobId },
      data: {
        status: "failed",
        error: "Maximum retry attempts reached.",
        failedAt: new Date(),
      },
    });
  }

  const retried = await prisma.creatorRenderJob.update({
    where: { id: jobId },
    data: {
      status: "queued",
      progress: 0,
      attempt: job.attempt + 1,
      error: null,
      queuedAt: new Date(),
      startedAt: null,
      completedAt: null,
      failedAt: null,
    },
  });

  await prisma.creatorRenderJobEvent.create({
    data: {
      jobId,
      companyId: job.companyId,
      projectId: job.projectId,
      projectType: job.projectType,
      type: "JOB_RETRIED",
      status: "queued",
      progress: 0,
      message: "Creator render job queued for retry.",
      metadata: {
        attempt: retried.attempt,
        maxAttempts: retried.maxAttempts,
      },
    },
  });

  return retried;
}

export async function getCreatorRenderJobDashboard(companyId: string) {
  const jobs = await prisma.creatorRenderJob.findMany({
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
    jobs,
    summary: {
      jobs: jobs.length,
      queued: jobs.filter((job) => job.status === "queued").length,
      running: jobs.filter((job) => job.status === "running").length,
      completed: jobs.filter((job) => job.status === "completed").length,
      failed: jobs.filter((job) => job.status === "failed").length,
      averageProgress: jobs.length
        ? Math.round(jobs.reduce((sum, job) => sum + job.progress, 0) / jobs.length)
        : 0,
    },
  };
}
