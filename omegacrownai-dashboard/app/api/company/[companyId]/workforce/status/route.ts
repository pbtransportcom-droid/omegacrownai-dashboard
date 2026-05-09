import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;

  const [workers, tasks] = await Promise.all([
    prisma.worker.findMany({
      where: { companyId },
      orderBy: { createdAt: "asc" },
    }),
    prisma.companyTask.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { worker: true },
    }),
  ]);

  return NextResponse.json({
    ok: true,
    companyId,
    workers,
    tasks,
    summary: {
      workers: workers.length,
      idle: workers.filter((worker) => worker.status === "idle").length,
      busy: workers.filter((worker) => worker.status === "busy").length,
      pending: tasks.filter((task) => task.status === "pending").length,
      running: tasks.filter((task) => task.status === "running").length,
      success: tasks.filter((task) => task.status === "success").length,
      error: tasks.filter((task) => task.status === "error").length,
    },
  });
}
