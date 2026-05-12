import Link from "next/link";
import { prisma } from "@/lib/db";
import { OmegaLogo } from "@/components/brand/OmegaLogo";
import { listGovernanceDashboard } from "@/lib/sugent/governance/governanceEngine";

export default async function GovernancePage({
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
  const data = company ? await listGovernanceDashboard(company.id) : null;

  return (
    <main className="space-y-6">
      <div className="flex justify-center">
        <OmegaLogo className="h-16 w-auto object-contain" />
      </div>

      <section className="rounded-3xl border border-border bg-panel/70 p-6">
        <Link href={`/projects/${id}/company/executive`} className="text-sm text-cyan-300 hover:underline">
          ← Back to Executive Command Center
        </Link>

        <p className="mt-5 text-xs uppercase tracking-[0.25em] text-red-300">
          Multi-Tenant Governance Engine · Phase 37
        </p>

        <h1 className="mt-3 text-4xl font-black text-white">
          Governance Engine · {project?.name || "Project"}
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
          Tenant policies, role permissions, approval authority, sovereign access rules, and audit-backed authorization decisions.
        </p>
      </section>

      {company && data ? (
        <>
          <section className="grid gap-4 md:grid-cols-4 xl:grid-cols-7">
            <Metric label="Policies" value={String(data.summary.policies)} />
            <Metric label="Roles" value={String(data.summary.roles)} />
            <Metric label="Assignments" value={String(data.summary.assignments)} />
            <Metric label="Decisions" value={String(data.summary.decisions)} />
            <Metric label="Allowed" value={String(data.summary.allowed)} />
            <Metric label="Denied" value={String(data.summary.denied)} />
            <Metric label="Sovereignty" value={String(data.summary.sovereigntyLevel)} />
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <section className="rounded-3xl border border-border bg-panel/70 p-5">
              <h2 className="text-xl font-black text-white">Authorization Test</h2>

              <form
                action={`/api/company/${company.id}/governance/authorize`}
                method="POST"
                className="mt-4 grid gap-3"
              >
                <input
                  name="actorId"
                  defaultValue="system-owner"
                  className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none"
                />

                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    name="resource"
                    defaultValue="publish"
                    className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none"
                  />

                  <input
                    name="action"
                    defaultValue="execute"
                    className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none"
                  />
                </div>

                <button className="rounded-xl bg-red-600 px-5 py-3 text-sm font-black text-white hover:bg-red-500">
                  Run Authorization
                </button>
              </form>
            </section>

            <section className="rounded-3xl border border-border bg-panel/70 p-5">
              <h2 className="text-xl font-black text-white">Assign Role</h2>

              <form
                action={`/api/company/${company.id}/governance/assign-role`}
                method="POST"
                className="mt-4 grid gap-3"
              >
                <input
                  name="actorId"
                  placeholder="actor id"
                  className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none"
                />

                <select
                  name="roleSlug"
                  defaultValue="creative_lead"
                  className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none"
                >
                  {data.roles.map((role: any) => (
                    <option key={role.id} value={role.slug}>
                      {role.name} · authority {role.authorityLevel}
                    </option>
                  ))}
                </select>

                <button className="rounded-xl bg-red-600 px-5 py-3 text-sm font-black text-white hover:bg-red-500">
                  Assign Role
                </button>
              </form>
            </section>
          </section>

          <section className="rounded-3xl border border-border bg-panel/70 p-5">
            <h2 className="text-xl font-black text-white">Tenant</h2>
            <pre className="mt-4 max-h-72 overflow-auto rounded-xl border border-border bg-slate-950 p-4 text-xs text-slate-200">
              {JSON.stringify(data.tenant, null, 2)}
            </pre>
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <section className="rounded-3xl border border-border bg-panel/70 p-5">
              <h2 className="text-xl font-black text-white">Policies</h2>

              <div className="mt-4 space-y-3">
                {data.policies.map((policy: any) => (
                  <div key={policy.id} className="rounded-2xl border border-border bg-black/20 p-4">
                    <div className="text-sm font-black text-white">{policy.name}</div>
                    <div className="mt-1 text-xs text-red-300">
                      {policy.effect} · {policy.resource}:{policy.action} · priority {policy.priority}
                    </div>
                    <pre className="mt-3 max-h-32 overflow-auto rounded-xl bg-slate-950 p-3 text-xs text-slate-200">
                      {JSON.stringify(policy.conditions || {}, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-border bg-panel/70 p-5">
              <h2 className="text-xl font-black text-white">Roles</h2>

              <div className="mt-4 space-y-3">
                {data.roles.map((role: any) => (
                  <div key={role.id} className="rounded-2xl border border-border bg-black/20 p-4">
                    <div className="text-sm font-black text-white">{role.name}</div>
                    <div className="mt-1 text-xs text-red-300">
                      {role.slug} · authority {role.authorityLevel} · assignments {role.assignments.length}
                    </div>
                    <pre className="mt-3 max-h-32 overflow-auto rounded-xl bg-slate-950 p-3 text-xs text-slate-200">
                      {JSON.stringify(role.permissions || {}, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            </section>
          </section>

          <section className="rounded-3xl border border-border bg-panel/70 p-5">
            <h2 className="text-xl font-black text-white">Recent Decisions</h2>

            <div className="mt-4 space-y-3">
              {data.decisions.length ? (
                data.decisions.map((decision: any) => (
                  <div key={decision.id} className="rounded-2xl border border-border bg-black/20 p-4">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                      <div>
                        <div className="text-sm font-black text-white">
                          {decision.resource}:{decision.action}
                        </div>
                        <div className="mt-1 text-xs text-red-300">
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
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-border bg-black/20 p-4 text-sm text-muted">
                  No governance decisions yet.
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
