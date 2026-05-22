import { emitRuntimeEvent } from "@/lib/runtime-event-bus/unifiedRuntimeEventBus";

export const AUTONOMOUS_WORKFLOW_STATE_MACHINE_VERSION =
  "v28.0 Phase 310 — Autonomous Workflow State Machine";

export type WorkflowStepStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "recovered";

export type WorkflowExecutionStatus =
  | "created"
  | "running"
  | "completed"
  | "failed"
  | "recovering";

export type StatefulWorkflowStep = {
  id: string;
  title: string;
  capability: string;
  status: WorkflowStepStatus;
  startedAt?: string;
  completedAt?: string;
  error?: string;
};

export type StatefulWorkflowExecution = {
  executionId: string;
  workflowId: string;
  status: WorkflowExecutionStatus;
  currentStepIndex: number;
  createdAt: string;
  updatedAt: string;
  steps: StatefulWorkflowStep[];
};

const workflowExecutions: StatefulWorkflowExecution[] = [];

export function getWorkflowStateMachineStatus() {
  return {
    ok: true,
    version: AUTONOMOUS_WORKFLOW_STATE_MACHINE_VERSION,
    purpose:
      "Provide durable-style autonomous workflow execution state, step transitions, recovery previews, replay readiness, and runtime orchestration continuity.",
    executions: workflowExecutions.length,
    capabilities: [
      "Workflow execution state tracking",
      "Step lifecycle transitions",
      "Recovery-aware execution state",
      "Replay-ready workflow records",
      "Cross-agent synchronization foundation",
      "Runtime event emission",
    ],
  };
}

export function createWorkflowExecution(input?: {
  workflowId?: string;
  steps?: Partial<StatefulWorkflowStep>[];
}) {
  const execution: StatefulWorkflowExecution = {
    executionId: `workflow_execution_${Date.now()}`,
    workflowId: input?.workflowId || "default-sovereign-workflow",
    status: "created",
    currentStepIndex: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    steps:
      input?.steps?.map((step, index) => ({
        id: step.id || `step_${index + 1}`,
        title: step.title || `Workflow step ${index + 1}`,
        capability: step.capability || "supervision",
        status: "pending",
      })) || [
        {
          id: "step_1_plan",
          title: "Plan autonomous execution path",
          capability: "planning",
          status: "pending",
        },
        {
          id: "step_2_dispatch",
          title: "Dispatch coordinated runtime task",
          capability: "supervision",
          status: "pending",
        },
        {
          id: "step_3_verify",
          title: "Verify execution outcome",
          capability: "recovery",
          status: "pending",
        },
      ],
  };

  workflowExecutions.push(execution);

  emitRuntimeEvent({
    type: "WorkflowExecutionCreated",
    source: "workflow-state-machine",
    priority: "high",
    payload: {
      executionId: execution.executionId,
      workflowId: execution.workflowId,
      steps: execution.steps.length,
    },
  });

  return {
    ok: true,
    version: AUTONOMOUS_WORKFLOW_STATE_MACHINE_VERSION,
    execution,
  };
}

export function advanceWorkflowStep(executionId?: string) {
  const execution =
    workflowExecutions.find((item) => item.executionId === executionId) ||
    workflowExecutions[workflowExecutions.length - 1];

  if (!execution) {
    return {
      ok: false,
      reason: "WORKFLOW_EXECUTION_NOT_FOUND",
    };
  }

  const step = execution.steps[execution.currentStepIndex];

  if (!step) {
    execution.status = "completed";
    execution.updatedAt = new Date().toISOString();

    return {
      ok: true,
      version: AUTONOMOUS_WORKFLOW_STATE_MACHINE_VERSION,
      execution,
      message: "Workflow execution already completed.",
    };
  }

  execution.status = "running";
  step.status = "running";
  step.startedAt = new Date().toISOString();

  emitRuntimeEvent({
    type: "WorkflowStepStarted",
    source: "workflow-state-machine",
    priority: "high",
    payload: {
      executionId: execution.executionId,
      stepId: step.id,
      capability: step.capability,
    },
  });

  step.status = "completed";
  step.completedAt = new Date().toISOString();

  emitRuntimeEvent({
    type: "WorkflowStepCompleted",
    source: "workflow-state-machine",
    priority: "high",
    payload: {
      executionId: execution.executionId,
      stepId: step.id,
      capability: step.capability,
    },
  });

  execution.currentStepIndex += 1;
  execution.updatedAt = new Date().toISOString();

  if (execution.currentStepIndex >= execution.steps.length) {
    execution.status = "completed";

    emitRuntimeEvent({
      type: "WorkflowExecutionCompleted",
      source: "workflow-state-machine",
      priority: "critical",
      payload: {
        executionId: execution.executionId,
        workflowId: execution.workflowId,
      },
    });
  }

  return {
    ok: true,
    version: AUTONOMOUS_WORKFLOW_STATE_MACHINE_VERSION,
    execution,
  };
}

export function recoverWorkflowExecution(executionId?: string) {
  const execution =
    workflowExecutions.find((item) => item.executionId === executionId) ||
    workflowExecutions.find(
      (item) => item.status === "failed" || item.status === "recovering",
    ) ||
    workflowExecutions[workflowExecutions.length - 1];

  if (!execution) {
    return {
      ok: false,
      reason: "WORKFLOW_EXECUTION_NOT_FOUND",
    };
  }

  execution.status = "recovering";
  execution.updatedAt = new Date().toISOString();

  const failedSteps = execution.steps.filter(
    (step) => step.status === "failed",
  );

  for (const step of failedSteps) {
    step.status = "recovered";
    step.error = undefined;
  }

  emitRuntimeEvent({
    type: "WorkflowExecutionRecovered",
    source: "workflow-state-machine",
    priority: "critical",
    payload: {
      executionId: execution.executionId,
      recoveredSteps: failedSteps.length,
    },
  });

  execution.status =
    execution.currentStepIndex >= execution.steps.length
      ? "completed"
      : "running";

  return {
    ok: true,
    version: AUTONOMOUS_WORKFLOW_STATE_MACHINE_VERSION,
    execution,
    recoveredSteps: failedSteps.length,
  };
}
