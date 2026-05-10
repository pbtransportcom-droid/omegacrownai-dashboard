import { prisma } from "@/lib/db";

export const DEFAULT_DEPARTMENTS = [
  {
    slug: "marketing",
    name: "Marketing",
    purpose: "Campaigns, audience research, content, lead generation, and growth strategy.",
  },
  {
    slug: "sales",
    name: "Sales",
    purpose: "Pipeline, outreach, offer positioning, closing workflows, and customer conversion.",
  },
  {
    slug: "finance",
    name: "Finance",
    purpose: "Revenue, expenses, forecasts, pricing, budgets, and financial controls.",
  },
  {
    slug: "operations",
    name: "Operations",
    purpose: "Execution systems, SOPs, delivery, scheduling, and workflow automation.",
  },
  {
    slug: "support",
    name: "Support",
    purpose: "Customer support, ticket triage, knowledge base, and service quality.",
  },
];

export async function seedDefaultDepartments(companyId: string) {
  const created = [];

  for (const department of DEFAULT_DEPARTMENTS) {
    const item = await prisma.companyDepartment.upsert({
      where: {
        companyId_slug: {
          companyId,
          slug: department.slug,
        },
      },
      update: {},
      create: {
        companyId,
        slug: department.slug,
        name: department.name,
        purpose: department.purpose,
      },
    });

    created.push(item);
  }

  return created;
}

export async function getCompanyDepartments(companyId: string) {
  return prisma.companyDepartment.findMany({
    where: { companyId },
    orderBy: { createdAt: "asc" },
    include: {
      kpis: {
        orderBy: { timestamp: "desc" },
        take: 20,
      },
      memory: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });
}

export async function createDepartmentTask({
  companyId,
  departmentSlug,
  type,
  message,
  input = {},
}: {
  companyId: string;
  departmentSlug: string;
  type?: string;
  message: string;
  input?: any;
}) {
  const department = await prisma.companyDepartment.findUnique({
    where: {
      companyId_slug: {
        companyId,
        slug: departmentSlug,
      },
    },
  });

  if (!department) {
    throw new Error(`Department not found: ${departmentSlug}`);
  }

  return prisma.companyTask.create({
    data: {
      companyId,
      type: type || `department_${departmentSlug}`,
      status: "pending",
      input: {
        ...input,
        message,
        departmentId: department.id,
        departmentSlug,
        departmentName: department.name,
      },
    },
  });
}

export async function setDepartmentKPI({
  departmentId,
  metric,
  value,
  period = "week",
  note,
}: {
  departmentId: string;
  metric: string;
  value: number;
  period?: string;
  note?: string | null;
}) {
  return prisma.departmentKPI.create({
    data: {
      departmentId,
      metric,
      value,
      period,
      note: note || null,
    },
  });
}

export async function writeDepartmentMemory({
  departmentId,
  kind = "fact",
  content,
  tags = {},
}: {
  departmentId: string;
  kind?: string;
  content: string;
  tags?: any;
}) {
  return prisma.departmentMemory.create({
    data: {
      departmentId,
      kind,
      content,
      tags,
    },
  });
}
