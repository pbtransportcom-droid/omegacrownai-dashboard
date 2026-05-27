import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";

export const connection = new IORedis(
  process.env.REDIS_URL || "redis://127.0.0.1:6379",
  { maxRetriesPerRequest: null }
);

export const runtimeQueue = new Queue("runtime-execution", {
  connection,
});

export function startRuntimeWorker(handler: (job: any) => Promise<any>) {
  return new Worker(
    "runtime-execution",
    async (job) => handler(job.data),
    { connection }
  );
}
