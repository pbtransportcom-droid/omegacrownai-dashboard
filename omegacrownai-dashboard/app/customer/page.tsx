import { getCustomerDashboardByEmail } from "@/lib/sugent/customer-dashboard/customerDashboardEngine";
import { OmegaLogo } from "@/components/brand/OmegaLogo";

export default async function CustomerDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ email?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const email = params.email || "phase62-billing@omegacrownai.com";
  const data = await getCustomerDashboardByEmail(email);

  if (!data.ok) {
    return (
      <main className="mx-auto max-w-4xl p-6">
        <div className="rounded-3xl border border-red-400/30 bg-red-500/10 p-6 text-red-100">
          Customer not found. Start onboarding first.
        </div>
      </main>
    );
  }

  const safeData = data as any;

  return (
    <main className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex justify-center">
        <OmegaLogo className="h-16 w-auto object-contain" />
      </div>

      <section className="rounded-3xl border border-cyan-400/30 bg-cyan-500/10 p-6 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">
          v4.2 Customer Dashboard
        </p>

        <h1 className="mt-3 text-4xl font-black text-white">
          Welcome, {safeData.user.name || safeData.user.email}
        </h1>

        <p className="mx-auto mt-3 max-w-3xl text-sm leading-7 text-slate-200">
          Manage your organizations, onboarding status, billing providers, usage, profile, and API keys.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <Metric label="Organizations" value={String(safeData.summary.organizations)} />
        <Metric label="Active Orgs" value={String(safeData.summary.activeOrganizations)} />
        <Metric label="Onboarding Runs" value={String(safeData.summary.onboardingRuns)} />
        <Metric label="API Keys" value={String(safeData.summary.apiKeys)} />
      </section>

      <section className="rounded-3xl border border-border bg-panel/70 p-5">
        <h2 className="text-xl font-black text-white">Profile Settings</h2>

        <form action="/api/customer-user/profile" method="POST" className="mt-4 grid gap-3 md:grid-cols-4">
          <input type="hidden" name="userId" value={safeData.user.id} />

          <input name="name" defaultValue={safeData.user.name || ""} placeholder="Name" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none" />
          <input name="timezone" defaultValue={safeData.user.timezone || ""} placeholder="Timezone" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none" />
          <input name="locale" defaultValue={safeData.user.locale || "en-US"} placeholder="Locale" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none" />

          <button className="rounded-xl bg-cyan-600 px-5 py-3 text-sm font-black text-white hover:bg-cyan-500">
            Save Profile
          </button>
        </form>
      </section>

      <section className="space-y-5">
        {safeData.organizationDashboards.map((item: any) => {
          const org = item.organization;
          const activeSubscription = item.billing?.summary?.activeSubscription;
          const creatorUsage = item.creatorUsage?.summary?.usage || [];

          return (
            <div key={org.id} className="rounded-3xl border border-border bg-panel/70 p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-2xl font-black text-white">{org.name}</h2>
                  <p className="mt-1 font-mono text-xs text-muted">{org.id}</p>
                  <p className="mt-2 text-sm text-cyan-300">
                    Role: {item.membership?.role || "member"} · Status: {org.status} · Onboarding: {org.onboardingStatus}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <a href={`/customer-org/${org.id}/billing`} className="rounded-xl bg-yellow-500 px-4 py-2 text-xs font-black text-black hover:bg-yellow-400">
                    Billing
                  </a>
                  <a href={`/api/customer-org/${org.id}/dashboard`} className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-xs font-black text-cyan-100 hover:bg-cyan-500/20">
                    API
                  </a>
                </div>
              </div>

              <section className="mt-5 grid gap-4 md:grid-cols-4">
                <Metric label="Plan" value={activeSubscription?.planTier || "none"} />
                <Metric label="Billing" value={activeSubscription?.provider || "none"} />
                <Metric label="Billing Status" value={activeSubscription?.status || "none"} />
                <Metric label="Company Link" value={org.companyId ? "linked" : "not linked"} />
              </section>

              {!!creatorUsage.length && (
                <section className="mt-5 rounded-2xl border border-border bg-black/20 p-4">
                  <h3 className="text-sm font-black text-white">Creator Usage</h3>
                  <div className="mt-3 grid gap-3 md:grid-cols-4">
                    {creatorUsage.map((usage: any) => (
                      <div key={usage.usageType} className="rounded-xl border border-border bg-slate-950 p-3">
                        <div className="text-xs uppercase tracking-[0.18em] text-muted">{usage.usageType}</div>
                        <div className="mt-1 text-lg font-black text-white">{usage.used}/{usage.limit}</div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section className="mt-5 grid gap-5 lg:grid-cols-2">
                <div className="rounded-2xl border border-border bg-black/20 p-4">
                  <h3 className="text-sm font-black text-white">Organization Settings</h3>
                  <form action={`/api/customer-org/${org.id}/settings`} method="POST" className="mt-3 grid gap-3">
                    <input name="name" defaultValue={org.name} className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none" />
                    <button className="rounded-xl bg-cyan-600 px-4 py-3 text-xs font-black text-white hover:bg-cyan-500">
                      Save Organization
                    </button>
                  </form>
                </div>

                <div className="rounded-2xl border border-border bg-black/20 p-4">
                  <h3 className="text-sm font-black text-white">Create API Key</h3>
                  <form action={`/api/customer-org/${org.id}/api-keys`} method="POST" className="mt-3 grid gap-3">
                    <input name="name" defaultValue="Dashboard API Key" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none" />
                    <button className="rounded-xl bg-cyan-600 px-4 py-3 text-xs font-black text-white hover:bg-cyan-500">
                      Create API Key
                    </button>
                  </form>
                </div>
              </section>

              <section className="mt-5 rounded-2xl border border-border bg-black/20 p-4">
                <h3 className="text-sm font-black text-white">API Keys</h3>

                <div className="mt-3 space-y-2">
                  {(org.apiKeys || []).length ? org.apiKeys.map((key: any) => (
                    <div key={key.id} className="flex flex-col gap-2 rounded-xl border border-border bg-slate-950 p-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="text-sm font-bold text-white">{key.name}</div>
                        <div className="font-mono text-xs text-muted">{key.keyPrefix}… · {key.status}</div>
                      </div>
                      {key.status === "active" && (
                        <form action={`/api/customer-org/${org.id}/api-keys/${key.id}/revoke`} method="POST">
                          <button className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs font-black text-red-100 hover:bg-red-500/20">
                            Revoke
                          </button>
                        </form>
                      )}
                    </div>
                  )) : (
                    <div className="rounded-xl border border-border bg-slate-950 p-3 text-sm text-muted">
                      No API keys yet.
                    </div>
                  )}
                </div>
              </section>
            </div>
          );
        })}
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
