import { prisma } from "@/lib/db";
import { getAutomationWorkflowView } from "@/lib/automation-workflows/automation-workflow-engine";

export type AutomationExecutionStatus =
  | "executed"
  | "no_workflow_found"
  | "execution_not_available"
  | "error";

export type AutomationExecutionResult = {
  ok: boolean;
  phase: "v8.7 Phase 107";
  status: AutomationExecutionStatus;
  workflowId?: string;
  buildId?: string;
  projectId?: string | null;
  runId?: string;
  summary: string;
  notes: string[];
};

function makeRunId() {
  return `automation_run_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function runLatestAutomationWorkflow({
  projectId,
}: {
  projectId?: string | null;
} = {}): Promise<AutomationExecutionResult> {
  try {
    const workflow = await getAutomationWorkflowView({
      projectId,
      allowDemoFallback: false,
    });

    if (workflow.status === "empty" || !workflow.nodes.length) {
      return {
        ok: false,
        phase: "v8.7 Phase 107",
        status: "no_workflow_found",
        summary: "No saved automation workflow was found to execute.",
        notes: [
          "Create or save an automation workflow first.",
          "Demo fallback is intentionally not executable.",
        ],
      };
    }

    if (workflow.status === "error") {
      return {
        ok: false,
        phase: "v8.7 Phase 107",
        status: "error",
        workflowId: workflow.id,
        summary: "Automation workflow could not be loaded.",
        notes: workflow.notes,
      };
    }

    const latestBuild = await prisma.projectBuild.findFirst({
      where: {
        domain: "automation",
        ...(projectId ? { projectId } : {}),
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    if (!latestBuild) {
      return {
        ok: false,
        phase: "v8.7 Phase 107",
        status: "no_workflow_found",
        workflowId: workflow.id,
        summary: "No automation build record was found for execution.",
        notes: [
          "Workflow API found no executable automation build.",
          "Create a project automation build first.",
        ],
      };
    }

    const runId = makeRunId();

    return {
      ok: true,
      phase: "v8.7 Phase 107",
      status: "executed",
      workflowId: workflow.id,
      buildId: latestBuild.id,
      projectId: latestBuild.projectId,
      runId,
      summary:
        "Automation run request reached the backend and resolved the latest database-backed automation build.",
      notes: [
        `Automation build selected: ${latestBuild.id}`,
        `Run request id: ${runId}`,
        "This confirms backend run-request wiring.",
        "This does not yet prove external actions executed.",
        "Persistent execution/event logging should be added after confirming the correct Prisma execution model.",
        "External actions still depend on runtime workers, provider credentials, and project execution policy.",
      ],
    };
  } catch (error: any) {
    return {
      ok: false,
      phase: "v8.7 Phase 107",
      status: "error",
      summary: "Automation execution failed.",
      notes: [error?.message || "Unknown automation execution error."],
    };
  }
}
