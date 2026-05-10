import Link from "next/link";
import { prisma } from "@/lib/db";
import { OmegaLogo } from "@/components/brand/OmegaLogo";
import { generateSalesAssets, buildQualificationChecklist } from "@/lib/sugent/sales/engine";

export default async function SalesDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [project, companies] = await Promise.all([
    prisma.project.findUnique({ where: { id } }),
    prisma.company.findMany({
      where: { projectId: id },
      orderBy: { createdAt: "desc" },
      include: {
        departments: {
          where: { slug: "sales" },
          take: 1,
        },
      },
    }),
  ]);

  const company = companies[0] || null;

  const [pipelines, leads, deals] = company
    ? await Promise.all([
        prisma.salesPipeline.findMany({
          where: { companyId: company.id },
          orderBy: { createdAt: "desc" },
          take: 50,
          include: {
            leads: { take: 10, orderBy: { createdAt: "desc" } },
            deals: { take: 10, orderBy: { createdAt: "desc" } },
          },
        }),
        prisma.salesLead.findMany({
          where: { companyId: company.id },
          orderBy: { createdAt: "desc" },
          take: 50,
        }),
        prisma.salesDeal.findMany({
          where: { companyId: company.id },
          orderBy: { createdAt: "desc" },
          take: 50,
          include: { lead: true, pipeline: true },
        }),
      ])
    : [[], [], []];

  const sampleAssets = generateSalesAssets({
    companyName: company?.name || "OmegaCrown AI",
    offer: "OmegaCrown AI Company OS",
    audience: { segment: "founders and operators" },
  });

  const checklist = buildQualificationChecklist({
    offer: "OmegaCrown AI Company OS",
    audience: { segment: "founders and operators" },
  });

  return (
    <main className="space-y-6">
      <div className="flex justify-center">
        <OmegaLogo className="h-16 w-auto object-contain" />
      </div>

      <section className="rounded-3xl border border-border bg-panel/70 p-6">
        <Link href={`/projects/${id}/company/departments`} className="text-sm text-cyan-300 hover:underline">
          ← Back to Departments
        </Link>

        <p className="mt-5 text-xs uppercase tracking-[0.25em] text-sky-300">
          Sales Department Engine
        </p>

        <h1 className="mt-3 text-4xl font-black text-white">
          Sales Engine · {project?.name || "Project"}
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
          Manage sales pipelines, leads, deals, outreach assets, follow-up sequences, qualification checklists, and pipeline value.
        </p>
      </section>

      {company ? (
        <>
          <section className="grid gap-4 md:grid-cols-5">
            <Metric label="Pipelines" value={String(pipelines.length)} />
            <Metric label="Leads" value={String(leads.length)} />
            <Metric label="Deals" value={String(deals.length)} />
            <Metric label="Open Deals" value={String(deals.filter((deal) => deal.status === "open").length)} />
            <Metric
              label="Pipeline Value"
              value={`$${deals.filter((deal) => deal.status === "open").reduce((sum, deal) => sum + deal.value, 0).toLocaleString()}`}
            />
          </section>

          <section className="rounded-3xl border border-border bg-panel/70 p-5">
            <h2 className="text-xl font-black text-white">Create Sales Lead</h2>

            <form
              action={`/api/company/${company.id}/sales/leads`}
              method="POST"
              className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5"
            >
              <input
                name="name"
                placeholder="Lead name"
                className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none"
              />

              <input
                name="company"
                placeholder="Company"
                className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none"
              />

              <input
                name="email"
                placeholder="Email"
                className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none"
              />

              <input
                name="notes"
                placeholder="Notes"
                className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none"
              />

              <button className="rounded-xl bg-sky-600 px-5 py-3 text-sm font-black text-white hover:bg-sky-500">
                Add Lead
              </button>
            </form>
          </section>

          <section className="grid gap-4 xl:grid-cols-2">
            <Panel title="Outreach Email" value={sampleAssets.outreachEmail} />
            <Panel title="Follow-up Sequence" value={sampleAssets.followUpSequence} />
            <Panel title="Discovery Questions" value={sampleAssets.discoveryQuestions} />
            <Panel title="Qualification Checklist" value={checklist} />
          </section>

          <section className="space-y-4">
            <div className="rounded-3xl border border-border bg-panel/70 p-5">
              <h2 className="text-xl font-black text-white">Deals</h2>
              <div className="mt-4 space-y-3">
                {deals.length ? (
                  deals.map((deal) => (
                    <div key={deal.id} className="rounded-2xl border border-border bg-black/20 p-4">
                      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                        <div>
                          <div className="text-sm font-bold text-white">
                            {deal.name} · {deal.stage} · {deal.status}
                          </div>
                          <div className="mt-1 text-xs text-muted">
                            Value ${deal.value.toLocaleString()} · Probability {Math.round(deal.probability * 100)}%
                          </div>
                          <div className="mt-1 text-xs text-sky-200">
                            Next: {deal.nextStep || "No next step."}
                          </div>
                        </div>
                        <div className="font-mono text-xs text-muted">{deal.id}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-border bg-black/20 p-4 text-sm text-muted">
                    No deals yet.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-panel/70 p-5">
              <h2 className="text-xl font-black text-white">Leads</h2>
              <Panel title="Recent Leads" value={leads} />
            </div>
          </section>
        </>
      ) : (
        <section className="rounded-2xl border border-border bg-black/20 p-5 text-sm text-muted">
          No company exists for this project yet.
        </section>
      )}
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-black/20 p-4">
      <div className="text-xs uppercase tracking-[0.18em] text-muted">{label}</div>
      <div className="mt-2 truncate text-xl font-black text-white">{value}</div>
    </div>
  );
}

function Panel({ title, value }: { title: string; value: any }) {
  return (
    <div className="rounded-xl border border-border bg-slate-950 p-3">
      <div className="text-xs font-bold uppercase tracking-[0.16em] text-sky-300">
        {title}
      </div>
      <pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap text-xs text-slate-200">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}
