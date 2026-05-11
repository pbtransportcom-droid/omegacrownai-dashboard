import { prisma } from "@/lib/db";
import { computeNextDelayMs } from "@/lib/sugent/reliability/backoff";
import {
  getErrorKind,
  isRetryableErrorKind,
  shouldDeadLetterImmediately,
} from "@/lib/sugent/reliability/errors";
import { handleJob } from "@/lib/sugent/reliability/jobHandlers";

export async function enqueueJob({
  companyId,
  workspaceId,
  type,
  payload,
  maxAttempts = 5,
  scheduledAt,
}: {
  companyId?: string | null;
  workspaceId?: string | null;
  type: string;
  payload: any;
  maxAttempts?: number;
  scheduledAt?: Date | null;
}) {
  return prisma.job.create({
    data: {
      companyId: companyId || null,
      workspaceId: workspaceId || null,
      type,
      payload,
      status: "pending",
      maxAttempts,
      scheduledAt: scheduledAt || new Date(),
    },
  });
}

export async function logJob({
  jobId,
  type,
  level = "info",
  message,
  metadata,
}: {
  jobId: string;
  type: string;
  level?: "info" | "warn" | "error";
  message: string;
  metadata?: any;
}) {
  return prisma.jobLog.create({
    data: {
      jobId,
      type,
      level,
      message,
      metadata: metadata || {},
    },
  });
}

export async function runJob(job: any) {
  await prisma.job.update({
    where: { id: job.id },
    data: {
      status: "running",
      startedAt: new Date(),
    },
  });

  await logJob({
    jobId: job.id,
    type: job.type,
    level: "info",
    message: "Job started.",
  });

  try {
    const output = await handleJob(job);

    const updated = await prisma.job.update({
      where: { id: job.id },
      data: {
        status: "succeeded",
        completedAt: new Date(),
        lastError: null,
        errorKind: null,
      },
    });

    await logJob({
      jobId: job.id,
      type: job.type,
      level: "info",
      message: "Job succeeded.",
      metadata: { output },
    });

    return {
      ok: true,
      job: updated,
      output,
    };
  } catch (error: any) {
    const errorKind = getErrorKind(error);
    const attempt = Number(job.attempt || 0) + 1;
    const message = error?.message || "Unknown job error";

    await logJob({
      jobId: job.id,
      type: job.type,
      level: "error",
      message,
      metadata: {
        errorKind,
        attempt,
      },
    });

    const shouldDeadLetter =
      shouldDeadLetterImmediately(errorKind) ||
      attempt >= Number(job.maxAttempts || 5) ||
      !isRetryableErrorKind(errorKind);

    if (shouldDeadLetter) {
      const dead = await prisma.$transaction(async (tx) => {
        const updated = await tx.job.update({
          where: { id: job.id },
          data: {
            status: "dead",
            attempt,
            completedAt: new Date(),
            lastError: message,
            errorKind,
          },
        });

        await tx.deadLetterJob.upsert({
          where: { id: job.id },
          update: {
            companyId: job.companyId || null,
            workspaceId: job.workspaceId || null,
            type: job.type,
            payload: job.payload,
            attempt,
            maxAttempts: job.maxAttempts,
            lastError: message,
            errorKind,
            failedAt: new Date(),
          },
          create: {
            id: job.id,
            companyId: job.companyId || null,
            workspaceId: job.workspaceId || null,
            type: job.type,
            payload: job.payload,
            attempt,
            maxAttempts: job.maxAttempts,
            lastError: message,
            errorKind,
          },
        });

        return updated;
      });

      return {
        ok: false,
        status: "dead",
        job: dead,
        error: message,
        errorKind,
      };
    }

    const delayMs = computeNextDelayMs({
      attempt,
      errorKind,
    });

    const retry = await prisma.job.update({
      where: { id: job.id },
      data: {
        status: "failed",
        attempt,
        lastError: message,
        errorKind,
        scheduledAt: new Date(Date.now() + delayMs),
      },
    });

    return {
      ok: false,
      status: "retry_scheduled",
      job: retry,
      error: message,
      errorKind,
      delayMs,
    };
  }
}

export async function jobTick({
  limit = 20,
}: {
  limit?: number;
} = {}) {
  const jobs = await prisma.job.findMany({
    where: {
      status: {
        in: ["pending", "failed"],
      },
      scheduledAt: {
        lte: new Date(),
      },
    },
    orderBy: {
      scheduledAt: "asc",
    },
    take: limit,
  });

  const results = [];

  for (const job of jobs) {
    results.push(await runJob(job));
  }

  return {
    ok: true,
    processed: results.length,
    results,
  };
}

export async function getReliabilityDashboard(companyId?: string | null) {
  const where = companyId ? { companyId } : {};

  const [jobs, deadLetters, logs] = await Promise.all([
    prisma.job.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      take: 100,
      include: {
        logs: {
          orderBy: { createdAt: "desc" },
          take: 5,
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
    }),
  ]);

  return {
    ok: true,
    companyId: companyId || null,
    jobs,
    deadLetters,
    logs,
    summary: {
      jobs: jobs.length,
      pending: jobs.filter((job) => job.status === "pending").length,
      running: jobs.filter((job) => job.status === "running").length,
      succeeded: jobs.filter((job) => job.status === "succeeded").length,
      failed: jobs.filter((job) => job.status === "failed").length,
      dead: jobs.filter((job) => job.status === "dead").length,
      deadLetters: deadLetters.length,
    },
  };
}
