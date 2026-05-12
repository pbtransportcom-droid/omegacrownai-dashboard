import Link from "next/link";
import { prisma } from "@/lib/db";
import { OmegaLogo } from "@/components/brand/OmegaLogo";
import { getAuditDashboard } from "@/lib/sugent/audit/auditEngine";

export default async function AuditPage({
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
      take: 1,
    }),
  ]);

  const company = companies[0] || null;
  const data = company ? await getAuditDashboard(company.id) : null;

  return (
    <main className="space-y-6">
      <div className="flex justify-center">
        <OmegaLogo className="h-16 w-auto object-contain" />
      </div>

      <section className="rounded-3xl border border-border bg-panel/70 p-6">
        <Link href={`/projects/${id}/company/executive`} className="text-sm text-cyan-300 hover:underline">
          ← Back to Executive Command Center
        </Link>

        <p className="mt-5 text-xs uppercase tracking-[0.25em] text-orange-300">
          Audit Log + Compliance · Phase 33
        </p>

        <h1 className="mt-3 text-4xl font-black text-white">
          Audit & Compliance · {project?.name || "Project"}
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
          Tamper-evident audit events, actor tracing, hash-chain verification, and compliance reporting.
        </p>
      </section>

      {company && data ? (
        <>
          <section className="grid gap-4 md:grid-cols-4 xl:grid-cols-7">
            <Metric label="Events" value={String(data.summary.total)} />
            <Metric label="Info" value={String(data.summary.info)} />
            <Metric label="Warning" value={String(data.summary.warning)} />
            <Metric label="Critical" value={String(data.summary.critical)} />
            <Metric label="Actors" value={String(data.summary.uniqueActors)} />
            <Metric label="Reports" value={String(data.summary.reports)} />
            <Metric label="Chain" value={data.summary.chainVerified ? "Verified" : "Broken"} />
          </section>

          <section className="rounded-3xl border border-border bg-panel/70 p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-black text-white">Compliance Controls</h2>
                <p className="mt-1 text-sm text-muted">
                  Verify the audit hash chain and generate a company compliance report.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <a
                  href={`/api/company/${company.id}/audit/verify`}
                  className="rounded-xl border border-orange-400/30 bg-orange-500/10 px-4 py-3 text-sm font-black text-orange-100 hover:bg-orange-500/20"
                >
                  Verify Chain JSON
                </a>

                <form action={`/api/company/${company.id}/audit/compliance-report`} method="POST">
                  <button className="rounded-xl bg-orange-600 px-4 py-3 text-sm font-black text-white hover:bg-orange-500">
                    Generate Report
                  </button>
                </form>
              </div>
            </div>

            {!data.chain.ok && (
              <pre className="mt-4 max-h-80 overflow-auto rounded-xl border border-red-400/20 bg-red-500/10 p-4 text-xs text-red-100">
                {JSON.stringify(data.chain.issues, null, 2)}
              </pre>
            )}
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <section className="rounded-3xl border border-border bg-panel/70 p-5">
              <h2 className="text-xl font-black text-white">Action Counts</h2>
              <div className="mt-4 space-y-2">
                {Object.entries(data.actionCounts).length ? (
                  Object.entries(data.actionCounts).map(([action, count]) => (
                    <div key={action} className="flex justify-between rounded-xl border border-border bg-black/20 px-3 py-2 text-sm">
                      <span className="text-slate-300">{action}</span>
                      <span className="font-black text-white">{String(count)}</span>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-border bg-black/20 p-4 text-sm text-muted">
                    No action counts yet.
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-3xl border border-border bg-panel/70 p-5">
              <h2 className="text-xl font-black text-white">Actor Counts</h2>
              <div className="mt-4 space-y-2">
                {Object.entries(data.actorCounts).length ? (
                  Object.entries(data.actorCounts).map(([actor, count]) => (
                    <div key={actor} className="flex justify-between rounded-xl border border-border bg-black/20 px-3 py-2 text-sm">
                      <span className="text-slate-300">{actor}</span>
                      <span className="font-black text-white">{String(count)}</span>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-border bg-black/20 p-4 text-sm text-muted">
                    No actor counts yet.
                  </div>
                )}
              </div>
            </section>
          </section>

          <section className="rounded-3xl border border-border bg-panel/70 p-5">
            <h2 className="text-xl font-black text-white">Recent Audit Events</h2>

            <div className="mt-4 space-y-3">
              {data.events.length ? (
                data.events.map((event: any) => (
                  <div key={event.id} className="rounded-2xl border border-border bg-black/20 p-4">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                      <div>
                        <div className="text-sm font-black text-white">{event.action}</div>
                        <div className="mt-1 text-xs text-orange-300">
                          {event.entityType} · {event.actorType} · {event.severity}
                        </div>
                        <div className="mt-1 font-mono text-[11px] text-muted">{event.id}</div>
                      </div>

                      <div className="rounded-xl border border-border bg-slate-950 px-3 py-2 font-mono text-[10px] text-slate-300">
                        hash {event.hash.slice(0, 16)}...
                      </div>
                    </div>

                    <pre className="mt-3 max-h-40 overflow-auto rounded-xl border border-border bg-slate-950 p-3 text-xs text-slate-200">
                      {JSON.stringify(event.metadata || {}, null, 2)}
                    </pre>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-border bg-black/20 p-4 text-sm text-muted">
                  No audit events yet.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-panel/70 p-5">
            <h2 className="text-xl font-black text-white">Compliance Reports</h2>

            <div className="mt-4 space-y-3">
              {data.reports.length ? (
                data.reports.map((report: any) => (
                  <div key={report.id} className="rounded-2xl border border-border bg-black/20 p-4">
                    <div className="text-sm font-black text-white">{report.title}</div>
                    <div className="mt-1 text-xs text-orange-300">{report.status} · {report.scope}</div>
                    <div className="mt-1 font-mono text-[11px] text-muted">{report.id}</div>

                    <pre className="mt-3 max-h-40 overflow-auto rounded-xl border border-border bg-slate-950 p-3 text-xs text-slate-200">
                      {JSON.stringify(report.summary || {}, null, 2)}
                    </pre>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-border bg-black/20 p-4 text-sm text-muted">
                  No compliance reports yet.
                </div>
              )}
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
