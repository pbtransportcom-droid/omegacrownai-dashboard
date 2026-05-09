import { prisma } from "@/lib/db";
import { ExecutionEngine } from "@/lib/sugent/execution/engine";
import { CloudQueue } from "./queue";
import { runnerForType } from "./runners";
import { AuditLogger } from "@/lib/sugent/core/auditLogger";

export async function runOneCloudJob() {
  const queued = CloudQueue.dequeue();

  if (!queued) {
    return {
      ok: true,
      processed: false,
      message: "No queued in-memory job.",
    };
  }

  const job = await prisma.cloudJob.update({
    where: { id: queued.id },
    data: { status: "running" },
  });

  try {
    const runner = runnerForType(job.type);

    const result = await ExecutionEngine.run(
      {
        projectId: job.projectId,
        buildId: job.buildId || undefined,
        type:
          job.type === "deploy_website"
            ? "publish_website"
            : job.type === "run_strategy"
              ? "publish_trading"
              : job.type === "run_automation"
                ? "publish_automation"
                : job.type,
        payload: job.payload,
        actorId: "sugent_cloud_worker",
      },
      async () =>
        runner({
          id: job.id,
          projectId: job.projectId,
          buildId: job.buildId,
          type: job.type,
          payload: job.payload,
        })
    );

    const updated = await prisma.cloudJob.update({
      where: { id: job.id },
      data: {
        status: "success",
        result,
      },
    });

    await AuditLogger.log({
      projectId: job.projectId,
      actorType: "system",
      actorId: "sugent_cloud_worker",
      action: "PUBLISHED",
      metadata: {
        cloudJobId: job.id,
        buildId: job.buildId,
        type: job.type,
        result,
      },
    });

    return {
      ok: true,
      processed: true,
      job: updated,
    };
  } catch (error: any) {
    const updated = await prisma.cloudJob.update({
      where: { id: job.id },
      data: {
        status: "error",
        result: {
          error: error?.message || String(error),
        },
      },
    });

    await AuditLogger.log({
      projectId: job.projectId,
      actorType: "system",
      actorId: "sugent_cloud_worker",
      action: "SAFETY_BLOCKED",
      metadata: {
        cloudJobId: job.id,
        buildId: job.buildId,
        type: job.type,
        error: error?.message || String(error),
      },
    });

    return {
      ok: false,
      processed: true,
      job: updated,
      error: error?.message || String(error),
    };
  }
}
