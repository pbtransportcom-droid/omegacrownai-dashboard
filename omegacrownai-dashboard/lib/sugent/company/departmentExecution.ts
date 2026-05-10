import { prisma } from "@/lib/db";
import { setDepartmentKPI, writeDepartmentMemory } from "./departments";
import { createMarketingCampaign } from "@/lib/sugent/marketing/engine";
import { runSalesEngine } from "@/lib/sugent/sales/engine";
import { runFinanceEngine } from "@/lib/sugent/finance/engine";

export function departmentExecutionPlan({
  departmentSlug,
  message,
}: {
  departmentSlug: string;
  message: string;
}) {
  const normalized = departmentSlug.toLowerCase();

  if (normalized === "marketing") {
    return {
      engine: "marketing",
      summary: `Marketing execution plan created for: ${message}`,
      kpis: [
        { metric: "campaign_tasks", value: 1, period: "week" },
        { metric: "lead_generation_actions", value: 3, period: "week" },
      ],
      recommendations: [
        "Define the target customer segment.",
        "Create one offer-focused landing message.",
        "Prepare one outreach or content campaign.",
      ],
    };
  }

  if (normalized === "sales") {
    return {
      engine: "sales",
      summary: `Sales execution plan created for: ${message}`,
      kpis: [
        { metric: "pipeline_actions", value: 1, period: "week" },
        { metric: "follow_up_steps", value: 3, period: "week" },
      ],
      recommendations: [
        "Clarify the offer and buying trigger.",
        "Create a simple qualification checklist.",
        "Prepare follow-up steps for warm leads.",
      ],
    };
  }

  if (normalized === "finance") {
    return {
      engine: "finance",
      summary: `Finance execution plan created for: ${message}`,
      kpis: [
        { metric: "finance_reviews", value: 1, period: "week" },
        { metric: "forecast_items", value: 3, period: "week" },
      ],
      recommendations: [
        "Track expected revenue impact.",
        "Estimate operating cost.",
        "Record risk and budget assumptions.",
      ],
    };
  }

  if (normalized === "operations") {
    return {
      engine: "operations",
      summary: `Operations execution plan created for: ${message}`,
      kpis: [
        { metric: "ops_tasks", value: 1, period: "week" },
        { metric: "process_steps", value: 5, period: "week" },
      ],
      recommendations: [
        "Break the workflow into repeatable steps.",
        "Assign an owner or worker role.",
        "Create a checklist for completion.",
      ],
    };
  }

  if (normalized === "support") {
    return {
      engine: "support",
      summary: `Support execution plan created for: ${message}`,
      kpis: [
        { metric: "support_actions", value: 1, period: "week" },
        { metric: "knowledge_items", value: 2, period: "week" },
      ],
      recommendations: [
        "Identify the customer issue.",
        "Draft a support response.",
        "Add the answer to the knowledge base.",
      ],
    };
  }

  return {
    engine: "general_department",
    summary: `Department execution plan created for: ${message}`,
    kpis: [{ metric: "department_actions", value: 1, period: "week" }],
    recommendations: ["Create a task plan.", "Assign a worker.", "Record the outcome."],
  };
}

export async function executeDepartmentTask({
  taskId,
}: {
  taskId: string;
}) {
  const task = await prisma.companyTask.findUnique({
    where: { id: taskId },
    include: {
      company: true,
      worker: true,
    },
  });

  if (!task) {
    return {
      ok: false,
      error: "Task not found.",
    };
  }

  const input: any = task.input || {};
  const departmentId = input.departmentId;
  const departmentSlug = input.departmentSlug;
  const message = String(input.message || "");

  if (!departmentId || !departmentSlug) {
    return {
      ok: false,
      error: "Task is not department-routed.",
      task,
    };
  }

  if (String(departmentSlug).toLowerCase() === "finance") {
    const finance = await runFinanceEngine({
      companyId: task.companyId,
      departmentId,
      objective: message || "Create a finance forecast.",
    });

    const output = {
      ok: true,
      intent: "finance_department_execution",
      departmentId,
      departmentSlug,
      departmentName: input.departmentName,
      engine: "finance",
      reply: finance.reply,
      accountId: finance.account.id,
      forecastId: finance.forecast.id,
      summary: finance.summary,
      transactions: finance.transactions,
      forecast: finance.forecast,
    };

    const updated = await prisma.companyTask.update({
      where: { id: task.id },
      data: {
        status: "success",
        output,
        errorMessage: null,
      },
    });

    if (task.workerId) {
      await prisma.worker.update({
        where: { id: task.workerId },
        data: { status: "idle" },
      });
    }

    return {
      ok: true,
      task: updated,
      worker: task.worker,
      result: output,
    };
  }

  if (String(departmentSlug).toLowerCase() === "sales") {
    const sales = await runSalesEngine({
      companyId: task.companyId,
      departmentId,
      objective: message || "Create a sales pipeline plan.",
      offer: "OmegaCrown AI Company OS",
      audience: {
        segment: "founders, operators, and AI-powered businesses",
      },
    });

    const output = {
      ok: true,
      intent: "sales_department_execution",
      departmentId,
      departmentSlug,
      departmentName: input.departmentName,
      engine: "sales",
      reply: sales.reply,
      pipelineId: sales.pipeline.id,
      leadId: sales.lead.id,
      dealId: sales.deal.id,
      assets: sales.assets,
      checklist: sales.checklist,
    };

    const updated = await prisma.companyTask.update({
      where: { id: task.id },
      data: {
        status: "success",
        output,
        errorMessage: null,
      },
    });

    if (task.workerId) {
      await prisma.worker.update({
        where: { id: task.workerId },
        data: { status: "idle" },
      });
    }

    return {
      ok: true,
      task: updated,
      worker: task.worker,
      result: output,
    };
  }

  if (String(departmentSlug).toLowerCase() === "marketing") {
    const marketing = await createMarketingCampaign({
      companyId: task.companyId,
      departmentId,
      name: message.slice(0, 80) || "Marketing Campaign",
      objective: message || "Create a marketing campaign.",
      offer: "OmegaCrown AI autonomous company operating system",
      audience: {
        segment: "founders, operators, and AI-powered businesses",
      },
      channels: ["website", "email", "social", "ads"],
      createAssets: true,
    });

    const output = {
      ok: true,
      intent: "marketing_department_execution",
      departmentId,
      departmentSlug,
      departmentName: input.departmentName,
      engine: "marketing",
      reply: `Marketing campaign created: ${marketing.campaign.name}`,
      campaignId: marketing.campaign.id,
      assetsCreated: marketing.assets.length,
      brief: marketing.brief,
      assets: marketing.assets,
    };

    const updated = await prisma.companyTask.update({
      where: { id: task.id },
      data: {
        status: "success",
        output,
        errorMessage: null,
      },
    });

    if (task.workerId) {
      await prisma.worker.update({
        where: { id: task.workerId },
        data: { status: "idle" },
      });
    }

    return {
      ok: true,
      task: updated,
      worker: task.worker,
      result: output,
    };
  }

  const plan = departmentExecutionPlan({
    departmentSlug,
    message,
  });

  for (const kpi of plan.kpis) {
    await setDepartmentKPI({
      departmentId,
      metric: kpi.metric,
      value: kpi.value,
      period: kpi.period,
      note: `Auto-recorded by ${plan.engine} department execution.`,
    });
  }

  await writeDepartmentMemory({
    departmentId,
    kind: "execution",
    content: plan.summary,
    tags: {
      source: "department_execution",
      taskId: task.id,
      departmentSlug,
      engine: plan.engine,
    },
  });

  const output = {
    ok: true,
    intent: "department_execution",
    departmentId,
    departmentSlug,
    departmentName: input.departmentName,
    engine: plan.engine,
    reply: plan.summary,
    recommendations: plan.recommendations,
    kpis: plan.kpis,
  };

  const updated = await prisma.companyTask.update({
    where: { id: task.id },
    data: {
      status: "success",
      output,
      errorMessage: null,
    },
  });

  if (task.workerId) {
    await prisma.worker.update({
      where: { id: task.workerId },
      data: { status: "idle" },
    });
  }

  return {
    ok: true,
    task: updated,
    worker: task.worker,
    result: output,
  };
}
