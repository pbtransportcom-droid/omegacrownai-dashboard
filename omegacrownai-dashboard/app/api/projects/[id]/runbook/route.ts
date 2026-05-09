import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const [logs, executions, events, builds] = await Promise.all([
    prisma.auditLog.findMany({
      where: { projectId: id },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.agentExecution.findMany({
      where: { projectId: id },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.sugentEvent.findMany({
      where: { projectId: id },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.projectBuild.findMany({
      where: { projectId: id },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        artifacts: true,
      },
    }),
  ]);

  return NextResponse.json({
    ok: true,
    logs,
    executions,
    events,
    builds,
  });
}
