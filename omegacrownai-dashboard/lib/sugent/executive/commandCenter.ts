import { prisma } from "@/lib/db";
import { getMarketingDashboard } from "@/lib/sugent/marketing/engine";
import { getSalesDashboard } from "@/lib/sugent/sales/engine";
import { getFinanceDashboard } from "@/lib/sugent/finance/engine";
import { getOperationsDashboard } from "@/lib/sugent/operations/engine";
import { getSupportDashboard } from "@/lib/sugent/support/engine";

export async function getExecutiveCommandCenter(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  const company = await prisma.company.findFirst({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    include: {
      departments: {
        orderBy: { createdAt: "asc" },
        include: {
          kpis: {
            orderBy: { timestamp: "desc" },
            take: 25,
          },
          memory: {
            orderBy: { createdAt: "desc" },
            take: 10,
          },
        },
      },
      workers: {
        orderBy: { createdAt: "asc" },
      },
      tasks: {
        orderBy: { createdAt: "desc" },
        take: 50,
        include: { worker: true },
      },
    },
  });

  if (!company) {
    return {
      ok: false,
      project,
      company: null,
      error: "No company exists for this project.",
    };
  }

  const [marketing, sales, finance, operations, support] = await Promise.all([
    getMarketingDashboard(company.id).catch((error) => ({ ok: false, error: String(error) })),
    getSalesDashboard(company.id).catch((error) => ({ ok: false, error: String(error) })),
    getFinanceDashboard(company.id).catch((error) => ({ ok: false, error: String(error) })),
    getOperationsDashboard(company.id).catch((error) => ({ ok: false, error: String(error) })),
    getSupportDashboard(company.id).catch((error) => ({ ok: false, error: String(error) })),
  ]);

  const pendingTasks = company.tasks.filter((task) => task.status === "pending");
  const runningTasks = company.tasks.filter((task) => task.status === "running");
  const failedTasks = company.tasks.filter((task) => task.status === "error");

  const departmentKpis = company.departments.flatMap((department) =>
    department.kpis.map((kpi) => ({
      ...kpi,
      departmentName: department.name,
      departmentSlug: department.slug,
    }))
  );

  const financeSummary: any = (finance as any).summary || {};
  const salesSummary: any = (sales as any).summary || {};
  const supportSummary: any = (support as any).summary || {};
  const operationsSummary: any = (operations as any).summary || {};
  const marketingSummary: any = (marketing as any).summary || {};

  const recommendations = buildExecutiveRecommendations({
    pendingTasks: pendingTasks.length,
    failedTasks: failedTasks.length,
    pipelineValue: Number(salesSummary.pipelineValue || 0),
    runwayMonths: Number(financeSummary.latestRunwayMonths || 0),
    highPrioritySupport: Number(supportSummary.highPriority || 0),
    campaigns: Number(marketingSummary.campaigns || 0),
    operationsRuns: Number(operationsSummary.completedRuns || 0),
  });

  return {
    ok: true,
    project,
    company,
    dashboards: {
      marketing,
      sales,
      finance,
      operations,
      support,
    },
    summary: {
      departments: company.departments.length,
      workers: company.workers.length,
      idleWorkers: company.workers.filter((worker) => worker.status === "idle").length,
      busyWorkers: company.workers.filter((worker) => worker.status === "busy").length,
      tasks: company.tasks.length,
      pendingTasks: pendingTasks.length,
      runningTasks: runningTasks.length,
      failedTasks: failedTasks.length,
      departmentKpis: departmentKpis.length,
      campaigns: marketingSummary.campaigns || 0,
      marketingAssets: marketingSummary.assets || 0,
      pipelineValue: salesSummary.pipelineValue || 0,
      openDeals: salesSummary.openDeals || 0,
      revenue: financeSummary.revenue || 0,
      expenses: financeSummary.expenses || 0,
      net: financeSummary.net || 0,
      cashBalance: financeSummary.cashBalance || 0,
      runwayMonths: financeSummary.latestRunwayMonths || 0,
      operationsProcesses: operationsSummary.processes || 0,
      operationsRuns: operationsSummary.completedRuns || 0,
      openSupportTickets: supportSummary.openTickets || 0,
      highPrioritySupport: supportSummary.highPriority || 0,
    },
    departmentKpis,
    recommendations,
  };
}

function buildExecutiveRecommendations({
  pendingTasks,
  failedTasks,
  pipelineValue,
  runwayMonths,
  highPrioritySupport,
  campaigns,
  operationsRuns,
}: {
  pendingTasks: number;
  failedTasks: number;
  pipelineValue: number;
  runwayMonths: number;
  highPrioritySupport: number;
  campaigns: number;
  operationsRuns: number;
}) {
  const recommendations = [];

  if (pendingTasks > 0) {
    recommendations.push({
      priority: "high",
      area: "Workforce",
      title: "Process pending tasks",
      detail: `${pendingTasks} tasks are waiting in the company queue. Run the workforce loop to clear execution backlog.`,
    });
  }

  if (failedTasks > 0) {
    recommendations.push({
      priority: "high",
      area: "Operations",
      title: "Review failed tasks",
      detail: `${failedTasks} tasks failed and should be inspected before continuing automation.`,
    });
  }

  if (campaigns === 0) {
    recommendations.push({
      priority: "medium",
      area: "Marketing",
      title: "Launch first campaign",
      detail: "Create a campaign to start generating assets, lead magnets, landing copy, email copy, social posts, and ad copy.",
    });
  }

  if (pipelineValue <= 0) {
    recommendations.push({
      priority: "medium",
      area: "Sales",
      title: "Build pipeline value",
      detail: "Run the Sales Engine to create leads, deals, qualification checklist, and outreach assets.",
    });
  }

  if (runwayMonths > 0 && runwayMonths < 6) {
    recommendations.push({
      priority: "high",
      area: "Finance",
      title: "Improve runway",
      detail: `Current runway is ${runwayMonths} months. Reduce expenses, increase revenue, or adjust forecast assumptions.`,
    });
  }

  if (highPrioritySupport > 0) {
    recommendations.push({
      priority: "high",
      area: "Support",
      title: "Handle high-priority support",
      detail: `${highPrioritySupport} high-priority support tickets need attention.`,
    });
  }

  if (operationsRuns === 0) {
    recommendations.push({
      priority: "medium",
      area: "Operations",
      title: "Run an SOP",
      detail: "Create and run at least one operations process to validate workflow execution.",
    });
  }

  if (!recommendations.length) {
    recommendations.push({
      priority: "normal",
      area: "Executive",
      title: "Company OS is healthy",
      detail: "Core departments are active. Continue creating tasks and reviewing KPI trends.",
    });
  }

  return recommendations;
}
