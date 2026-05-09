import { prisma } from "@/lib/db";

export default async function AdminSecurityPage() {
  const [recent, blocked, allowed] = await Promise.all([
    prisma.securityAuditEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.securityAuditEvent.count({
      where: { allowed: false },
    }),
    prisma.securityAuditEvent.count({
      where: { allowed: true },
    }),
  ]);

  return (
    <main className="space-y-6">
      <section className="rounded-3xl border border-border bg-panel/70 p-6">
        <p className="text-xs uppercase tracking-[0.25em] text-red-300">
          Security & IP Protection
        </p>

        <h1 className="mt-3 text-4xl font-black text-white">
          Security Audit Center
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
          Review protected route access, blocked attempts, rate limits, admin access, and internal API usage.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Metric label="Recent Events" value={String(recent.length)} />
        <Metric label="Allowed" value={String(allowed)} />
        <Metric label="Blocked" value={String(blocked)} />
      </section>

      <section className="rounded-3xl border border-border bg-panel/70 p-5">
        <h2 className="text-xl font-black text-white">Recent Security Events</h2>

        <div className="mt-4 space-y-3">
          {recent.length ? (
            recent.map((event) => (
              <div key={event.id} className="rounded-2xl border border-border bg-black/20 p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="text-sm font-bold text-white">
                      {event.allowed ? "allowed" : "blocked"} · {event.action}
                    </div>
                    <div className="mt-1 text-xs text-muted">
                      {event.method || "?"} {event.route || "unknown route"}
                    </div>
                    <div className="mt-1 text-xs text-red-200">
                      {event.reason || "no reason"}
                    </div>
                  </div>

                  <div className="text-xs text-muted">
                    {new Date(event.createdAt).toLocaleString()}
                  </div>
                </div>

                <pre className="mt-3 max-h-48 overflow-auto rounded-xl border border-border bg-slate-950 p-3 text-xs text-slate-200">
                  {JSON.stringify(
                    {
                      ip: event.ip,
                      actorId: event.actorId,
                      actorType: event.actorType,
                      userAgent: event.userAgent,
                      metadata: event.metadata,
                    },
                    null,
                    2
                  )}
                </pre>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-border bg-black/20 p-4 text-sm text-muted">
              No security events yet.
            </div>
          )}
        </div>
      </section>
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
