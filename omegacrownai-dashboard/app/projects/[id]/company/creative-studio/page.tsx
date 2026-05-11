import Link from "next/link";
import { prisma } from "@/lib/db";
import { OmegaLogo } from "@/components/brand/OmegaLogo";
import { getCreativeStudioDashboard } from "@/lib/sugent/creative-agents/coordinator";

export default async function CreativeStudioPage({
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
  const data = company ? await getCreativeStudioDashboard(company.id) : null;

  return (
    <main className="space-y-6">
      <div className="flex justify-center">
        <OmegaLogo className="h-16 w-auto object-contain" />
      </div>

      <section className="rounded-3xl border border-border bg-panel/70 p-6">
        <Link href={`/projects/${id}/company/executive`} className="text-sm text-cyan-300 hover:underline">
          ← Back to Executive Command Center
        </Link>

        <p className="mt-5 text-xs uppercase tracking-[0.25em] text-rose-300">
          Multi-Agent Creative Studio · Phase 23
        </p>

        <h1 className="mt-3 text-4xl font-black text-white">
          Creative Studio Agents · {project?.name || "Project"}
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
          Run Director, Editor, and Reviewer agents across video and podcast workflows. Every run is logged, versioned, reviewed, and approval-gated.
        </p>
      </section>

      {company && data ? (
        <>
          <section className="rounded-3xl border border-amber-400/20 bg-amber-500/10 p-5">
            <h2 className="text-xl font-black text-white">Production Quality Standard</h2>
            <p className="mt-2 text-sm leading-7 text-muted">
              Every creative agent must prioritize prompt accuracy, detailed prompt interpretation, factual consistency when factual output is requested, legendary/cinematic consistency when stylized output is requested, and premium production quality.
            </p>

            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              {[
                "Prompt Accuracy",
                "Detail Alignment",
                "Factual Consistency",
                "Legendary Style Match",
                "Production Polish",
              ].map((item) => (
                <div key={item} className="rounded-xl border border-amber-400/20 bg-black/20 px-3 py-2 text-xs font-bold text-amber-100">
                  {item}
                </div>
              ))}
            </div>
          </section>
          <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
            <Metric label="Runs" value={String(data.summary.runs)} />
            <Metric label="Completed" value={String(data.summary.completed)} />
            <Metric label="Failed" value={String(data.summary.failed)} />
            <Metric label="Running" value={String(data.summary.running)} />
            <Metric label="Video" value={String(data.summary.video)} />
            <Metric label="Podcast" value={String(data.summary.podcast)} />
          </section>

          <section className="rounded-3xl border border-border bg-panel/70 p-5">
            <h2 className="text-xl font-black text-white">Run Creative Agent Flow</h2>

            <form
              action={`/api/company/${company.id}/creative-studio/run`}
              method="POST"
              className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-6"
            >
              <select
                name="mode"
                defaultValue="video"
                className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none"
              >
                <option value="video">Video</option>
                <option value="podcast">Podcast</option>
              </select>

              <input
                name="title"
                placeholder="Creative title"
                className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none"
              />

              <input
                name="brief"
                placeholder="Creative brief"
                className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none xl:col-span-3"
              />

              <button className="rounded-xl bg-rose-600 px-5 py-3 text-sm font-black text-white hover:bg-rose-500">
                Run Agents
              </button>
            </form>
          </section>

          <section className="rounded-3xl border border-border bg-panel/70 p-5">
            <h2 className="text-xl font-black text-white">Agent Runs</h2>

            <div className="mt-4 space-y-3">
              {data.runs.length ? (
                data.runs.map((run: any) => (
                  <div key={run.id} className="rounded-2xl border border-border bg-black/20 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="text-sm font-black text-white">
                          {run.projectType || "creative"} · {run.status}
                        </div>
                        <div className="mt-1 text-xs text-rose-300">
                          {run.agentRole}
                        </div>
                        <div className="mt-1 font-mono text-[11px] text-muted">
                          {run.id}
                        </div>
                      </div>

                      <a
                        href={`/api/company/${company.id}/creative-studio/runs/${run.id}`}
                        className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs font-black text-rose-100 hover:bg-rose-500/20"
                      >
                        Open JSON
                      </a>
                    </div>

                    <div className="mt-4 grid gap-3 xl:grid-cols-2">
                      <Panel title="Input" value={run.inputJson || {}} />
                      <Panel title="Output" value={run.outputJson || {}} />
                    </div>

                    <div className="mt-4">
                      <Panel title="Steps" value={run.steps || []} />
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-border bg-black/20 p-4 text-sm text-muted">
                  No creative agent runs yet.
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

function Panel({ title, value }: { title: string; value: any }) {
  return (
    <div className="rounded-xl border border-border bg-slate-950 p-3">
      <div className="text-xs font-bold uppercase tracking-[0.16em] text-rose-300">
        {title}
      </div>
      <pre className="mt-2 max-h-96 overflow-auto whitespace-pre-wrap text-xs leading-5 text-slate-200">
        {typeof value === "string" ? value : JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}
