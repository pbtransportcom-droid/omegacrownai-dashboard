import { prisma } from "@/lib/db";
import { RuntimeHub } from "@/lib/sugent/runtime/hub";
import { assignWorker, preferredRoleForTask } from "./assignWorker";
import { runWorker } from "./runWorker";

export async function runNextCompanyTask({
  companyId,
  sessionId,
  runtimeSessionId,
}: {
  companyId: string;
  sessionId?: string | null;
  runtimeSessionId?: string | null;
}) {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
  });

  if (!company) {
    return {
      ok: false,
      processed: false,
      error: "Company not found.",
    };
  }

  const task = await prisma.companyTask.findFirst({
    where: {
      companyId,
      status: "pending",
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  if (!task) {
    return {
      ok: true,
      processed: false,
      message: "No pending company tasks.",
    };
  }

  let worker = null;

  if (!task.workerId) {
    worker = await assignWorker({
      companyId,
      taskId: task.id,
      role: preferredRoleForTask(task.type),
    });
  } else {
    worker = await prisma.worker.findUnique({
      where: { id: task.workerId },
    });
  }

  if (!worker) {
    return {
      ok: false,
      processed: false,
      task,
      error: "No idle worker available for this task.",
    };
  }

  const runtimeId = String(runtimeSessionId || sessionId || `company-workforce-${companyId}`);

  RuntimeHub.emit(runtimeId, {
    type: "tool_call",
    tool: "company_worker",
    args: {
      companyId,
      taskId: task.id,
      workerId: worker.id,
      workerName: worker.name,
      workerRole: worker.role,
      taskType: task.type,
      status: "running",
    },
  });

  const result = await runWorker({
    taskId: task.id,
    projectId: company.projectId,
    sessionId: String(sessionId || `task-${task.id}`),
    runtimeSessionId: runtimeId,
  });

  RuntimeHub.emit(runtimeId, {
    type: "tool_result",
    tool: "company_worker",
    result: {
      companyId,
      taskId: task.id,
      workerId: worker.id,
      workerName: worker.name,
      workerRole: worker.role,
      taskType: task.type,
      status: result.ok ? "success" : "error",
      result,
    },
  });

  return {
    ok: result.ok,
    processed: true,
    taskId: task.id,
    worker,
    result,
  };
}

export async function runPendingCompanyTasks({
  companyId,
  sessionId,
  runtimeSessionId,
  limit = 10,
}: {
  companyId: string;
  sessionId?: string | null;
  runtimeSessionId?: string | null;
  limit?: number;
}) {
  const results = [];
  const safeLimit = Math.max(1, Math.min(Number(limit || 10), 25));

  for (let i = 0; i < safeLimit; i++) {
    const result = await runNextCompanyTask({
      companyId,
      sessionId,
      runtimeSessionId,
    });

    results.push(result);

    if (!result.processed) break;
    if (!result.ok) break;
  }

  return {
    ok: results.every((item) => item.ok !== false),
    processed: results.filter((item) => item.processed).length,
    results,
  };
}
