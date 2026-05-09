import { Policy } from "@/lib/sugent/brain/policy";
import { AuditLogger } from "@/lib/sugent/core/auditLogger";

export type ExecutionJob = {
  projectId: string;
  buildId?: string;
  type: string;
  payload: any;
  actorId?: string;
};

export const ExecutionEngine = {
  async validateOnly(job: ExecutionJob) {
    await Policy.checkPublish(job.type, job.payload, {
      projectId: job.projectId,
      userId: job.actorId,
    });

    return { ok: true };
  },

  async run(job: ExecutionJob, runner: (job: ExecutionJob) => Promise<any>) {
    await Policy.checkPublish(job.type, job.payload, {
      projectId: job.projectId,
      userId: job.actorId,
    });

    const result = await runner(job);

    await AuditLogger.log({
      projectId: job.projectId,
      actorType: "system",
      actorId: "execution_engine",
      action: "PUBLISHED",
      metadata: {
        buildId: job.buildId,
        type: job.type,
        result,
      },
    });

    return result;
  },
};
