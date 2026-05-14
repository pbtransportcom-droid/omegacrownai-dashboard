import { prisma } from "@/lib/db";

export type AutomationWorkflowStatus =
  | "live_data"
  | "demo_fallback"
  | "empty"
  | "error";

export type AutomationWorkflowNode = {
  id: string;
  type: "trigger" | "action" | "condition" | "output";
  label: string;
  description: string;
};

export type AutomationWorkflowView = {
  id: string;
  name: string;
  status: AutomationWorkflowStatus;
  source: "database" | "demo";
  nodes: AutomationWorkflowNode[];
  notes: string[];
};

const demoWorkflow: AutomationWorkflowView = {
  id: "demo_automation_workflow",
  name: "Demo automation workflow",
  status: "demo_fallback",
  source: "demo",
  nodes: [
    {
      id: "trigger_new_request",
      type: "trigger",
      label: "New customer request",
      description: "Starts when a customer submits a new business request."
    },
    {
      id: "action_route_department",
      type: "action",
      label: "Route to department",
      description: "Routes the request to the best OmegaCrownAI department."
    },
    {
      id: "condition_needs_review",
      type: "condition",
      label: "Human review required?",
      description: "Checks whether the request requires owner approval."
    },
    {
      id: "output_summary",
      type: "output",
      label: "Generate summary",
      description: "Creates a clear task summary and next-action record."
    }
  ],
  notes: [
    "This is demo fallback data.",
    "Real workflow data should come from saved project builds, executions, or workflow records.",
    "Do not treat this demo workflow as proof that automation execution is fully wired."
  ]
};

function normalizeJsonArray(value: unknown): any[] {
  return Array.isArray(value) ? value : [];
}

function nodeFromBuild(build: any, index: number): AutomationWorkflowNode {
  return {
    id: build.id || `automation_build_${index + 1}`,
    type: index === 0 ? "trigger" : "action",
    label: build.label || build.name || `Automation build ${index + 1}`,
    description:
      build.description ||
      build.prompt ||
      build.status ||
      "Saved automation build record."
  };
}

export async function getAutomationWorkflowView({
  projectId,
  allowDemoFallback = true
}: {
  projectId?: string | null;
  allowDemoFallback?: boolean;
} = {}): Promise<AutomationWorkflowView> {
  try {
    const where: any = {
      domain: "automation"
    };

    if (projectId) {
      where.projectId = projectId;
    }

    const builds = await prisma.projectBuild.findMany({
      where,
      orderBy: {
        updatedAt: "desc"
      },
      take: 12
    });

    if (builds.length) {
      return {
        id: projectId ? `automation_${projectId}` : "automation_latest",
        name: projectId ? "Project automation workflow" : "Latest automation workflows",
        status: "live_data",
        source: "database",
        nodes: builds.map(nodeFromBuild),
        notes: [
          "Loaded from database project build records.",
          "Execution capability still depends on connected runtime APIs and project execution policy."
        ]
      };
    }

    if (allowDemoFallback) {
      return demoWorkflow;
    }

    return {
      id: "automation_empty",
      name: "No automation workflow found",
      status: "empty",
      source: "database",
      nodes: [],
      notes: [
        "No saved automation workflow records were found.",
        "Create or save an automation workflow before claiming automation is live."
      ]
    };
  } catch (error: any) {
    return {
      id: "automation_error",
      name: "Automation workflow unavailable",
      status: "error",
      source: "database",
      nodes: [],
      notes: [
        error?.message || "Automation workflow query failed.",
        "Check Prisma schema/model names if projectBuild is unavailable."
      ]
    };
  }
}

export function getDemoAutomationWorkflow() {
  return demoWorkflow;
}
