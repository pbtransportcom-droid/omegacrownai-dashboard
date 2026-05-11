import Link from "next/link";
import { prisma } from "@/lib/db";
import { OmegaLogo } from "@/components/brand/OmegaLogo";

export default async function MarketingDashboardPage({
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
          where: { slug: "marketing" },
          take: 1,
        },
      },
    }),
  ]);

  const company = companies[0] || null;

  const campaigns = company
    ? await prisma.marketingCampaign.findMany({
        where: { companyId: company.id },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: { assets: true },
      })
    : [];

  const audiences = company
    ? await prisma.marketingAudience.findMany({
        where: { companyId: company.id },
        orderBy: { createdAt: "desc" },
        take: 50,
      })
    : [];

  return (
    <main className="space-y-6">
      <div className="flex justify-center">
        <OmegaLogo className="h-16 w-auto object-contain" />
      </div>

      <section className="rounded-3xl border border-border bg-panel/70 p-6">
        <Link href={`/projects/${id}/company/departments`} className="text-sm text-cyan-300 hover:underline">
          ← Back to Departments
        </Link>

        <p className="mt-5 text-xs uppercase tracking-[0.25em] text-amber-300">
          Marketing Department Engine
        </p>

        <h1 className="mt-3 text-4xl font-black text-white">
          Marketing Engine · {project?.name || "Project"}
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
          Generate campaigns, audiences, lead-generation plans, landing copy, email copy, social posts, and ad assets.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={`/projects/${id}/company/video`}
            className="rounded-xl border border-fuchsia-400/30 bg-fuchsia-500/10 px-5 py-3 text-sm font-black text-fuchsia-100 hover:bg-fuchsia-500/20"
          >
            Video Studio
          </Link>
        </div>
      </section>

      {company ? (
        <>
          <section className="grid gap-4 md:grid-cols-4">
            <Metric label="Campaigns" value={String(campaigns.length)} />
            <Metric label="Assets" value={String(campaigns.reduce((sum, campaign) => sum + campaign.assets.length, 0))} />
            <Metric label="Audiences" value={String(audiences.length)} />
            <Metric label="Ready" value={String(campaigns.filter((campaign) => campaign.status === "ready").length)} />
          </section>

          <section className="rounded-3xl border border-border bg-panel/70 p-5">
            <h2 className="text-xl font-black text-white">Create Campaign</h2>

            <form
              action={`/api/company/${company.id}/marketing/campaigns`}
              method="POST"
              className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5"
            >
              <input
                name="name"
                placeholder="Campaign name"
                className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none"
              />

              <input
                name="objective"
                placeholder="Objective"
                className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none xl:col-span-2"
              />

              <input
                name="offer"
                placeholder="Offer"
                className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none"
              />

              <button className="rounded-xl bg-amber-600 px-5 py-3 text-sm font-black text-white hover:bg-amber-500">
                Generate Campaign
              </button>
            </form>
          </section>

          <section className="space-y-4">
            {campaigns.length ? (
              campaigns.map((campaign) => (
                <div key={campaign.id} className="rounded-3xl border border-border bg-panel/70 p-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h2 className="text-2xl font-black text-white">{campaign.name}</h2>
                      <p className="mt-2 text-sm text-muted">{campaign.objective}</p>
                      <p className="mt-1 font-mono text-xs text-muted">{campaign.id}</p>
                    </div>

                    <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-xs font-bold text-amber-100">
                      {campaign.status}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 xl:grid-cols-2">
                    <Panel title="Brief" value={campaign.brief || {}} />
                    <Panel title="Metrics" value={campaign.metrics || {}} />
                  </div>

                  <div className="mt-4 grid gap-4 xl:grid-cols-4">
                    {campaign.assets.map((asset) => (
                      <div key={asset.id} className="rounded-2xl border border-border bg-slate-950 p-4">
                        <div className="text-xs uppercase tracking-[0.16em] text-amber-300">
                          {asset.type} · {asset.channel || "general"}
                        </div>
                        <h3 className="mt-2 text-sm font-black text-white">{asset.title}</h3>
                        <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap text-xs leading-5 text-slate-200">
                          {asset.content}
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-border bg-black/20 p-5 text-sm text-muted">
                No marketing campaigns yet.
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

function Panel({ title, value }: { title: string; value: any }) {
  return (
    <div className="rounded-xl border border-border bg-slate-950 p-3">
      <div className="text-xs font-bold uppercase tracking-[0.16em] text-amber-300">
        {title}
      </div>
      <pre className="mt-2 max-h-72 overflow-auto text-xs text-slate-200">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}
