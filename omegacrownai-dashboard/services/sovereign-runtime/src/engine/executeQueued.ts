import { runtimeQueue, startRuntimeWorker } from "../queues/runtimeQueue.js";
import { executeRun } from "./runtime.js";

export async function queueRunExecution(projectId: string, input: any) {
  await runtimeQueue.add("execute", { projectId, input });

  return {
    ok: true,
    queued: true,
    projectId,
  };
}

export function startExecutionWorker() {
  startRuntimeWorker(async ({ projectId, input }) => {
    return await executeRun(projectId, input);
  });
}
