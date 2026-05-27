import { Queue, Worker } from "bullmq";
import Redis from "ioredis";
export const connection = new Redis(process.env.REDIS_URL || "redis://127.0.0.1:6379", { maxRetriesPerRequest: null });
export const runtimeQueue = new Queue("runtime-execution", {
    connection,
});
export function startRuntimeWorker(handler) {
    return new Worker("runtime-execution", async (job) => handler(job.data), { connection });
}
