import Link from "next/link";
import { prisma } from "@/lib/db";
import { OmegaLogo } from "@/components/brand/OmegaLogo";
import { listEditorsRoomSessions } from "@/lib/sugent/editors-room/editorsRoomEngine";

export default async function EditorsRoomPage({
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
  const data = company ? await listEditorsRoomSessions(company.id) : null;

  const videoProjects = company
    ? await prisma.videoProject.findMany({
        where: { companyId: company.id },
        orderBy: { createdAt: "desc" },
        take: 25,
        include: {
          timeline: true,
          scenes: true,
          assets: true,
        },
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

        <p className="mt-5 text-xs uppercase tracking-[0.25em] text-purple-300">
          AI Editor's Room · Phase 30
        </p>

        <h1 className="mt-3 text-4xl font-black text-white">
          Editor's Room · {project?.name || "Project"}
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
          Multi-agent timeline critique for pacing, visual continuity, narrative clarity, accessibility, and production polish.
        </p>
      </section>

      {company && data ? (
        <>
          <section className="grid gap-4 md:grid-cols-4">
            <Metric label="Sessions" value={String(data.summary.total)} />
            <Metric label="Open" value={String(data.summary.open)} />
            <Metric label="Consensus" value={String(data.summary.consensus)} />
            <Metric label="Applied" value={String(data.summary.applied)} />
          </section>

          <section className="rounded-3xl border border-border bg-panel/70 p-5">
            <h2 className="text-xl font-black text-white">Start Editor's Room</h2>

            <form
              action={`/api/company/${company.id}/editors-room`}
              method="POST"
              className="mt-4 grid gap-3 md:grid-cols-3"
            >
              <select
                name="projectId"
                defaultValue=""
                required
                className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none md:col-span-2"
              >
                <option value="">Select video project</option>
                {videoProjects.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title} · scenes {item.scenes.length} · assets {item.assets.length}
                  </option>
                ))}
              </select>

              <input
                name="topic"
                placeholder="Topic, e.g. Optimize hero video pacing"
                className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none"
              />

              <button className="rounded-xl bg-purple-600 px-5 py-3 text-sm font-black text-white hover:bg-purple-500 md:col-span-3">
                Start Timeline Critique
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
                        <p className="mt-1 text-xs text-purple-300">{session.status}</p>
                        <p className="mt-1 font-mono text-[11px] text-muted">{session.id}</p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <form action={`/api/company/${company.id}/editors-room/${session.id}/next-round`} method="POST">
                          <button className="rounded-xl border border-purple-400/30 bg-purple-500/10 px-3 py-2 text-xs font-black text-purple-100 hover:bg-purple-500/20">
                            Run Next Round
                          </button>
                        </form>

                        <form action={`/api/company/${company.id}/editors-room/${session.id}/apply-plan`} method="POST">
                          <button className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-3 py-2 text-xs font-black text-cyan-100 hover:bg-cyan-500/20">
                            Apply Edit Plan
                          </button>
                        </form>

                        <a
                          href={`/api/company/${company.id}/editors-room/${session.id}`}
                          className="rounded-xl border border-border bg-black/20 px-3 py-2 text-xs font-black text-white hover:bg-black/40"
                        >
                          Open JSON
                        </a>
                      </div>
                    </div>

                    {latestRound ? (
                      <div className="mt-5 grid gap-4 xl:grid-cols-6">
                        <Panel title="Timeline Snapshot" value={JSON.stringify(latestRound.timelineJson, null, 2)} wide />
                        {["rhythm", "visual", "narrative", "accessibility"].map((agent) => {
                          const msg = latestRound.messages?.find((m: any) => m.agentType === agent);
                          return (
                            <Panel
                              key={agent}
                              title={`${agent} editor`}
                              value={msg?.content || "No message yet."}
                            />
                          );
                        })}
                        <Panel title="Coordinator Summary" value={latestRound.summary || "Waiting for coordinator."} wide />
                        <Panel title="Edit Plan" value={JSON.stringify(latestRound.editPlanJson || [], null, 2)} wide />
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
                No Editor's Room sessions yet.
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
      <div className="text-xs font-black uppercase tracking-[0.16em] text-purple-300">
        {title}
      </div>
      <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap text-xs leading-5 text-slate-200">
        {value}
      </pre>
    </div>
  );
}
