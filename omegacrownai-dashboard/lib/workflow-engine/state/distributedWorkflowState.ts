export const DISTRIBUTED_WORKFLOW_STATE_VERSION =
  "v27.7 Phase 297 — Persistent Distributed Workflow State";

type WorkflowExecutionRecord = {
  executionId: string;
  workflowId: string;
  status: "running" | "completed" | "failed";
  startedAt: string;
  completedAt?: string;
  steps: {
    stepId: string;
    status: string;
  }[];
};

const executionStore: WorkflowExecutionRecord[] = [];

export function createWorkflowExecution(
  execution: WorkflowExecutionRecord,
) {
  executionStore.push(execution);

  return execution;
}

export function updateWorkflowExecution(
  executionId: string,
  updater: Partial<WorkflowExecutionRecord>,
) {
  const existing = executionStore.find(
    (item) => item.executionId === executionId,
  );

  if (!existing) {
    return null;
  }

  Object.assign(existing, updater);

  return existing;
}

export function getWorkflowExecutions() {
  return {
    ok: true,
    version: DISTRIBUTED_WORKFLOW_STATE_VERSION,
    executions: executionStore,
  };
}

export function recoverIncompleteExecutions() {
  const recoverable = executionStore.filter(
    (item) => item.status === "running",
  );

  return {
    ok: true,
    version: DISTRIBUTED_WORKFLOW_STATE_VERSION,
    recovered: recoverable.length,
    executions: recoverable,
  };
}
