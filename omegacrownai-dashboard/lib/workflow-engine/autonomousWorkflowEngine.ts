import { dispatchTask } from "@/lib/task-routing/agentTaskRouter";
import { emitRuntimeEvent } from "@/lib/runtime-event-bus/unifiedRuntimeEventBus";

export const AUTONOMOUS_WORKFLOW_ENGINE_VERSION =
  "v27.6 Phase 296 — Autonomous Multi-Agent Workflow Engine";

export type WorkflowStep = {
  id: string;
  title: string;
  assignedCapability: string;
  status: "pending" | "running" | "completed";
};

export type WorkflowDefinition = {
  workflowId: string;
  name: string;
  objective: string;
  steps: WorkflowStep[];
};

const workflowTemplates: WorkflowDefinition[] = [
  {
    workflowId: "launch-campaign",
    name: "Launch Campaign Workflow",
    objective: "Coordinate executive, marketing, and sales execution.",
    steps: [
      {
        id: "step-1",
        title: "Executive Strategic Planning",
        assignedCapability: "planning",
        status: "pending",
      },
      {
        id: "step-2",
        title: "Marketing Campaign Deployment",
        assignedCapability: "campaigns",
        status: "pending",
      },
      {
        id: "step-3",
        title: "Sales Funnel Activation",
        assignedCapability: "conversion",
        status: "pending",
      },
    ],
  },
];

export function getWorkflowEngineStatus() {
  return {
    ok: true,
    version: AUTONOMOUS_WORKFLOW_ENGINE_VERSION,
    workflowsAvailable: workflowTemplates.length,
    capabilities: [
      "Cross-agent orchestration",
      "Autonomous workflow routing",
      "Executive execution pipelines",
      "Distributed workflow state",
      "Multi-department coordination",
    ],
  };
}

export function getWorkflowTemplates() {
  return {
    ok: true,
    version: AUTONOMOUS_WORKFLOW_ENGINE_VERSION,
    templates: workflowTemplates,
  };
}

export async function runWorkflow(workflowId: string) {
  const workflow = workflowTemplates.find(
    (item) => item.workflowId === workflowId,
  );

  if (!workflow) {
    return {
      ok: false,
      reason: "WORKFLOW_NOT_FOUND",
    };
  }

  const executionLog = [];

  for (const step of workflow.steps) {
    step.status = "running";

    const routing = dispatchTask({
      taskType: step.assignedCapability,
      payload: {
        workflowId,
        workflowStep: step,
      },
      priority: "high",
    });

    emitRuntimeEvent({
      type: "WorkflowStepExecuted",
      source: "workflow-engine",
      target: routing.assignedTo.agentId,
      priority: "high",
      payload: {
        workflowId,
        workflowStepId: step.id,
      },
    });

    step.status = "completed";

    executionLog.push({
      step,
      assignedAgent: routing.assignedTo,
    });
  }

  return {
    ok: true,
    version: AUTONOMOUS_WORKFLOW_ENGINE_VERSION,
    workflowId,
    executionLog,
  };
}
