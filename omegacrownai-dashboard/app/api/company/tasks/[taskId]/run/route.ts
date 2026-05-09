import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { runWorker } from "@/lib/sugent/workforce/runWorker";
import { assignWorker, preferredRoleForTask } from "@/lib/sugent/workforce/assignWorker";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await params;
  const body = await req.json().catch(() => ({}));

  const task = await prisma.companyTask.findUnique({
    where: { id: taskId },
    include: { company: true, worker: true },
  });

  if (!task) {
    return NextResponse.json(
      {
        ok: false,
        error: "Task not found.",
      },
      { status: 404 }
    );
  }

  if (!task.workerId) {
    await assignWorker({
      companyId: task.companyId,
      taskId: task.id,
      role: preferredRoleForTask(task.type),
    });
  }

  const result = await runWorker({
    taskId: task.id,
    projectId: task.company.projectId,
    sessionId: String(body.sessionId || `task-${task.id}`),
    runtimeSessionId: String(body.runtimeSessionId || body.sessionId || `task-runtime-${task.id}`),
  });

  return NextResponse.json(result, {
    status: result.ok ? 200 : 400,
  });
}
