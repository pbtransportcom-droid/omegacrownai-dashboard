import Link from "next/link";
import { prisma } from "@/lib/db";
import { OmegaLogo } from "@/components/brand/OmegaLogo";
import { getDeploymentDashboard } from "@/lib/sugent/deployment/deploymentEngine";

export default async function DeploymentPage({
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
  const data = company ? await getDeploymentDashboard(company.id) : null;

  return (
    <main className="space-y-6">
      <div className="flex justify-center">
        <OmegaLogo className="h-16 w-auto object-contain" />
      </div>

      <section className="rounded-3xl border border-border bg-panel/70 p-6">
        <Link href={`/projects/${id}/company/executive`} className="text-sm text-cyan-300 hover:underline">
          ← Back to Executive Command Center
        </Link>

        <p className="mt-5 text-xs uppercase tracking-[0.25em] text-emerald-300">
          Sovereign Deployment + Enterprise Control · Phase 38
        </p>

        <h1 className="mt-3 text-4xl font-black text-white">
          Sovereign Deployment · {project?.name || "Project"}
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
          Production deployment profiles, signed release bundles, approval gates, rollback records, and runtime release history.
        </p>
      </section>

      {company && data ? (
        <>
          <section className="grid gap-4 md:grid-cols-4 xl:grid-cols-8">
            <Metric label="Profiles" value={String(data.summary.profiles)} />
            <Metric label="Releases" value={String(data.summary.releases)} />
            <Metric label="Approved" value={String(data.summary.approved)} />
            <Metric label="Deployed" value={String(data.summary.deployed)} />
            <Metric label="Rolled Back" value={String(data.summary.rolledBack)} />
            <Metric label="Deployments" value={String(data.summary.deployments)} />
            <Metric label="Completed" value={String(data.summary.completedDeployments)} />
            <Metric label="Sovereign" value={String(data.summary.sovereignProfiles)} />
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <section className="rounded-3xl border border-border bg-panel/70 p-5">
              <h2 className="text-xl font-black text-white">Create Deployment Profile</h2>

              <form
                action={`/api/company/${company.id}/deployment/profile`}
                method="POST"
                className="mt-4 grid gap-3"
              >
                <input
                  name="name"
                  defaultValue="OmegaCrownAI Production Profile"
                  className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none"
                />
                <input
                  name="environment"
                  defaultValue="production"
                  className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none"
                />
                <button className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-black text-white hover:bg-emerald-500">
                  Ensure Profile
                </button>
              </form>
            </section>

            <section className="rounded-3xl border border-border bg-panel/70 p-5">
              <h2 className="text-xl font-black text-white">Create Signed Release</h2>

              <form
                action={`/api/company/${company.id}/deployment/release`}
                method="POST"
                className="mt-4 grid gap-3"
              >
                <input
                  name="name"
                  defaultValue="OmegaCrownAI Sovereign Release"
                  className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none"
                />
                <input
                  name="version"
                  defaultValue="v2.22-phase38"
                  className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none"
                />
                <input
                  name="sourceRef"
                  defaultValue="main"
                  className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none"
                />
                <input
                  name="commitHash"
                  defaultValue="phase38-local"
                  className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none"
                />
                <button className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-black text-white hover:bg-emerald-500">
                  Create Release Bundle
                </button>
              </form>
            </section>
          </section>

          <section className="rounded-3xl border border-border bg-panel/70 p-5">
            <h2 className="text-xl font-black text-white">Deployment Profiles</h2>

            <div className="mt-4 space-y-3">
              {data.profiles.length ? (
                data.profiles.map((profile: any) => (
                  <div key={profile.id} className="rounded-2xl border border-border bg-black/20 p-4">
                    <div className="text-sm font-black text-white">{profile.name}</div>
                    <div className="mt-1 text-xs text-emerald-300">
                      {profile.environment} · {profile.status} · sovereign {String(profile.sovereignMode)}
                    </div>
                    <div className="mt-1 font-mono text-[11px] text-muted">{profile.id}</div>
                    <pre className="mt-3 max-h-40 overflow-auto rounded-xl border border-border bg-slate-950 p-3 text-xs text-slate-200">
                      {JSON.stringify(profile.rulesJson || {}, null, 2)}
                    </pre>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-border bg-black/20 p-4 text-sm text-muted">
                  No deployment profiles yet.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-panel/70 p-5">
            <h2 className="text-xl font-black text-white">Release Bundles</h2>

            <div className="mt-4 space-y-3">
              {data.releases.length ? (
                data.releases.map((release: any) => (
                  <div key={release.id} className="rounded-2xl border border-border bg-black/20 p-4">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                      <div>
                        <div className="text-sm font-black text-white">{release.name}</div>
                        <div className="mt-1 text-xs text-emerald-300">
                          {release.version} · {release.status}
                        </div>
                        <div className="mt-1 font-mono text-[11px] text-muted">{release.id}</div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <form action={`/api/company/${company.id}/deployment/release/${release.id}/approve`} method="POST">
                          <button className="rounded-xl border border-blue-400/30 bg-blue-500/10 px-3 py-2 text-xs font-black text-blue-100 hover:bg-blue-500/20">
                            Approve
                          </button>
                        </form>

                        <form action={`/api/company/${company.id}/deployment/release/${release.id}/deploy`} method="POST">
                          <button className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-xs font-black text-emerald-100 hover:bg-emerald-500/20">
                            Deploy
                          </button>
                        </form>

                        <form action={`/api/company/${company.id}/deployment/release/${release.id}/rollback`} method="POST">
                          <button className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs font-black text-red-100 hover:bg-red-500/20">
                            Rollback
                          </button>
                        </form>
                      </div>
                    </div>

                    <div className="mt-3 grid gap-2 text-xs">
                      <HashRow label="Bundle Hash" value={release.bundleHash} />
                      <HashRow label="Signature Hash" value={release.signatureHash || "none"} />
                      <HashRow label="Passport Hash" value={release.passportHash || "none"} />
                    </div>

                    <pre className="mt-3 max-h-48 overflow-auto rounded-xl border border-border bg-slate-950 p-3 text-xs text-slate-200">
                      {JSON.stringify(release.manifestJson || {}, null, 2)}
                    </pre>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-border bg-black/20 p-4 text-sm text-muted">
                  No release bundles yet.
                </div>
              )}
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <section className="rounded-3xl border border-border bg-panel/70 p-5">
              <h2 className="text-xl font-black text-white">Runtime Release History</h2>

              <div className="mt-4 space-y-3">
                {data.deployments.length ? (
                  data.deployments.map((run: any) => (
                    <div key={run.id} className="rounded-2xl border border-border bg-black/20 p-4">
                      <div className="text-sm font-black text-white">{run.release?.name || "Deployment"}</div>
                      <div className="mt-1 text-xs text-emerald-300">
                        {run.environment} · {run.status}
                      </div>
                      <div className="mt-1 font-mono text-[11px] text-muted">{run.id}</div>
                      <pre className="mt-3 max-h-40 overflow-auto rounded-xl border border-border bg-slate-950 p-3 text-xs text-slate-200">
                        {JSON.stringify(run.resultJson || run.logsJson || {}, null, 2)}
                      </pre>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-border bg-black/20 p-4 text-sm text-muted">
                    No deployment runs yet.
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-3xl border border-border bg-panel/70 p-5">
              <h2 className="text-xl font-black text-white">Rollback Records</h2>

              <div className="mt-4 space-y-3">
                {data.rollbacks.length ? (
                  data.rollbacks.map((rollback: any) => (
                    <div key={rollback.id} className="rounded-2xl border border-red-400/20 bg-red-500/10 p-4">
                      <div className="text-sm font-black text-white">{rollback.release?.name || "Rollback"}</div>
                      <div className="mt-1 text-xs text-red-200">{rollback.status}</div>
                      <div className="mt-1 font-mono text-[11px] text-muted">{rollback.id}</div>
                      <p className="mt-3 text-sm text-red-100">{rollback.reason}</p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-border bg-black/20 p-4 text-sm text-muted">
                    No rollback records yet.
                  </div>
                )}
              </div>
            </section>
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
