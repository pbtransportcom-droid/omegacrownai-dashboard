import Link from "next/link";
import { prisma } from "@/lib/db";
import { OmegaLogo } from "@/components/brand/OmegaLogo";

export default async function CompanyDepartmentsPage({
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
      include: {
        departments: {
          orderBy: { createdAt: "asc" },
          include: {
            kpis: {
              orderBy: { timestamp: "desc" },
              take: 10,
            },
            memory: {
              orderBy: { createdAt: "desc" },
              take: 10,
            },
          },
        },
        tasks: {
          orderBy: { createdAt: "desc" },
          take: 50,
          include: { worker: true },
        },
      },
    }),
  ]);

  return (
    <main className="space-y-6">
      <div className="flex justify-center">
        <OmegaLogo className="h-16 w-auto object-contain" />
      </div>

      <section className="rounded-3xl border border-border bg-panel/70 p-6">
        <Link href={`/projects/${id}/company`} className="text-sm text-cyan-300 hover:underline">
          ← Back to Company OS
        </Link>

        <p className="mt-5 text-xs uppercase tracking-[0.25em] text-emerald-300">
          Sugent OS v2.0
        </p>

        <h1 className="mt-3 text-4xl font-black text-white">
          Department System · {project?.name || "Project"}
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
          Manage company departments, department KPIs, department memory, and department-routed tasks.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={`/projects/${id}/company/marketing`}
            className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-5 py-3 text-sm font-black text-amber-100 hover:bg-amber-500/20"
          >
            Marketing Engine
          </Link>

          <Link
            href={`/projects/${id}/company/sales`}
            className="rounded-xl border border-sky-400/30 bg-sky-500/10 px-5 py-3 text-sm font-black text-sky-100 hover:bg-sky-500/20"
          >
            Sales Engine
          </Link>

          <Link
            href={`/projects/${id}/company/finance`}
            className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-5 py-3 text-sm font-black text-emerald-100 hover:bg-emerald-500/20"
          >
            Finance Engine
          </Link>
        </div>
      </section>

      {companies.map((company) => (
        <section key={company.id} className="rounded-3xl border border-border bg-panel/70 p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-2xl font-black text-white">{company.name}</h2>
              <p className="mt-1 text-sm text-muted">{company.mission || "No mission set."}</p>
            </div>

            <form action={`/api/company/${company.id}/departments/seed`} method="POST">
              <button className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-xs font-black text-emerald-100 hover:bg-emerald-500/20">
                Seed Default Departments
              </button>
            </form>
          </div>

          <div className="mt-5 grid gap-4 xl:grid-cols-5">
            {company.departments.length ? (
              company.departments.map((department) => (
                <div key={department.id} className="rounded-2xl border border-border bg-black/20 p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-emerald-300">
                    {department.slug}
                  </div>

                  <h3 className="mt-2 text-xl font-black text-white">{department.name}</h3>
                  <p className="mt-2 min-h-16 text-xs leading-5 text-muted">
                    {department.purpose || "No purpose set."}
                  </p>

                  <div className="mt-3 text-xs text-muted">
                    KPIs {department.kpis.length} · Memory {department.memory.length}
                  </div>

                  <form
                    action={`/api/company/${company.id}/departments/${department.slug}/tasks`}
                    method="POST"
                    className="mt-4 space-y-2"
                  >
                    <input
                      name="message"
                      placeholder={`Task for ${department.name}`}
                      className="w-full rounded-xl border border-border bg-slate-950 px-3 py-2 text-xs text-white outline-none"
                    />
                    <button className="w-full rounded-xl bg-emerald-600 px-3 py-2 text-xs font-black text-white hover:bg-emerald-500">
                      Create Department Task
                    </button>
                  </form>

                  <div className="mt-4">
                    <Panel title="KPIs" value={department.kpis} />
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-border bg-black/20 p-4 text-sm text-muted xl:col-span-5">
                No departments yet. Click “Seed Default Departments”.
              </div>
            )}
          </div>

          <div className="mt-6 rounded-2xl border border-border bg-black/20 p-4">
            <h3 className="text-lg font-black text-white">Department Task Queue</h3>

            <div className="mt-4 space-y-3">
              {company.tasks.filter((task) => (task.input as any)?.departmentSlug).length ? (
                company.tasks
                  .filter((task) => (task.input as any)?.departmentSlug)
                  .map((task) => (
                    <div key={task.id} className="rounded-xl border border-border bg-slate-950 p-3">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <div className="text-sm font-bold text-white">
                            {(task.input as any)?.departmentName || (task.input as any)?.departmentSlug} · {task.type} · {task.status}
                          </div>
                          <div className="mt-1 font-mono text-xs text-muted">{task.id}</div>
                          <div className="mt-2 text-xs leading-5 text-muted">
                            {(task.input as any)?.message || "No message"}
                          </div>
                          {task.worker && (
                            <div className="mt-2 text-xs text-emerald-200">
                              Worker: {task.worker.name} / {task.worker.role}
                            </div>
                          )}
                        </div>

                        {task.status !== "success" && (
                          <form action={`/api/company/tasks/${task.id}/department-run`} method="POST">
                            <button className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-xs font-black text-emerald-100 hover:bg-emerald-500/20">
                              Run Department Task
                            </button>
                          </form>
                        )}
                      </div>

                      {task.output && (
                        <pre className="mt-3 max-h-56 overflow-auto rounded-lg border border-border bg-black/40 p-3 text-xs text-slate-200">
                          {JSON.stringify(task.output, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))
              ) : (
                <div className="rounded-xl border border-border bg-black/20 p-4 text-sm text-muted">
                  No department-routed tasks yet.
                </div>
              )}
            </div>
          </div>
        </section>
      ))}
    </main>
  );
}

function Panel({ title, value }: { title: string; value: any }) {
  return (
    <div className="rounded-xl border border-border bg-slate-950 p-3">
      <div className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-300">
        {title}
      </div>
      <pre className="mt-2 max-h-64 overflow-auto text-xs text-slate-200">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}
