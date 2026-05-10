import { prisma } from "@/lib/db";
import { getDailyExecutiveReport, runExecutiveLoop } from "./loop";
import { getExecutiveCommandCenter } from "./commandCenter";

function nextDailyRun(hour = 9) {
  const next = new Date();
  next.setHours(hour, 0, 0, 0);

  if (next.getTime() <= Date.now()) {
    next.setDate(next.getDate() + 1);
  }

  return next;
}

export async function ensureExecutiveSchedule({
  projectId,
  companyId,
  name = "Daily Executive Health Report",
  hour = 9,
  timezone = "America/Chicago",
}: {
  projectId: string;
  companyId?: string | null;
  name?: string;
  hour?: number;
  timezone?: string;
}) {
  const existing = await prisma.executiveSchedule.findFirst({
    where: {
      projectId,
      name,
    },
    orderBy: { createdAt: "asc" },
  });

  if (existing) return existing;

  return prisma.executiveSchedule.create({
    data: {
      projectId,
      companyId: companyId || null,
      name,
      frequency: "daily",
      hour,
      timezone,
      status: "active",
      nextRunAt: nextDailyRun(hour),
      metadata: {
        source: "executive_scheduler",
      },
    },
  });
}

export async function createExecutiveRunLog({
  projectId,
  companyId,
  scheduleId,
  type,
  status,
  summary,
  report,
  error,
}: {
  projectId: string;
  companyId?: string | null;
  scheduleId?: string | null;
  type: string;
  status: string;
  summary?: any;
  report?: any;
  error?: string | null;
}) {
  return prisma.executiveRunLog.create({
    data: {
      projectId,
      companyId: companyId || null,
      scheduleId: scheduleId || null,
      type,
      status,
      summary: summary || {},
      report: report || {},
      error: error || null,
      completedAt: new Date(),
    },
  });
}

export async function generateAndStoreDailyReport({
  projectId,
  scheduleId,
}: {
  projectId: string;
  scheduleId?: string | null;
}) {
  const report = await getDailyExecutiveReport(projectId);
  const companyId = (report as any).companyId || null;

  const log = await createExecutiveRunLog({
    projectId,
    companyId,
    scheduleId,
    type: "daily_report",
    status: report.ok ? "success" : "error",
    summary: (report as any).summary || {},
    report,
    error: report.ok ? null : String((report as any).error || "Daily report failed."),
  });

  if (scheduleId) {
    const schedule = await prisma.executiveSchedule.findUnique({
      where: { id: scheduleId },
    });

    if (schedule) {
      await prisma.executiveSchedule.update({
        where: { id: scheduleId },
        data: {
          lastRunAt: new Date(),
          nextRunAt: nextDailyRun(schedule.hour),
        },
      });
    }
  }

  return {
    ok: report.ok,
    report,
    log,
  };
}

export async function runScheduledExecutiveLoop({
  projectId,
  scheduleId,
  sessionId,
  runtimeSessionId,
  limit = 10,
}: {
  projectId: string;
  scheduleId?: string | null;
  sessionId?: string | null;
  runtimeSessionId?: string | null;
  limit?: number;
}) {
  const result = await runExecutiveLoop({
    projectId,
    sessionId,
    runtimeSessionId,
    limit,
  });

  const companyId =
    (result as any).actionPlan?.companyId ||
    (result as any).refreshed?.company?.id ||
    null;

  const log = await createExecutiveRunLog({
    projectId,
    companyId,
    scheduleId,
    type: "executive_loop",
    status: result.ok ? "success" : "error",
    summary: (result as any).refreshed?.summary || {},
    report: result,
    error: result.ok ? null : String((result as any).error || "Executive loop failed."),
  });

  if (scheduleId) {
    const schedule = await prisma.executiveSchedule.findUnique({
      where: { id: scheduleId },
    });

    if (schedule) {
      await prisma.executiveSchedule.update({
        where: { id: scheduleId },
        data: {
          lastRunAt: new Date(),
          nextRunAt: nextDailyRun(schedule.hour),
        },
      });
    }
  }

  return {
    ok: result.ok,
    result,
    log,
  };
}

export async function getExecutiveHistory(projectId: string) {
  const command = await getExecutiveCommandCenter(projectId);

  const [schedules, logs] = await Promise.all([
    prisma.executiveSchedule.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        runs: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    }),
    prisma.executiveRunLog.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        schedule: true,
      },
    }),
  ]);

  return {
    ok: true,
    projectId,
    command,
    schedules,
    logs,
    summary: {
      schedules: schedules.length,
      activeSchedules: schedules.filter((schedule) => schedule.status === "active").length,
      logs: logs.length,
      successfulRuns: logs.filter((log) => log.status === "success").length,
      failedRuns: logs.filter((log) => log.status === "error").length,
      dailyReports: logs.filter((log) => log.type === "daily_report").length,
      executiveLoops: logs.filter((log) => log.type === "executive_loop").length,
    },
  };
}
