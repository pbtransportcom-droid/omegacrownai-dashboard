import Link from "next/link";
import { prisma } from "@/lib/db";
import { OmegaLogo } from "@/components/brand/OmegaLogo";
import { getRuntimePolicyDashboard } from "@/lib/sugent/runtime-policy/runtimePolicyEngine";

export default async function RuntimePolicyPage({
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
  const data = company ? await getRuntimePolicyDashboard(company.id) : null;

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

        <p className="mt-5 text-xs uppercase tracking-[0.25em] text-fuchsia-300">
          Sovereign Runtime Policy Enforcement · Phase 39
        </p>

        <h1 className="mt-3 text-4xl font-black text-white">
          Runtime Policy Enforcement · {project?.name || "Project"}
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
          Blocks unsafe runtime actions unless governance, QA, passport, identity, audit, and deployment checks pass.
        </p>
      </section>

      {company && data ? (
        <>
          <section className="grid gap-4 md:grid-cols-4 xl:grid-cols-8">
            <Metric label="Rules" value={String(data.summary.rules)} />
            <Metric label="Active" value={String(data.summary.activeRules)} />
            <Metric label="Decisions" value={String(data.summary.decisions)} />
            <Metric label="Allowed" value={String(data.summary.allowed)} />
            <Metric label="Blocked" value={String(data.summary.blocked)} />
            <Metric label="QA Rules" value={String(data.summary.qaRules)} />
            <Metric label="Passport" value={String(data.summary.passportRules)} />
            <Metric label="Deploy" value={String(data.summary.deploymentRules)} />
          </section>

          <section className="rounded-3xl border border-border bg-panel/70 p-5">
            <h2 className="text-xl font-black text-white">Evaluate Runtime Action</h2>

            <form
              action={`/api/company/${company.id}/runtime-policy/evaluate`}
              method="POST"
              className="mt-4 grid gap-3"
            >
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  name="actorId"
                  defaultValue="system-owner"
                  className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none"
                />

                <select
                  name="projectId"
                  defaultValue=""
                  className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none"
                >
                  <option value="">No project</option>
                  {videoProjects.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <input
                  name="resource"
                  defaultValue="runtime"
                  className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none"
                />

                <select
                  name="action"
                  defaultValue="publish"
                  className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none"
                >
                  <option value="render">render</option>
                  <option value="publish">publish</option>
                  <option value="deploy">deploy</option>
                  <option value="rollback">rollback</option>
                  <option value="issue">issue</option>
                </select>

                <select
                  name="projectType"
                  defaultValue="video"
                  className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none"
                >
                  <option value="video">video</option>
                  <option value="podcast">podcast</option>
                </select>
              </div>

              <button className="rounded-xl bg-fuchsia-600 px-5 py-3 text-sm font-black text-white hover:bg-fuchsia-500">
                Evaluate Policy
              </button>
            </form>
          </section>

          <section className="rounded-3xl border border-border bg-panel/70 p-5">
            <h2 className="text-xl font-black text-white">Runtime Policy Rules</h2>

            <div className="mt-4 space-y-3">
              {data.rules.map((rule: any) => (
                <div key={rule.id} className="rounded-2xl border border-border bg-black/20 p-4">
                  <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                    <div>
                      <div className="text-sm font-black text-white">{rule.name}</div>
                      <div className="mt-1 text-xs text-fuchsia-300">
                        {rule.resource}:{rule.action} · {rule.status} · priority {rule.priority}
                      </div>
                      <div className="mt-1 font-mono text-[11px] text-muted">{rule.id}</div>
                    </div>

                    <span className="rounded-full bg-fuchsia-600 px-3 py-1 text-xs font-black text-white">
                      {rule.severity}
                    </span>
                  </div>

                  <div className="mt-3 grid gap-2 text-xs md:grid-cols-3">
                    <Flag label="Governance" value={rule.requireGovernance} />
                    <Flag label="QA" value={rule.requireQA} />
                    <Flag label="Passport" value={rule.requirePassport} />
                    <Flag label="Identity" value={rule.requireIdentity} />
                    <Flag label="Audit" value={rule.requireAudit} />
                    <Flag label="Deployment" value={rule.requireDeployment} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-panel/70 p-5">
            <h2 className="text-xl font-black text-white">Recent Runtime Decisions</h2>

            <div className="mt-4 space-y-3">
              {data.decisions.length ? (
                data.decisions.map((decision: any) => (
                  <div key={decision.id} className="rounded-2xl border border-border bg-black/20 p-4">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                      <div>
                        <div className="text-sm font-black text-white">
                          {decision.resource}:{decision.action}
                        </div>
                        <div className="mt-1 text-xs text-fuchsia-300">
                          {decision.decision} · {decision.actorType} · {decision.actorId || "unknown"}
                        </div>
                        <div className="mt-1 font-mono text-[11px] text-muted">{decision.id}</div>
                      </div>

                      <span className={`rounded-full px-3 py-1 text-xs font-black ${
                        decision.decision === "allow"
                          ? "bg-emerald-600 text-white"
                          : "bg-red-600 text-white"
                      }`}>
                        {decision.decision}
                      </span>
                    </div>

                    <p className="mt-3 text-sm text-slate-300">{decision.reason}</p>

                    <pre className="mt-3 max-h-72 overflow-auto rounded-xl border border-border bg-slate-950 p-3 text-xs text-slate-200">
                      {JSON.stringify(decision.checksJson || {}, null, 2)}
                    </pre>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-border bg-black/20 p-4 text-sm text-muted">
                  No runtime policy decisions yet.
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

function Flag({ label, value }: { label: string; value: boolean }) {
  return (
    <div className={`rounded-xl px-3 py-2 ${value ? "bg-emerald-500/10 text-emerald-200" : "bg-slate-900 text-slate-400"}`}>
      {label}: {String(value)}
    </div>
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
