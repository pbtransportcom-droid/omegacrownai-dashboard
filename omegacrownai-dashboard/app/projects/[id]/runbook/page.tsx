import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function RunbookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [project, logs, executions, events, builds] = await Promise.all([
    prisma.project.findUnique({
      where: { id },
    }),
    prisma.auditLog.findMany({
      where: { projectId: id },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.agentExecution.findMany({
      where: { projectId: id },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.sugentEvent.findMany({
      where: { projectId: id },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.projectBuild.findMany({
      where: { projectId: id },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        artifacts: true,
      },
    }),
  ]);

  return (
    <main className="space-y-6">
      <div className="rounded-3xl border border-border bg-panel/70 p-6">
        <Link href={`/projects/${id}`} className="text-sm text-cyan-300 hover:underline">
          ← Back to project
        </Link>

        <p className="mt-5 text-xs uppercase tracking-[0.25em] text-amber-300">
          Sugent OS Inspector
        </p>

        <h1 className="mt-3 text-4xl font-black text-white">
          Runbook · {project?.name || "Project"}
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
          Inspect audit logs, Sugent events, agent executions, builds, and artifacts for this project.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <Metric label="Audit Logs" value={String(logs.length)} />
        <Metric label="Sugent Events" value={String(events.length)} />
        <Metric label="Executions" value={String(executions.length)} />
        <Metric label="Builds" value={String(builds.length)} />
      </section>

      <Panel title="Audit Log">
        {logs.length ? (
          logs.map((log) => (
            <RunbookItem
              key={log.id}
              title={log.action}
              subtitle={`${log.actorType}${log.actorId ? ` · ${log.actorId}` : ""}`}
              time={log.createdAt}
              payload={log.metadata}
            />
          ))
        ) : (
          <Empty>No audit logs yet.</Empty>
        )}
      </Panel>

      <Panel title="Sugent Events">
        {events.length ? (
          events.map((event) => (
            <RunbookItem
              key={event.id}
              title={event.message}
              subtitle={`${event.type}${event.domain ? ` · ${event.domain}` : ""}`}
              time={event.createdAt}
              payload={event.payload}
            />
          ))
        ) : (
          <Empty>No Sugent events yet.</Empty>
        )}
      </Panel>

      <Panel title="Agent Executions">
        {executions.length ? (
          executions.map((execution) => (
            <RunbookItem
              key={execution.id}
              title={execution.prompt.slice(0, 160)}
              subtitle="AgentExecution"
              time={execution.createdAt}
              payload={{
                intents: execution.intents,
                agents: execution.agents,
                execution: execution.execution,
                reply: execution.reply,
              }}
            />
          ))
        ) : (
          <Empty>No agent executions yet.</Empty>
        )}
      </Panel>

      <Panel title="Builds and Artifacts">
        {builds.length ? (
          builds.map((build) => (
            <RunbookItem
              key={build.id}
              title={`${build.label} · ${build.status}`}
              subtitle={`${build.domain} · ${build.source}`}
              time={build.createdAt}
              payload={{
                buildId: build.id,
                artifacts: build.artifacts.map((artifact) => ({
                  id: artifact.id,
                  kind: artifact.kind,
                  createdAt: artifact.createdAt,
                })),
              }}
            />
          ))
        ) : (
          <Empty>No builds yet.</Empty>
        )}
      </Panel>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-black/20 p-4">
      <div className="text-xs uppercase tracking-[0.18em] text-muted">{label}</div>
      <div className="mt-2 text-2xl font-black text-white">{value}</div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: any }) {
  return (
    <section className="rounded-3xl border border-border bg-panel/70 p-5">
      <h2 className="text-xl font-black text-white">{title}</h2>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

function Empty({ children }: { children: any }) {
  return (
    <div className="rounded-xl border border-border bg-black/20 p-4 text-sm text-muted">
      {children}
    </div>
  );
}

function RunbookItem({
  title,
  subtitle,
  time,
  payload,
}: {
  title: string;
  subtitle: string;
  time: Date;
  payload: any;
}) {
  return (
    <div className="rounded-2xl border border-border bg-black/20 p-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="text-sm font-bold text-white">{title}</div>
          <div className="mt-1 text-xs text-muted">{subtitle}</div>
        </div>
        <div className="text-xs text-muted">{new Date(time).toLocaleString()}</div>
      </div>

      <pre className="mt-3 max-h-64 overflow-auto rounded-xl border border-border bg-slate-950 p-3 text-xs text-slate-200">
        {JSON.stringify(payload || {}, null, 2)}
      </pre>
    </div>
  );
}
