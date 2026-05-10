import Link from "next/link";
import { prisma } from "@/lib/db";
import { OmegaLogo } from "@/components/brand/OmegaLogo";

export default async function SupportDashboardPage({
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
          where: { slug: "support" },
          take: 1,
        },
      },
    }),
  ]);

  const company = companies[0] || null;

  const [tickets, responses, articles] = company
    ? await Promise.all([
        prisma.supportTicket.findMany({
          where: { companyId: company.id },
          orderBy: { createdAt: "desc" },
          take: 50,
          include: { responses: true },
        }),
        prisma.supportResponse.findMany({
          where: { companyId: company.id },
          orderBy: { createdAt: "desc" },
          take: 50,
          include: { ticket: true },
        }),
        prisma.supportKnowledgeBase.findMany({
          where: { companyId: company.id },
          orderBy: { createdAt: "desc" },
          take: 50,
        }),
      ])
    : [[], [], []];

  return (
    <main className="space-y-6">
      <div className="flex justify-center">
        <OmegaLogo className="h-16 w-auto object-contain" />
      </div>

      <section className="rounded-3xl border border-border bg-panel/70 p-6">
        <Link href={`/projects/${id}/company/departments`} className="text-sm text-cyan-300 hover:underline">
          ← Back to Departments
        </Link>

        <p className="mt-5 text-xs uppercase tracking-[0.25em] text-rose-300">
          Support Department Engine
        </p>

        <h1 className="mt-3 text-4xl font-black text-white">
          Support Engine · {project?.name || "Project"}
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
          Triage support tickets, generate customer responses, create knowledge-base articles, and track support KPIs.
        </p>
      </section>

      {company ? (
        <>
          <section className="grid gap-4 md:grid-cols-5">
            <Metric label="Tickets" value={String(tickets.length)} />
            <Metric label="Open" value={String(tickets.filter((ticket) => ticket.status === "open").length)} />
            <Metric label="High Priority" value={String(tickets.filter((ticket) => ticket.priority === "high").length)} />
            <Metric label="Responses" value={String(responses.length)} />
            <Metric label="KB Articles" value={String(articles.length)} />
          </section>

          <section className="rounded-3xl border border-border bg-panel/70 p-5">
            <h2 className="text-xl font-black text-white">Create Support Ticket</h2>

            <form
              action={`/api/company/${company.id}/support/tickets`}
              method="POST"
              className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5"
            >
              <input
                name="customerName"
                placeholder="Customer name"
                className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none"
              />

              <input
                name="customerEmail"
                placeholder="Customer email"
                className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none"
              />

              <input
                name="subject"
                placeholder="Subject"
                className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none"
              />

              <input
                name="message"
                placeholder="Message"
                className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none"
              />

              <button className="rounded-xl bg-rose-600 px-5 py-3 text-sm font-black text-white hover:bg-rose-500">
                Create Ticket
              </button>
            </form>
          </section>

          <section className="space-y-4">
            <div className="rounded-3xl border border-border bg-panel/70 p-5">
              <h2 className="text-xl font-black text-white">Tickets</h2>

              <div className="mt-4 space-y-3">
                {tickets.length ? (
                  tickets.map((ticket) => (
                    <div key={ticket.id} className="rounded-2xl border border-border bg-black/20 p-4">
                      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                        <div>
                          <div className="text-sm font-bold text-white">
                            {ticket.subject} · {ticket.priority} · {ticket.status}
                          </div>
                          <div className="mt-1 text-xs text-muted">
                            {ticket.customerName || "Unknown Customer"} · {ticket.customerEmail || "No email"}
                          </div>
                          <div className="mt-2 text-xs leading-5 text-muted">
                            {ticket.message}
                          </div>
                          <div className="mt-2 text-xs text-rose-200">
                            Category: {ticket.category} · Sentiment: {ticket.sentiment || "unknown"}
                          </div>
                        </div>

                        <div className="font-mono text-xs text-muted">{ticket.id}</div>
                      </div>

                      {ticket.responses.length ? (
                        <Panel title="Draft Responses" value={ticket.responses} />
                      ) : null}
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-border bg-black/20 p-4 text-sm text-muted">
                    No support tickets yet.
                  </div>
                )}
              </div>
            </div>

            <section className="grid gap-4 xl:grid-cols-2">
              <Panel title="Recent Responses" value={responses} />
              <Panel title="Knowledge Base" value={articles} />
            </section>
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
    <div className="mt-4 rounded-xl border border-border bg-slate-950 p-3">
      <div className="text-xs font-bold uppercase tracking-[0.16em] text-rose-300">
        {title}
      </div>
      <pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap text-xs text-slate-200">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}
