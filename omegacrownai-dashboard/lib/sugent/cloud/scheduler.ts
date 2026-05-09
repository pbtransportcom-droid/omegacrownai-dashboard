import { prisma } from "@/lib/db";
import { dispatchCloudJob } from "./dispatcher";

export function nextRunFromInterval(intervalMinutes: number, from = new Date()) {
  const safeMinutes = Math.max(1, Math.min(Number(intervalMinutes || 60), 60 * 24 * 30));
  return new Date(from.getTime() + safeMinutes * 60 * 1000);
}

export async function createCloudSchedule({
  projectId,
  name,
  provider = "local",
  type = "generic",
  payload = {},
  intervalMinutes = 60,
  enabled = true,
}: {
  projectId: string;
  name: string;
  provider?: string;
  type?: string;
  payload?: any;
  intervalMinutes?: number;
  enabled?: boolean;
}) {
  return prisma.cloudSchedule.create({
    data: {
      projectId,
      name,
      provider,
      type,
      payload,
      intervalMinutes: Math.max(1, Number(intervalMinutes || 60)),
      enabled,
      nextRunAt: nextRunFromInterval(intervalMinutes),
    },
  });
}

export async function runDueCloudSchedules({
  projectId,
  limit = 10,
}: {
  projectId?: string | null;
  limit?: number;
} = {}) {
  const now = new Date();

  const schedules = await prisma.cloudSchedule.findMany({
    where: {
      enabled: true,
      nextRunAt: {
        lte: now,
      },
      ...(projectId ? { projectId } : {}),
    },
    orderBy: {
      nextRunAt: "asc",
    },
    take: Math.max(1, Math.min(limit, 50)),
  });

  const results = [];

  for (const schedule of schedules) {
    const job = await dispatchCloudJob({
      projectId: schedule.projectId,
      buildId: `schedule-${schedule.id}`,
      type: schedule.type,
      payload: {
        ...(schedule.payload as any),
        provider: schedule.provider,
        scheduled: true,
        scheduleId: schedule.id,
        scheduleName: schedule.name,
        runCount: schedule.runCount + 1,
      },
    });

    const updated = await prisma.cloudSchedule.update({
      where: { id: schedule.id },
      data: {
        lastRunAt: now,
        lastJobId: job.id,
        runCount: {
          increment: 1,
        },
        nextRunAt: nextRunFromInterval(schedule.intervalMinutes, now),
      },
    });

    results.push({
      schedule: updated,
      job,
    });
  }

  return {
    ok: true,
    processed: results.length,
    results,
  };
}

export async function toggleCloudSchedule({
  scheduleId,
  enabled,
}: {
  scheduleId: string;
  enabled: boolean;
}) {
  return prisma.cloudSchedule.update({
    where: { id: scheduleId },
    data: { enabled },
  });
}
