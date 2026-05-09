import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function ProjectRolesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [project, roles] = await Promise.all([
    prisma.project.findUnique({
      where: { id },
    }),
    prisma.userRole.findMany({
      where: { projectId: id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <main className="space-y-6">
      <div className="rounded-3xl border border-border bg-panel/70 p-6">
        <Link href={`/projects/${id}`} className="text-sm text-cyan-300 hover:underline">
          ← Back to project
        </Link>

        <p className="mt-5 text-xs uppercase tracking-[0.25em] text-red-300">
          Sugent OS Governance
        </p>

        <h1 className="mt-3 text-4xl font-black text-white">
          Roles · {project?.name || "Project"}
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
          Manage project-level access for builders, cloud jobs, marketplace installs, runtime controls, and memory.
        </p>
      </div>

      <form
        action={`/api/projects/${id}/roles`}
        method="POST"
        className="rounded-3xl border border-border bg-panel/70 p-5"
      >
        <h2 className="text-xl font-black text-white">Assign Role</h2>

        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_220px_auto]">
          <input
            name="userId"
            placeholder="User email or ID"
            className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-red-400"
          />

          <select
            name="role"
            defaultValue="viewer"
            className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-red-400"
          >
            <option value="owner">Owner</option>
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
            <option value="viewer">Viewer</option>
          </select>

          <button className="rounded-xl bg-red-600 px-5 py-3 text-sm font-black text-white hover:bg-red-500">
            Save Role
          </button>
        </div>
      </form>

      <section className="rounded-3xl border border-border bg-panel/70 p-5">
        <h2 className="text-xl font-black text-white">Current Roles</h2>

        <div className="mt-4 space-y-3">
          {roles.length ? (
            roles.map((role) => (
              <div key={role.id} className="rounded-2xl border border-border bg-black/20 p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="text-sm font-bold text-white">{role.userId}</div>
                    <div className="mt-1 text-xs text-muted">Project: {role.projectId}</div>
                  </div>

                  <div className="rounded-full border border-red-400/30 bg-red-500/10 px-3 py-1 text-xs font-bold text-red-100">
                    {role.role}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-border bg-black/20 p-4 text-sm text-muted">
              No roles assigned yet. Assign yourself as owner first.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
