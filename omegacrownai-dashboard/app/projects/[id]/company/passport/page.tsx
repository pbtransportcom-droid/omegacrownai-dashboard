import Link from "next/link";
import { prisma } from "@/lib/db";
import { OmegaLogo } from "@/components/brand/OmegaLogo";
import { getPassportDashboard } from "@/lib/sugent/passport/passportEngine";

export default async function PassportPage({
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
  const data = company ? await getPassportDashboard(company.id) : null;

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

        <p className="mt-5 text-xs uppercase tracking-[0.25em] text-violet-300">
          Platform Passport · Phase 36
        </p>

        <h1 className="mt-3 text-4xl font-black text-white">
          Platform Passport · {project?.name || "Project"}
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
          Signed platform and project identity bundles with verification proof, passport hashes, and audit-backed trust signals.
        </p>
      </section>

      {company && data ? (
        <>
          <section className="grid gap-4 md:grid-cols-5">
            <Metric label="Company Passports" value={String(data.summary.platformPassports)} />
            <Metric label="Project Passports" value={String(data.summary.projectPassports)} />
            <Metric label="Signatures" value={String(data.summary.signatures)} />
            <Metric label="Active Company" value={String(data.summary.activeCompanyPassports)} />
            <Metric label="Active Project" value={String(data.summary.activeProjectPassports)} />
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <section className="rounded-3xl border border-border bg-panel/70 p-5">
              <h2 className="text-xl font-black text-white">Issue Company Passport</h2>

              <form
                action={`/api/company/${company.id}/passport/issue-company`}
                method="POST"
                className="mt-4"
              >
                <button className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-black text-white hover:bg-violet-500">
                  Issue Company Passport
                </button>
              </form>
            </section>

            <section className="rounded-3xl border border-border bg-panel/70 p-5">
              <h2 className="text-xl font-black text-white">Issue Project Passport</h2>

              <form
                action={`/api/company/${company.id}/passport/issue-project`}
                method="POST"
                className="mt-4 grid gap-3"
              >
                <select
                  name="projectType"
                  defaultValue="video"
                  className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none"
                >
                  <option value="video">Video</option>
                  <option value="podcast">Podcast</option>
                </select>

                <select
                  name="projectId"
                  defaultValue=""
                  required
                  className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none"
                >
                  <option value="">Select video project</option>
                  {videoProjects.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title}
                    </option>
                  ))}
                </select>

                <button className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-black text-white hover:bg-violet-500">
                  Issue Project Passport
                </button>
              </form>
            </section>
          </section>

          <section className="rounded-3xl border border-border bg-panel/70 p-5">
            <h2 className="text-xl font-black text-white">Company Passports</h2>

            <div className="mt-4 space-y-3">
              {data.platformPassports.length ? (
                data.platformPassports.map((passport: any) => (
                  <PassportCard key={passport.id} passport={passport} companyId={company.id} />
                ))
              ) : (
                <div className="rounded-xl border border-border bg-black/20 p-4 text-sm text-muted">
                  No company passports yet.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-panel/70 p-5">
            <h2 className="text-xl font-black text-white">Project Passports</h2>

            <div className="mt-4 space-y-3">
              {data.projectPassports.length ? (
                data.projectPassports.map((passport: any) => (
                  <PassportCard key={passport.id} passport={passport} companyId={company.id} />
                ))
              ) : (
                <div className="rounded-xl border border-border bg-black/20 p-4 text-sm text-muted">
                  No project passports yet.
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

function PassportCard({ passport, companyId }: { passport: any; companyId: string }) {
  const signature = passport.signatures?.[0];

  return (
    <div className="rounded-2xl border border-border bg-black/20 p-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="text-sm font-black text-white">{passport.name}</div>
          <div className="mt-1 text-xs text-violet-300">{passport.status} · {passport.passportType || passport.projectType}</div>
          <div className="mt-1 font-mono text-[11px] text-muted">{passport.id}</div>
        </div>

        <form action={`/api/company/${companyId}/passport/verify`} method="POST">
          <input type="hidden" name="passportHash" value={passport.passportHash} />
          <button className="rounded-xl border border-violet-400/30 bg-violet-500/10 px-3 py-2 text-xs font-black text-violet-100 hover:bg-violet-500/20">
            Verify JSON
          </button>
        </form>
      </div>

      <div className="mt-3 grid gap-2 text-xs">
        <HashRow label="Passport Hash" value={passport.passportHash} />
        <HashRow label="Signature Hash" value={passport.signatureHash || signature?.signatureHash || "none"} />
      </div>

      <pre className="mt-3 max-h-64 overflow-auto rounded-xl border border-border bg-slate-950 p-3 text-xs text-slate-200">
        {JSON.stringify(passport.identityJson || {}, null, 2)}
      </pre>
    </div>
  );
}

function HashRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-border bg-slate-950 px-3 py-2 md:flex-row md:items-center md:justify-between">
      <span className="text-muted">{label}</span>
      <span className="break-all font-mono text-slate-200">{value}</span>
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
