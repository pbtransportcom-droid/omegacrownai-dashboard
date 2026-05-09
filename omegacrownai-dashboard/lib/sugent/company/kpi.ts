import { prisma } from "@/lib/db";

export async function setCompanyKPI({
  companyId,
  metric,
  value,
  period = "week",
  note,
}: {
  companyId: string;
  metric: string;
  value: number;
  period?: string;
  note?: string | null;
}) {
  return prisma.companyKPI.create({
    data: {
      companyId,
      metric,
      value,
      period,
      note: note || null,
    },
  });
}

export async function getCompanyKpiSnapshot(companyId: string) {
  const kpis = await prisma.companyKPI.findMany({
    where: { companyId },
    orderBy: { timestamp: "desc" },
    take: 100,
  });

  const latestByMetric: Record<string, any> = {};

  for (const kpi of kpis) {
    if (!latestByMetric[kpi.metric]) {
      latestByMetric[kpi.metric] = kpi;
    }
  }

  return Object.values(latestByMetric);
}
