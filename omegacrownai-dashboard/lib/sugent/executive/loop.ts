import { RuntimeHub } from "@/lib/sugent/runtime/hub";
import { getExecutiveCommandCenter } from "./commandCenter";
import { createDepartmentTask } from "@/lib/sugent/company/departments";
import { runPendingCompanyTasks } from "@/lib/sugent/workforce/loop";

function departmentForArea(area: string) {
  const normalized = String(area || "").toLowerCase();

  if (normalized.includes("marketing")) return "marketing";
  if (normalized.includes("sales")) return "sales";
  if (normalized.includes("finance")) return "finance";
  if (normalized.includes("operations")) return "operations";
  if (normalized.includes("support")) return "support";
  if (normalized.includes("workforce")) return "operations";

  return "operations";
}

function typeForDepartment(slug: string) {
  return `department_${slug}`;
}

export function scoreDepartmentPriorities(summary: any) {
  return [
    {
      department: "marketing",
      score: Number(summary.campaigns || 0) === 0 ? 80 : 35,
      reason:
        Number(summary.campaigns || 0) === 0
          ? "No campaigns exist yet."
          : "Marketing is active; continue asset production.",
    },
    {
      department: "sales",
      score: Number(summary.pipelineValue || 0) <= 0 ? 85 : 45,
      reason:
        Number(summary.pipelineValue || 0) <= 0
          ? "Pipeline value is missing or zero."
          : `Pipeline value exists: $${Number(summary.pipelineValue || 0).toLocaleString()}.`,
    },
    {
      department: "finance",
      score:
        Number(summary.runwayMonths || 0) > 0 &&
        Number(summary.runwayMonths || 0) < 6
          ? 95
          : 40,
      reason:
        Number(summary.runwayMonths || 0) > 0 &&
        Number(summary.runwayMonths || 0) < 6
          ? "Runway is below 6 months."
          : "Finance runway is currently acceptable.",
    },
    {
      department: "operations",
      score: Number(summary.operationsRuns || 0) === 0 ? 75 : 35,
      reason:
        Number(summary.operationsRuns || 0) === 0
          ? "No completed operations runs found."
          : "Operations process execution exists.",
    },
    {
      department: "support",
      score: Number(summary.highPrioritySupport || 0) > 0 ? 90 : 30,
      reason:
        Number(summary.highPrioritySupport || 0) > 0
          ? `${summary.highPrioritySupport} high-priority support ticket(s) need attention.`
          : "No high-priority support risk detected.",
    },
  ].sort((a, b) => b.score - a.score);
}

export async function createExecutiveActionPlan({
  projectId,
  runtimeSessionId,
}: {
  projectId: string;
  runtimeSessionId?: string | null;
}) {
  const command = await getExecutiveCommandCenter(projectId);

  if (!command.ok || !command.company) {
    return {
      ok: false as const,
      error: command.error || "No company found.",
    };
  }

  const company = command.company;
  const priorities = scoreDepartmentPriorities(command.summary);
  const tasks = [];

  for (const recommendation of command.recommendations.slice(0, 5)) {
    const departmentSlug = departmentForArea(recommendation.area);
    const task = await createDepartmentTask({
      companyId: company.id,
      departmentSlug,
      type: typeForDepartment(departmentSlug),
      message: `${recommendation.title}: ${recommendation.detail}`,
      input: {
        source: "executive_action_plan",
        priority: recommendation.priority,
        area: recommendation.area,
        recommendation,
      },
    });

    tasks.push(task);
  }

  const report = {
    projectId,
    companyId: company.id,
    companyName: company.name,
    generatedAt: new Date().toISOString(),
    summary: command.summary,
    priorities,
    recommendations: command.recommendations,
    taskIds: tasks.map((task) => task.id),
  };

  const runtimeId = runtimeSessionId || `executive-${company.id}`;

  RuntimeHub.emit(runtimeId, {
    type: "tool_call",
    tool: "executive_loop",
    args: {
      action: "create_action_plan",
      projectId,
      companyId: company.id,
      recommendations: command.recommendations.length,
    },
  });

  RuntimeHub.emit(runtimeId, {
    type: "tool_result",
    tool: "executive_loop",
    result: {
      action: "create_action_plan",
      createdTasks: tasks.length,
      report,
    },
  });

  return {
    ok: true as const,
    companyId: company.id,
    createdTasks: tasks.length,
    tasks,
    report,
  };
}

export async function runExecutiveLoop({
  projectId,
  sessionId,
  runtimeSessionId,
  limit = 10,
}: {
  projectId: string;
  sessionId?: string | null;
  runtimeSessionId?: string | null;
  limit?: number;
}) {
  const actionPlan = await createExecutiveActionPlan({
    projectId,
    runtimeSessionId,
  });

  if (!actionPlan.ok) {
    return actionPlan;
  }

  const companyId = actionPlan.companyId;
  const runtimeId = runtimeSessionId || sessionId || `executive-${companyId}`;

  RuntimeHub.emit(runtimeId, {
    type: "tool_call",
    tool: "executive_loop",
    args: {
      action: "run_company_tasks",
      companyId,
      limit,
    },
  });

  const workforce = await runPendingCompanyTasks({
    companyId,
    sessionId: sessionId || runtimeId,
    runtimeSessionId: runtimeId,
    limit,
  });

  RuntimeHub.emit(runtimeId, {
    type: "tool_result",
    tool: "executive_loop",
    result: {
      action: "run_company_tasks",
      createdTasks: actionPlan.createdTasks,
      processed: workforce.processed,
      workforce,
    },
  });

  const refreshed = await getExecutiveCommandCenter(projectId);

  return {
    ok: true as const,
    actionPlan,
    workforce,
    refreshed,
  };
}

export async function getDailyExecutiveReport(projectId: string) {
  const command = await getExecutiveCommandCenter(projectId);

  if (!command.ok || !command.company) {
    return command;
  }

  const priorities = scoreDepartmentPriorities(command.summary);

  return {
    ok: true as const,
    generatedAt: new Date().toISOString(),
    companyId: command.company.id,
    companyName: command.company.name,
    summary: command.summary,
    priorities,
    recommendations: command.recommendations,
    reportText: [
      `Executive Report for ${command.company.name}`,
      `Departments: ${command.summary.departments}`,
      `Workers: ${command.summary.workers} total, ${command.summary.idleWorkers} idle`,
      `Pending tasks: ${command.summary.pendingTasks}`,
      `Pipeline value: $${Number(command.summary.pipelineValue || 0).toLocaleString()}`,
      `Revenue: $${Number(command.summary.revenue || 0).toLocaleString()}`,
      `Net: $${Number(command.summary.net || 0).toLocaleString()}`,
      `Runway: ${command.summary.runwayMonths || 0} months`,
      `Support risk: ${command.summary.highPrioritySupport || 0} high-priority tickets`,
      `Top priority: ${priorities[0]?.department || "none"} - ${priorities[0]?.reason || "No priority found."}`,
    ].join("\n"),
  };
}
