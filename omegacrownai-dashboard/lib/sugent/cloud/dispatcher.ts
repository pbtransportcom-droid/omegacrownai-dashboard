import { prisma } from "@/lib/db";
import { RuntimeHub } from "@/lib/sugent/runtime/hub";
import { CloudQueue } from "./queue";
import { AuditLogger } from "@/lib/sugent/core/auditLogger";

export async function dispatchCloudJob({
  projectId,
  buildId,
  type,
  payload,
}: {
  projectId: string;
  buildId?: string | null;
  type: string;
  payload: any;
}) {
  const job = await prisma.cloudJob.create({
    data: {
      projectId,
      buildId: buildId || null,
      type,
      status: "queued",
      payload: payload || {},
    },
  });

  CloudQueue.enqueue({
    id: job.id,
    projectId,
    buildId,
    type,
    payload,
  });

  await AuditLogger.log({
    projectId,
    actorType: "system",
    actorId: "sugent_cloud",
    action: "PLAN_CREATED",
    metadata: {
      cloudJobId: job.id,
      buildId,
      type,
      status: "queued",
    },
  });

  return job;
}
