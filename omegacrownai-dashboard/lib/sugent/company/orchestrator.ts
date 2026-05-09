import { prisma } from "@/lib/db";
import { getCompanyKpiSnapshot, setCompanyKPI } from "./kpi";
import { getCompanyMemory, writeCompanyMemory } from "./memory";

export async function resolveCompanyForProject(projectId: string) {
  return prisma.company.findFirst({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  });
}

export async function seedDefaultWorkers(companyId: string) {
  const existing = await prisma.worker.count({
    where: { companyId },
  });

  if (existing > 0) return [];

  return prisma.worker.createMany({
    data: [
      { companyId, role: "research", name: "Research Agent" },
      { companyId, role: "analysis", name: "Analysis Agent" },
      { companyId, role: "ops", name: "Operations Agent" },
    ],
  });
}

export async function runCompanyOrchestrator({
  companyId,
  projectId,
  sessionId,
  runtimeSessionId,
  message,
}: {
  companyId: string;
  projectId: string;
  sessionId: string;
  runtimeSessionId: string;
  message: string;
}) {
  const company = await prisma.company.findFirst({
    where: {
      id: companyId,
      projectId,
    },
  });

  if (!company) {
    return {
      ok: false,
      intent: "company_not_found",
      reply: "No company found for this project.",
      actions: [],
      error: "COMPANY_NOT_FOUND",
    };
  }

  const lower = message.toLowerCase();

  if (lower.includes("set mission") || lower.includes("update mission")) {
    const mission = message.split(":").slice(1).join(":").trim() || message;

    const updated = await prisma.company.update({
      where: { id: company.id },
      data: { mission },
    });

    await writeCompanyMemory({
      companyId: company.id,
      kind: "decision",
      content: `Mission updated: ${mission}`,
      tags: { source: "company_orchestrator", sessionId, runtimeSessionId },
    });

    return {
      ok: true,
      intent: "company_mission_updated",
      reply: `Mission updated for ${company.name}.`,
      actions: [{ type: "company_update", field: "mission", companyId: company.id }],
      company: updated,
    };
  }

  if (lower.startsWith("set kpi") || lower.includes("set company kpi")) {
    const match = message.match(/([a-zA-Z0-9_-]+)\s*=\s*(-?\d+(?:\.\d+)?)/);
    const periodMatch = message.match(/\b(day|week|month|quarter|year)\b/i);

    if (!match) {
      return {
        ok: false,
        intent: "company_kpi_parse_error",
        reply: "Could not parse KPI. Use: set kpi leads=10 week",
        actions: [],
      };
    }

    const kpi = await setCompanyKPI({
      companyId: company.id,
      metric: match[1],
      value: Number(match[2]),
      period: periodMatch?.[1]?.toLowerCase() || "week",
    });

    await writeCompanyMemory({
      companyId: company.id,
      kind: "fact",
      content: `KPI recorded: ${kpi.metric}=${kpi.value} (${kpi.period})`,
      tags: { source: "company_kpi", kpiId: kpi.id },
    });

    return {
      ok: true,
      intent: "company_kpi_set",
      reply: `KPI set: ${kpi.metric} = ${kpi.value} (${kpi.period}).`,
      actions: [{ type: "company_kpi_set", kpiId: kpi.id }],
      data: kpi,
    };
  }

  if (lower.includes("company memory")) {
    const memory = await getCompanyMemory(company.id);

    return {
      ok: true,
      intent: "company_memory",
      reply:
        memory.length > 0
          ? memory.map((item) => `- [${item.kind}] ${item.content}`).join("\\n")
          : "No company memory entries yet.",
      actions: [{ type: "company_memory_list", companyId: company.id }],
      data: memory,
    };
  }

  if (lower.includes("kpi dashboard") || lower.includes("show kpis")) {
    const snapshot = await getCompanyKpiSnapshot(company.id);

    return {
      ok: true,
      intent: "company_kpi_dashboard",
      reply:
        snapshot.length > 0
          ? "KPI snapshot:\\n" + snapshot.map((kpi: any) => `- ${kpi.metric}: ${kpi.value} (${kpi.period})`).join("\\n")
          : "No KPIs recorded yet.",
      actions: [{ type: "company_kpi_dashboard", companyId: company.id }],
      data: snapshot,
    };
  }

  const [kpis, memory, workers, tasks] = await Promise.all([
    getCompanyKpiSnapshot(company.id),
    getCompanyMemory(company.id, 10),
    prisma.worker.findMany({ where: { companyId: company.id }, orderBy: { createdAt: "asc" } }),
    prisma.companyTask.findMany({ where: { companyId: company.id }, orderBy: { createdAt: "desc" }, take: 10 }),
  ]);

  return {
    ok: true,
    intent: "company_overview",
    reply: `Company overview for ${company.name}: ${workers.length} workers, ${kpis.length} KPIs, ${memory.length} memory entries.`,
    actions: [{ type: "company_overview", companyId: company.id }],
    data: {
      company,
      kpis,
      memory,
      workers,
      tasks,
    },
  };
}
