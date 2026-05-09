import { prisma } from "@/lib/db";
import { runAgentBrowserTool } from "@/lib/sugent/browser/agentBrowserTool";
import { runAgentSecureExecutionTool } from "@/lib/sugent/secureExecution/agentTool";
import { runAgentCloudTool } from "@/lib/sugent/cloud/agentCloudTool";
import { writeCompanyMemory } from "@/lib/sugent/company/memory";

function messageFromInput(input: any) {
  return String(input?.message || input?.prompt || input?.goal || "");
}

export async function runWorker({
  taskId,
  projectId,
  sessionId,
  runtimeSessionId,
}: {
  taskId: string;
  projectId: string;
  sessionId: string;
  runtimeSessionId: string;
}) {
  const task = await prisma.companyTask.findUnique({
    where: { id: taskId },
    include: {
      worker: true,
      company: true,
    },
  });

  if (!task) {
    return {
      ok: false,
      error: `Task not found: ${taskId}`,
    };
  }

  await prisma.companyTask.update({
    where: { id: task.id },
    data: { status: "running" },
  });

  const message = messageFromInput(task.input);

  try {
    let result: any;

    if (task.type === "research" || task.type === "company_research") {
      result = await runAgentBrowserTool({
        projectId,
        sessionId,
        runtimeSessionId,
        message,
      });
    } else if (task.type === "analysis" || task.type === "company_analysis") {
      result = await runAgentSecureExecutionTool({
        projectId,
        sessionId,
        runtimeSessionId,
        message,
      });
    } else if (
      task.type === "ops" ||
      task.type === "pipeline" ||
      task.type === "cloud" ||
      task.type === "company_pipeline"
    ) {
      result = await runAgentCloudTool({
        projectId,
        sessionId,
        runtimeSessionId,
        message,
      });
    } else {
      result = {
        ok: true,
        intent: "company_task_custom",
        reply: `Custom task recorded: ${message || task.type}`,
        actions: [{ type: "company_task_custom", taskId: task.id }],
      };
    }

    const updated = await prisma.companyTask.update({
      where: { id: task.id },
      data: {
        status: result?.ok === false ? "error" : "success",
        output: result,
        errorMessage: result?.ok === false ? result?.error || result?.reply || "Task failed." : null,
      },
    });

    if (task.workerId) {
      await prisma.worker.update({
        where: { id: task.workerId },
        data: { status: "idle" },
      });
    }

    await writeCompanyMemory({
      companyId: task.companyId,
      kind: result?.ok === false ? "todo" : "fact",
      content: `Task ${task.type} completed with status ${updated.status}.`,
      tags: {
        source: "worker",
        taskId: task.id,
        workerId: task.workerId,
        runtimeSessionId,
      },
    });

    return {
      ok: updated.status === "success",
      task: updated,
      worker: task.worker,
      result,
    };
  } catch (error: any) {
    const updated = await prisma.companyTask.update({
      where: { id: task.id },
      data: {
        status: "error",
        errorMessage: error?.message || "Worker task failed.",
      },
    });

    if (task.workerId) {
      await prisma.worker.update({
        where: { id: task.workerId },
        data: { status: "idle" },
      });
    }

    return {
      ok: false,
      task: updated,
      worker: task.worker,
      error: updated.errorMessage,
    };
  }
}
