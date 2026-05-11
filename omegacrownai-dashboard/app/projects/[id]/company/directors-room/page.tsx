import Link from "next/link";
import { prisma } from "@/lib/db";
import { OmegaLogo } from "@/components/brand/OmegaLogo";
import { listDirectorsRoomSessions } from "@/lib/sugent/directors-room/directorsRoomEngine";

export default async function DirectorsRoomPage({
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
  const data = company ? await listDirectorsRoomSessions(company.id) : null;

  const videoProjects = company
    ? await prisma.videoProject.findMany({
        where: { companyId: company.id },
        orderBy: { createdAt: "desc" },
        take: 25,
      })
    : [];

  return (
    <main className="space-y-6">
      <div className="flex justify-center">
        <OmegaLogo className="h-16 w-auto object-contain" />
      </div>

      <section className="rounded-3xl border border-border bg-panel/70 p-6">
        <Link href={`/projects/${id}/company/executive`} className="text-sm text-cyan-300 hover:underline">
          ← Back to Executive Command Center
        </Link>

        <p className="mt-5 text-xs uppercase tracking-[0.25em] text-yellow-300">
          AI Director's Room · Phase 28
        </p>

        <h1 className="mt-3 text-4xl font-black text-white">
          Director's Room · {project?.name || "Project"}
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
          Multi-agent creative debates with Brand, Performance, Safety, and Audience directors. The Coordinator merges feedback into one safe, accurate, premium consensus brief.
        </p>
      </section>

      {company && data ? (
        <>
          <section className="grid gap-4 md:grid-cols-4">
            <Metric label="Sessions" value={String(data.summary.total)} />
            <Metric label="Open" value={String(data.summary.open)} />
            <Metric label="Consensus" value={String(data.summary.consensus)} />
            <Metric label="Cancelled" value={String(data.summary.cancelled)} />
          </section>

          <section className="rounded-3xl border border-border bg-panel/70 p-5">
            <h2 className="text-xl font-black text-white">Start Director's Room</h2>

            <form
              action={`/api/company/${company.id}/directors-room`}
              method="POST"
              className="mt-4 grid gap-3"
            >
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  name="topic"
                  placeholder="Topic, e.g. Hero video concept"
                  className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none"
                />

                <select
                  name="projectId"
                  defaultValue=""
                  className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none"
                >
                  <option value="">No attached video project</option>
                  {videoProjects.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title}
                    </option>
                  ))}
                </select>
              </div>

              <textarea
                name="initialDraft"
                placeholder="Initial draft or creative brief"
                rows={6}
                className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none"
                defaultValue="Create a premium OmegaCrownAI hero video concept that explains the sovereign AI company operating system, shows intelligent departments, automation, executive command, and production-grade quality."
              />

              <button className="rounded-xl bg-yellow-600 px-5 py-3 text-sm font-black text-white hover:bg-yellow-500">
                Start Debate
              </button>
            </form>
          </section>

          <section className="space-y-4">
            {data.sessions.length ? (
              data.sessions.map((session: any) => {
                const latestRound = session.rounds?.[0];

                return (
                  <div key={session.id} className="rounded-3xl border border-border bg-panel/70 p-5">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                      <div>
                        <h2 className="text-2xl font-black text-white">{session.topic}</h2>
                        <p className="mt-1 text-xs text-yellow-300">{session.status}</p>
                        <p className="mt-1 font-mono text-[11px] text-muted">{session.id}</p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <form action={`/api/company/${company.id}/directors-room/${session.id}/next-round`} method="POST">
                          <button className="rounded-xl border border-yellow-400/30 bg-yellow-500/10 px-3 py-2 text-xs font-black text-yellow-100 hover:bg-yellow-500/20">
                            Run Next Round
                          </button>
                        </form>

                        <form action={`/api/company/${company.id}/directors-room/${session.id}/save-version`} method="POST">
                          <button className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-3 py-2 text-xs font-black text-cyan-100 hover:bg-cyan-500/20">
                            Save Consensus Version
                          </button>
                        </form>

                        <a
                          href={`/api/company/${company.id}/directors-room/${session.id}`}
                          className="rounded-xl border border-border bg-black/20 px-3 py-2 text-xs font-black text-white hover:bg-black/40"
                        >
                          Open JSON
                        </a>
                      </div>
                    </div>

                    {latestRound ? (
                      <div className="mt-5 grid gap-4 xl:grid-cols-6">
                        <Panel title="Current Draft" value={latestRound.draft} wide />
                        {["brand", "performance", "safety", "audience"].map((agent) => {
                          const msg = latestRound.messages?.find((m: any) => m.agentType === agent);
                          return (
                            <Panel
                              key={agent}
                              title={`${agent} director`}
                              value={msg?.content || "No message yet."}
                            />
                          );
                        })}
                        <Panel title="Coordinator" value={latestRound.summary || "Waiting for coordinator."} wide />
                      </div>
                    ) : (
                      <div className="mt-4 rounded-xl border border-border bg-black/20 p-4 text-sm text-muted">
                        No rounds yet.
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="rounded-xl border border-border bg-black/20 p-4 text-sm text-muted">
                No Director's Room sessions yet.
              </div>
            )}
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

function Panel({
  title,
  value,
  wide = false,
}: {
  title: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div className={`rounded-2xl border border-border bg-black/20 p-4 ${wide ? "xl:col-span-3" : "xl:col-span-1"}`}>
      <div className="text-xs font-black uppercase tracking-[0.16em] text-yellow-300">
        {title}
      </div>
      <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap text-xs leading-5 text-slate-200">
        {value}
      </pre>
    </div>
  );
}
