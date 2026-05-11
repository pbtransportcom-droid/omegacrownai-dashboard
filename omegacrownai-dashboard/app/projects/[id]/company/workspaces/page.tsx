import Link from "next/link";
import { prisma } from "@/lib/db";
import { OmegaLogo } from "@/components/brand/OmegaLogo";
import { getWorkspaceDashboard } from "@/lib/sugent/workspaces/workspaceEngine";

export default async function WorkspacesPage({
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
  const data = company ? await getWorkspaceDashboard(company.id) : null;

  return (
    <main className="space-y-6">
      <div className="flex justify-center">
        <OmegaLogo className="h-16 w-auto object-contain" />
      </div>

      <section className="rounded-3xl border border-border bg-panel/70 p-6">
        <Link href={`/projects/${id}/company/executive`} className="text-sm text-cyan-300 hover:underline">
          ← Back to Executive Command Center
        </Link>

        <p className="mt-5 text-xs uppercase tracking-[0.25em] text-indigo-300">
          Team Workspaces + Permissions · Phase 24
        </p>

        <h1 className="mt-3 text-4xl font-black text-white">
          Workspaces · {project?.name || "Project"}
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
          Manage studio workspaces, members, roles, and permission boundaries for agents, editors, reviewers, renders, and publishing.
        </p>
      </section>

      {company && data ? (
        <>
          <section className="grid gap-4 md:grid-cols-3">
            <Metric label="Workspaces" value={String(data.summary.workspaces)} />
            <Metric label="Members" value={String(data.summary.members)} />
            <Metric label="Active" value={String(data.summary.active)} />
          </section>

          <section className="rounded-3xl border border-border bg-panel/70 p-5">
            <h2 className="text-xl font-black text-white">Permission Matrix</h2>

            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              {Object.entries(data.permissions).map(([role, permissions]) => (
                <div key={role} className="rounded-2xl border border-border bg-black/20 p-4">
                  <div className="text-sm font-black uppercase text-white">{role}</div>
                  <div className="mt-3 space-y-1">
                    {(permissions as string[]).map((permission) => (
                      <div key={permission} className="rounded-lg border border-indigo-400/20 bg-indigo-500/10 px-2 py-1 text-xs text-indigo-100">
                        {permission}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            {data.workspaces.map((workspace: any) => (
              <div key={workspace.id} className="rounded-3xl border border-border bg-panel/70 p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-white">{workspace.name}</h2>
                    <p className="mt-1 text-xs text-indigo-300">{workspace.status}</p>
                    <p className="mt-1 font-mono text-[11px] text-muted">{workspace.id}</p>
                  </div>

                  <form
                    action={`/api/company/${company.id}/workspaces/${workspace.id}/members`}
                    method="POST"
                    className="grid gap-2 md:grid-cols-3"
                  >
                    <input
                      name="userId"
                      placeholder="user id / email"
                      className="rounded-xl border border-border bg-slate-950 px-3 py-2 text-xs text-white outline-none"
                    />

                    <select
                      name="role"
                      defaultValue="viewer"
                      className="rounded-xl border border-border bg-slate-950 px-3 py-2 text-xs text-white outline-none"
                    >
                      <option value="owner">owner</option>
                      <option value="admin">admin</option>
                      <option value="editor">editor</option>
                      <option value="reviewer">reviewer</option>
                      <option value="viewer">viewer</option>
                    </select>

                    <button className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-black text-white hover:bg-indigo-500">
                      Add Member
                    </button>
                  </form>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {workspace.members.length ? (
                    workspace.members.map((member: any) => (
                      <div key={member.id} className="rounded-2xl border border-border bg-black/20 p-4">
                        <div className="text-sm font-black text-white">{member.userId}</div>
                        <div className="mt-1 text-xs text-indigo-300">{member.role}</div>
                        <div className="mt-1 text-xs text-muted">{member.status}</div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl border border-border bg-black/20 p-4 text-sm text-muted">
                      No members yet.
                    </div>
                  )}
                </div>
              </div>
            ))}
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
