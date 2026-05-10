import { prisma } from "@/lib/db";
import {
  generateAndStoreDailyReport,
  runScheduledExecutiveLoop,
} from "@/lib/sugent/executive/scheduler";

export function isCronEnabled() {
  return process.env.OMEGA_EXECUTIVE_CRON_ENABLED === "true";
}

export function isProductionCronAllowed() {
  return process.env.NODE_ENV === "production" && isCronEnabled();
}

export async function runDueExecutiveSchedules({
  force = false,
  runtimeSessionId,
}: {
  force?: boolean;
  runtimeSessionId?: string | null;
}) {
  if (!force && !isProductionCronAllowed()) {
    return {
      ok: true,
      skipped: true,
      reason: "Executive cron is disabled or not running in production.",
      production: process.env.NODE_ENV === "production",
      cronEnabled: isCronEnabled(),
      processed: 0,
      results: [],
    };
  }

  const now = new Date();

  const schedules = await prisma.executiveSchedule.findMany({
    where: {
      status: "active",
      OR: force
        ? undefined
        : [
            { nextRunAt: null },
            { nextRunAt: { lte: now } },
          ],
    },
    orderBy: {
      nextRunAt: "asc",
    },
    take: 25,
  });

  const results = [];

  for (const schedule of schedules) {
    const reportResult = await generateAndStoreDailyReport({
      projectId: schedule.projectId,
      scheduleId: schedule.id,
    });

    const shouldRunLoop =
      schedule.metadata &&
      typeof schedule.metadata === "object" &&
      !Array.isArray(schedule.metadata) &&
      (schedule.metadata as any).runExecutiveLoop === true;

    let loopResult = null;

    if (shouldRunLoop) {
      loopResult = await runScheduledExecutiveLoop({
        projectId: schedule.projectId,
        scheduleId: schedule.id,
        sessionId: runtimeSessionId || `executive-cron-${schedule.projectId}`,
        runtimeSessionId: runtimeSessionId || `executive-cron-${schedule.projectId}`,
        limit: Number((schedule.metadata as any).limit || 10),
      });
    }

    results.push({
      scheduleId: schedule.id,
      projectId: schedule.projectId,
      report: reportResult,
      loop: loopResult,
    });
  }

  return {
    ok: true,
    skipped: false,
    processed: results.length,
    results,
  };
}
