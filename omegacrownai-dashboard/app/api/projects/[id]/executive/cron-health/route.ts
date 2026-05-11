import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const [schedules, latestLogs] = await Promise.all([
    prisma.executiveSchedule.findMany({
      where: { projectId: id },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.executiveRunLog.findMany({
      where: { projectId: id },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const latest = latestLogs[0] || null;
  const activeSchedules = schedules.filter((schedule) => schedule.status === "active");

  return NextResponse.json({
    ok: true,
    projectId: id,
    production: process.env.NODE_ENV === "production",
    cronEnabled: process.env.OMEGA_EXECUTIVE_CRON_ENABLED === "true",
    dashboardUrl: process.env.OMEGA_DASHBOARD_URL || null,
    schedules,
    latestLogs,
    health: {
      schedules: schedules.length,
      activeSchedules: activeSchedules.length,
      latestRunAt: latest?.createdAt || null,
      latestStatus: latest?.status || null,
      latestType: latest?.type || null,
      nextRunAt: activeSchedules[0]?.nextRunAt || null,
      healthy:
        process.env.NODE_ENV === "production" &&
        process.env.OMEGA_EXECUTIVE_CRON_ENABLED === "true" &&
        activeSchedules.length > 0 &&
        !!latest,
    },
  });
}
