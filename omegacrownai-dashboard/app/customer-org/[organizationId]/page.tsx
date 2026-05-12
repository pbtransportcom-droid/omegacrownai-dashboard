import { getCustomerDashboardByOrganization } from "@/lib/sugent/customer-dashboard/customerDashboardEngine";
import { OmegaLogo } from "@/components/brand/OmegaLogo";

export default async function CustomerOrganizationPage({
  params,
}: {
  params: Promise<{ organizationId: string }>;
}) {
  const { organizationId } = await params;
  const data = await getCustomerDashboardByOrganization(organizationId);

  if (!data.ok) {
    return (
      <main className="p-6">
        <div className="rounded-3xl border border-red-400/30 bg-red-500/10 p-6 text-red-100">
          Customer organization not found.
        </div>
      </main>
    );
  }

  const safeData = data as any;
  const org = safeData.organization;
  const activeSubscription = safeData.billing?.summary?.activeSubscription;
  const creatorUsage = safeData.creatorUsage?.summary?.usage || [];

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex justify-center">
        <OmegaLogo className="h-16 w-auto object-contain" />
      </div>

      <section className="rounded-3xl border border-cyan-400/30 bg-cyan-500/10 p-6 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">
          Customer Organization
        </p>
        <h1 className="mt-3 text-4xl font-black text-white">{org.name}</h1>
        <p className="mx-auto mt-3 max-w-3xl font-mono text-xs text-slate-200">{org.id}</p>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <Metric label="Members" value={String(safeData.summary.members)} />
        <Metric label="Onboarding" value={org.onboardingStatus} />
        <Metric label="Plan" value={activeSubscription?.planTier || "none"} />
        <Metric label="API Keys" value={String(safeData.summary.apiKeys)} />
      </section>

      <section className="rounded-3xl border border-border bg-panel/70 p-5">
        <h2 className="text-xl font-black text-white">Usage</h2>

        <div className="mt-4 grid gap-3 md:grid-cols-4">
          {creatorUsage.length ? creatorUsage.map((usage: any) => (
            <div key={usage.usageType} className="rounded-xl border border-border bg-slate-950 p-3">
              <div className="text-xs uppercase tracking-[0.18em] text-muted">{usage.usageType}</div>
              <div className="mt-1 text-lg font-black text-white">{usage.used}/{usage.limit}</div>
              <div className="mt-1 text-xs text-muted">{usage.remaining} remaining</div>
            </div>
          )) : (
            <div className="rounded-xl border border-border bg-slate-950 p-3 text-sm text-muted">
              Creator usage will appear after this organization links to a company/workspace.
            </div>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-panel/70 p-5">
        <h2 className="text-xl font-black text-white">Organization JSON</h2>
        <pre className="mt-4 max-h-96 overflow-auto rounded-xl border border-border bg-slate-950 p-4 text-xs text-slate-200">
          {JSON.stringify({ organization: org, billing: safeData.billing?.summary, summary: safeData.summary }, null, 2)}
        </pre>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-panel/70 p-4">
      <div className="text-xs uppercase tracking-[0.18em] text-muted">{label}</div>
      <div className="mt-2 truncate text-2xl font-black text-white">{value}</div>
    </div>
  );
}
