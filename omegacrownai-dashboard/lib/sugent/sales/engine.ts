import { prisma } from "@/lib/db";
import { setDepartmentKPI, writeDepartmentMemory } from "@/lib/sugent/company/departments";

const DEFAULT_STAGES = [
  "new",
  "contacted",
  "qualified",
  "proposal",
  "negotiation",
  "closed_won",
  "closed_lost",
];

export function buildQualificationChecklist({ offer, audience }: { offer?: string | null; audience?: any }) {
  return [
    `Does the prospect have a clear need for ${offer || "OmegaCrown AI Company OS"}?`,
    "Does the prospect control or influence buying decisions?",
    "Is there a timeline for implementing AI automation?",
    "Does the prospect have workflows, departments, or teams that can benefit from automation?",
    "Is there budget or business value large enough to justify adoption?",
  ];
}

export function generateSalesAssets({
  companyName,
  offer,
  audience,
}: {
  companyName: string;
  offer?: string | null;
  audience?: any;
}) {
  const target = audience?.segment || audience?.name || "founders and operators";
  const product = offer || "OmegaCrown AI Company OS";

  return {
    outreachEmail: {
      subject: "Turn AI into an operating system for your business",
      body: `Hi,\n\nI wanted to share ${product}, built for ${target} who want AI to do more than chat.\n\n${companyName} helps teams create departments, assign AI workers, run secure tasks, automate browser/cloud workflows, and track KPIs.\n\nWould it make sense to explore where this could save time or increase revenue in your company?`,
    },
    followUpSequence: [
      "Follow-up 1: Ask about current AI workflow bottlenecks.",
      "Follow-up 2: Share the Company OS value proposition.",
      "Follow-up 3: Offer a short demo focused on departments, workers, and KPIs.",
    ],
    discoveryQuestions: [
      "What business process takes the most manual time today?",
      "Where are leads, operations, finance, or support tasks getting delayed?",
      "What would a successful AI operating system need to prove in the first 30 days?",
    ],
  };
}

export async function createSalesPipeline({
  companyId,
  departmentId,
  name = "Default Sales Pipeline",
  description,
}: {
  companyId: string;
  departmentId?: string | null;
  name?: string;
  description?: string | null;
}) {
  return prisma.salesPipeline.create({
    data: {
      companyId,
      departmentId: departmentId || null,
      name,
      description: description || null,
      stages: DEFAULT_STAGES,
      status: "active",
    },
  });
}

export async function ensureSalesPipeline(companyId: string, departmentId?: string | null) {
  const existing = await prisma.salesPipeline.findFirst({
    where: { companyId },
    orderBy: { createdAt: "asc" },
  });

  if (existing) return existing;

  return createSalesPipeline({
    companyId,
    departmentId,
    name: "OmegaCrown Sales Pipeline",
    description: "Default pipeline for AI Company OS sales workflows.",
  });
}

export async function createSalesLead({
  companyId,
  departmentId,
  pipelineId,
  name,
  company,
  email,
  source = "sales_engine",
  notes,
  metadata = {},
}: {
  companyId: string;
  departmentId?: string | null;
  pipelineId?: string | null;
  name: string;
  company?: string | null;
  email?: string | null;
  source?: string | null;
  notes?: string | null;
  metadata?: any;
}) {
  return prisma.salesLead.create({
    data: {
      companyId,
      departmentId: departmentId || null,
      pipelineId: pipelineId || null,
      name,
      company: company || null,
      email: email || null,
      source: source || null,
      status: "new",
      score: 50,
      notes: notes || null,
      metadata,
    },
  });
}

export async function createSalesDeal({
  companyId,
  departmentId,
  pipelineId,
  leadId,
  name,
  value = 0,
  nextStep,
  metadata = {},
}: {
  companyId: string;
  departmentId?: string | null;
  pipelineId?: string | null;
  leadId?: string | null;
  name: string;
  value?: number;
  nextStep?: string | null;
  metadata?: any;
}) {
  return prisma.salesDeal.create({
    data: {
      companyId,
      departmentId: departmentId || null,
      pipelineId: pipelineId || null,
      leadId: leadId || null,
      name,
      value,
      stage: "qualified",
      probability: 0.25,
      status: "open",
      nextStep: nextStep || "Schedule discovery call.",
      metadata,
    },
  });
}

export async function runSalesEngine({
  companyId,
  departmentId,
  objective,
  offer = "OmegaCrown AI Company OS",
  audience = { segment: "founders and operators" },
}: {
  companyId: string;
  departmentId?: string | null;
  objective: string;
  offer?: string | null;
  audience?: any;
}) {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
  });

  const pipeline = await ensureSalesPipeline(companyId, departmentId || null);

  const lead = await createSalesLead({
    companyId,
    departmentId,
    pipelineId: pipeline.id,
    name: "Ideal Prospect",
    company: "Target Company",
    source: "sales_department_execution",
    notes: objective,
    metadata: { audience, offer },
  });

  const deal = await createSalesDeal({
    companyId,
    departmentId,
    pipelineId: pipeline.id,
    leadId: lead.id,
    name: `${offer || "OmegaCrown AI"} Opportunity`,
    value: 5000,
    nextStep: "Send outreach email and schedule discovery call.",
    metadata: { objective, audience },
  });

  const assets = generateSalesAssets({
    companyName: company?.name || "OmegaCrown AI",
    offer,
    audience,
  });

  const checklist = buildQualificationChecklist({
    offer,
    audience,
  });

  if (departmentId) {
    await setDepartmentKPI({
      departmentId,
      metric: "sales_leads",
      value: 1,
      period: "week",
      note: `Lead created for sales objective: ${objective}`,
    });

    await setDepartmentKPI({
      departmentId,
      metric: "sales_deals",
      value: 1,
      period: "week",
      note: `Deal created: ${deal.name}`,
    });

    await setDepartmentKPI({
      departmentId,
      metric: "pipeline_value",
      value: deal.value,
      period: "week",
      note: `Pipeline value added by sales engine.`,
    });

    await writeDepartmentMemory({
      departmentId,
      kind: "sales_execution",
      content: `Sales engine executed: ${objective}. Created lead ${lead.id} and deal ${deal.id}.`,
      tags: {
        source: "sales_engine",
        pipelineId: pipeline.id,
        leadId: lead.id,
        dealId: deal.id,
      },
    });
  }

  return {
    ok: true,
    intent: "sales_department_execution",
    reply: `Sales pipeline updated. Lead and deal created for: ${objective}`,
    pipeline,
    lead,
    deal,
    assets,
    checklist,
  };
}

export async function getSalesDashboard(companyId: string) {
  const [pipelines, leads, deals] = await Promise.all([
    prisma.salesPipeline.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        leads: { orderBy: { createdAt: "desc" }, take: 20 },
        deals: { orderBy: { createdAt: "desc" }, take: 20 },
      },
    }),
    prisma.salesLead.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.salesDeal.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { lead: true, pipeline: true },
    }),
  ]);

  return {
    ok: true,
    companyId,
    pipelines,
    leads,
    deals,
    summary: {
      pipelines: pipelines.length,
      leads: leads.length,
      deals: deals.length,
      openDeals: deals.filter((deal) => deal.status === "open").length,
      pipelineValue: deals
        .filter((deal) => deal.status === "open")
        .reduce((sum, deal) => sum + deal.value, 0),
    },
  };
}
