type QueuedJob = {
  id: string;
  projectId: string;
  buildId?: string | null;
  type: string;
  payload: any;
};

const queue: QueuedJob[] = [];

export const CloudQueue = {
  enqueue(job: QueuedJob) {
    queue.push(job);
    return job;
  },

  dequeue() {
    return queue.shift() || null;
  },

  size() {
    return queue.length;
  },

  list() {
    return [...queue];
  },
};
