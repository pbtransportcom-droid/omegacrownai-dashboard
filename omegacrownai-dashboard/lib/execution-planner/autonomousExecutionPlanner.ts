import { dispatchTask } from "@/lib/task-routing/agentTaskRouter";
import { emitRuntimeEvent } from "@/lib/runtime-event-bus/unifiedRuntimeEventBus";
import { getStrategicObjectives } from "@/lib/strategy-engine/autonomousStrategyEngine";

export const AUTONOMOUS_EXECUTION_PLANNER_VERSION =
  "v27.9 Phase 309 — Autonomous Execution Planner";

export type ExecutionPlanStep = {
  id: string;
  title: string;
  department: string;
  capability: string;
  status: "pending" | "dispatched" | "completed";
};

export type ExecutionPlan = {
  planId: string;
  objectiveId: string;
  objectiveTitle: string;
  priority: string;
  steps: ExecutionPlanStep[];
};

const executionPlans: ExecutionPlan[] = [];

export function getExecutionPlannerStatus() {
  return {
    ok: true,
    version: AUTONOMOUS_EXECUTION_PLANNER_VERSION,
    purpose:
      "Convert strategic objectives into executable multi-agent action chains with task routing, event emission, review, and recovery-aware orchestration.",
    activePlans: executionPlans.length,
    capabilities: [
      "Objective-to-task decomposition",
      "Department assignment",
      "Capability-based task dispatch",
      "Runtime event emission",
      "Execution progress review",
      "Recovery-aware planning",
      "Strategy-to-workflow bridge",
    ],
  };
}

export function generateExecutionPlan(objectiveId?: string) {
  const objectives = getStrategicObjectives().objectives;
  const objective =
    objectives.find((item) => item.id === objectiveId) || objectives[0];

  if (!objective) {
    return {
      ok: false,
      reason: "NO_STRATEGIC_OBJECTIVE_AVAILABLE",
    };
  }

  const plan: ExecutionPlan = {
    planId: `execution_plan_${Date.now()}`,
    objectiveId: objective.id,
    objectiveTitle: objective.title,
    priority: objective.priority,
    steps: [
      {
        id: "step_1_analyze",
        title: "Analyze strategic objective requirements",
        department: "executive",
        capability: "planning",
        status: "pending",
      },
      {
        id: "step_2_coordinate",
        title: "Coordinate department execution path",
        department: objective.department,
        capability:
          objective.department === "growth"
            ? "campaigns"
            : "supervision",
        status: "pending",
      },
      {
        id: "step_3_review",
        title: "Review progress and emit completion signal",
        department: "runtime",
        capability: "supervision",
        status: "pending",
      },
    ],
  };

  executionPlans.push(plan);

  emitRuntimeEvent({
    type: "ExecutionPlanGenerated",
    source: "execution-planner",
    priority: "high",
    payload: {
      planId: plan.planId,
      objectiveId: plan.objectiveId,
      objectiveTitle: plan.objectiveTitle,
    },
  });

  return {
    ok: true,
    version: AUTONOMOUS_EXECUTION_PLANNER_VERSION,
    plan,
  };
}

export function executeStrategicPlan(planId?: string) {
  const plan =
    executionPlans.find((item) => item.planId === planId) ||
    executionPlans[executionPlans.length - 1];

  if (!plan) {
    return {
      ok: false,
      reason: "EXECUTION_PLAN_NOT_FOUND",
    };
  }

  const dispatches = plan.steps.map((step) => {
    step.status = "dispatched";

    const dispatch = dispatchTask({
      taskType: step.capability,
      priority: plan.priority === "critical" ? "critical" : "high",
      payload: {
        planId: plan.planId,
        objectiveId: plan.objectiveId,
        step,
      },
    });

    return {
      step,
      assignedTo: dispatch.assignedTo,
      event: dispatch.event,
    };
  });

  emitRuntimeEvent({
    type: "ExecutionPlanDispatched",
    source: "execution-planner",
    priority: plan.priority === "critical" ? "critical" : "high",
    payload: {
      planId: plan.planId,
      objectiveId: plan.objectiveId,
      dispatchedSteps: dispatches.length,
    },
  });

  return {
    ok: true,
    version: AUTONOMOUS_EXECUTION_PLANNER_VERSION,
    planId: plan.planId,
    dispatches,
  };
}

export function reviewExecutionProgress() {
  return {
    ok: true,
    version: AUTONOMOUS_EXECUTION_PLANNER_VERSION,
    plans: executionPlans,
    summary: {
      totalPlans: executionPlans.length,
      pendingSteps: executionPlans.flatMap((plan) =>
        plan.steps.filter((step) => step.status === "pending"),
      ).length,
      dispatchedSteps: executionPlans.flatMap((plan) =>
        plan.steps.filter((step) => step.status === "dispatched"),
      ).length,
      completedSteps: executionPlans.flatMap((plan) =>
        plan.steps.filter((step) => step.status === "completed"),
      ).length,
    },
  };
}
