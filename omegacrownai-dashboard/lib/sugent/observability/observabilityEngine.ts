import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

function hourKey(date: Date) {
  return date.getHours();
}

export async function getObservabilitySummary(companyId?: string | null) {
  const where = companyId ? { companyId } : {};

  const [jobs, deadLetters, recentLogs] = await Promise.all([
    prisma.job.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      take: 100,
      include: {
        logs: {
          orderBy: { createdAt: "desc" },
          take: 3,
        },
      },
    }),
    prisma.deadLetterJob.findMany({
      where,
      orderBy: { failedAt: "desc" },
      take: 100,
    }),
    prisma.jobLog.findMany({
      where: companyId
        ? {
            job: {
              companyId,
            },
          }
        : {},
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        job: true,
      },
    }),
  ]);

  const countsByTypeStatus: Record<string, Record<string, number>> = {};

  for (const job of jobs) {
    if (!countsByTypeStatus[job.type]) {
      countsByTypeStatus[job.type] = {};
    }

    countsByTypeStatus[job.type][job.status] =
      (countsByTypeStatus[job.type][job.status] || 0) + 1;
  }

  const deadByType: Record<string, number> = {};

  for (const job of deadLetters) {
    deadByType[job.type] = (deadByType[job.type] || 0) + 1;
  }

  return {
    ok: true,
    companyId: companyId || null,
    countsByTypeStatus,
    deadByType,
    recentJobs: jobs,
    recentLogs,
    deadLetters,
    summary: {
      totalJobs: jobs.length,
      pending: jobs.filter((job) => job.status === "pending").length,
      running: jobs.filter((job) => job.status === "running").length,
      succeeded: jobs.filter((job) => job.status === "succeeded").length,
      failed: jobs.filter((job) => job.status === "failed").length,
      dead: jobs.filter((job) => job.status === "dead").length,
      deadLetters: deadLetters.length,
      errorLogs: recentLogs.filter((log) => log.level === "error").length,
    },
  };
}

export async function getObservabilityHeatmap(companyId?: string | null) {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const jobs = await prisma.job.findMany({
    where: {
      ...(companyId ? { companyId } : {}),
      createdAt: {
        gte: since,
      },
    },
    select: {
      id: true,
      type: true,
      status: true,
      createdAt: true,
      errorKind: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 1000,
  });

  const buckets: Record<string, Record<number, number>> = {};
  const statusBuckets: Record<string, Record<string, number>> = {};

  for (const job of jobs) {
    const hour = hourKey(job.createdAt);

    if (!buckets[job.type]) buckets[job.type] = {};
    buckets[job.type][hour] = (buckets[job.type][hour] || 0) + 1;

    if (!statusBuckets[job.type]) statusBuckets[job.type] = {};
    statusBuckets[job.type][job.status] =
      (statusBuckets[job.type][job.status] || 0) + 1;
  }

  return {
    ok: true,
    companyId: companyId || null,
    since,
    buckets,
    statusBuckets,
    jobs,
  };
}

export async function getObservabilityDLQ(companyId?: string | null) {
  const deadLetters = await prisma.deadLetterJob.findMany({
    where: companyId ? { companyId } : {},
    orderBy: { failedAt: "desc" },
    take: 100,
  });

  return {
    ok: true,
    companyId: companyId || null,
    deadLetters,
    summary: {
      total: deadLetters.length,
      byType: deadLetters.reduce((acc: Record<string, number>, item) => {
        acc[item.type] = (acc[item.type] || 0) + 1;
        return acc;
      }, {}),
      byErrorKind: deadLetters.reduce((acc: Record<string, number>, item) => {
        const key = item.errorKind || "UNKNOWN_ERROR";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {}),
    },
  };
}

export async function getJobDetail(jobId: string) {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      logs: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  const deadLetter = await prisma.deadLetterJob.findUnique({
    where: { id: jobId },
  });

  return {
    ok: Boolean(job || deadLetter),
    job,
    deadLetter,
  };
}

export async function requeueJob(jobId: string) {
  const deadLetter = await prisma.deadLetterJob.findUnique({
    where: { id: jobId },
  });

  if (!deadLetter) {
    const existing = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!existing) {
      return {
        ok: false,
        status: "NOT_FOUND",
        reason: "No job or dead-letter record found.",
      };
    }

    const job = await prisma.job.update({
      where: { id: jobId },
      data: {
        status: "pending",
        attempt: 0,
        scheduledAt: new Date(),
        lastError: null,
        errorKind: null,
        completedAt: null,
      },
    });

    return {
      ok: true,
      status: "REQUEUED",
      job,
    };
  }

  const payload = deadLetter.payload as Prisma.InputJsonValue;

  const job = await prisma.job.upsert({
    where: { id: jobId },
    update: {
      companyId: deadLetter.companyId,
      workspaceId: deadLetter.workspaceId,
      type: deadLetter.type,
      payload,
      status: "pending",
      attempt: 0,
      maxAttempts: deadLetter.maxAttempts,
      scheduledAt: new Date(),
      lastError: null,
      errorKind: null,
      completedAt: null,
    },
    create: {
      id: deadLetter.id,
      companyId: deadLetter.companyId,
      workspaceId: deadLetter.workspaceId,
      type: deadLetter.type,
      payload,
      status: "pending",
      attempt: 0,
      maxAttempts: deadLetter.maxAttempts,
      scheduledAt: new Date(),
    },
  });

  await prisma.deadLetterJob.delete({
    where: { id: jobId },
  });

  return {
    ok: true,
    status: "REQUEUED_FROM_DLQ",
    job,
  };
}

export async function resolveJob(jobId: string) {
  const job = await prisma.job.update({
    where: { id: jobId },
    data: {
      status: "succeeded",
      lastError: null,
      errorKind: null,
      completedAt: new Date(),
    },
  });

  await prisma.deadLetterJob.deleteMany({
    where: { id: jobId },
  });

  return {
    ok: true,
    status: "RESOLVED",
    job,
  };
}
