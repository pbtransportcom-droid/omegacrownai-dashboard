import { getCustomerAdminDashboard } from "@/lib/sugent/customer-admin/customerAdminEngine";
import { OmegaLogo } from "@/components/brand/OmegaLogo";

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const data = await getCustomerAdminDashboard({ q: params.q });

  return (
    <main className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex justify-center">
        <OmegaLogo className="h-16 w-auto object-contain" />
      </div>

      <section className="rounded-3xl border border-cyan-400/30 bg-cyan-500/10 p-6 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">
          v4.7 Admin Console + Customer Support Tools
        </p>

        <h1 className="mt-3 text-4xl font-black text-white">
          Customer Admin Console
        </h1>

        <p className="mx-auto mt-3 max-w-3xl text-sm leading-7 text-slate-200">
          Lookup customers, review organizations, override subscriptions, reset usage placeholders, manage support tickets, and apply abuse controls.
        </p>
      </section>

      <section className="rounded-3xl border border-border bg-panel/70 p-5">
        <form action="/admin/customers" method="GET" className="grid gap-3 md:grid-cols-[1fr_auto]">
          <input name="q" defaultValue={params.q || ""} placeholder="Search customer, email, organization, company ID..." className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none" />
          <button className="rounded-xl bg-cyan-600 px-5 py-3 text-sm font-black text-white hover:bg-cyan-500">
            Search
          </button>
        </form>
      </section>

      <section className="grid gap-4 md:grid-cols-5">
        <Metric label="Organizations" value={String(data.summary.organizations)} />
        <Metric label="Users" value={String(data.summary.users)} />
        <Metric label="Open Tickets" value={String(data.summary.openTickets)} />
        <Metric label="Abuse Controls" value={String(data.summary.activeAbuseControls)} />
        <Metric label="Admin Actions" value={String(data.summary.adminActions)} />
      </section>

      <section className="rounded-3xl border border-border bg-panel/70 p-5">
        <h2 className="text-xl font-black text-white">Organizations</h2>

        <div className="mt-4 space-y-3">
          {data.organizations.map((org: any) => (
            <div key={org.id} className="rounded-2xl border border-border bg-black/20 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="text-sm font-black text-white">{org.name}</div>
                  <div className="mt-1 text-xs text-cyan-300">{org.status} · onboarding {org.onboardingStatus}</div>
                  <div className="mt-1 font-mono text-[11px] text-muted">{org.id}</div>
                  <div className="mt-1 text-xs text-muted">
                    members {org.memberships?.length || 0}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <a href={`/admin/customers/${org.id}`} className="rounded-xl bg-yellow-500 px-3 py-2 text-xs font-black text-black hover:bg-yellow-400">
                    Admin Detail
                  </a>
                  <a href="/customer?email=phase62-billing@omegacrownai.com" className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-3 py-2 text-xs font-black text-cyan-100 hover:bg-cyan-500/20">
                    Customer View
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-border bg-panel/70 p-5">
          <h2 className="text-xl font-black text-white">Create Support Ticket</h2>

          <form action="/api/admin/support/tickets" method="POST" className="mt-4 grid gap-3">
            <input name="organizationId" placeholder="Organization ID" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none" />
            <input name="subject" placeholder="Subject" required className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none" />
            <textarea name="description" placeholder="Description" className="min-h-24 rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none" />

            <select name="category" defaultValue="technical" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none">
              <option value="technical">Technical</option>
              <option value="billing">Billing</option>
              <option value="account">Account</option>
              <option value="publishing">Publishing</option>
              <option value="storage">Storage</option>
              <option value="abuse">Abuse</option>
            </select>

            <select name="priority" defaultValue="normal" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none">
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>

            <button className="rounded-xl bg-cyan-600 px-5 py-3 text-sm font-black text-white hover:bg-cyan-500">
              Create Ticket
            </button>
          </form>
        </div>

        <div className="rounded-3xl border border-border bg-panel/70 p-5">
          <h2 className="text-xl font-black text-white">Create Abuse Control</h2>

          <form action="/api/admin/abuse-controls" method="POST" className="mt-4 grid gap-3">
            <input name="organizationId" placeholder="Organization ID" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none" />

            <select name="controlType" defaultValue="review_required" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none">
              <option value="review_required">Review Required</option>
              <option value="suspend_org">Suspend Organization</option>
              <option value="suspend_user">Suspend User</option>
              <option value="block_publishing">Block Publishing</option>
              <option value="storage_hold">Storage Hold</option>
            </select>

            <select name="severity" defaultValue="warning" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none">
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
            </select>

            <textarea name="reason" placeholder="Reason" className="min-h-24 rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none" />

            <button className="rounded-xl bg-red-600 px-5 py-3 text-sm font-black text-white hover:bg-red-500">
              Apply Control
            </button>
          </form>
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-panel/70 p-5">
        <h2 className="text-xl font-black text-white">Recent Support Tickets</h2>
        <pre className="mt-4 max-h-96 overflow-auto rounded-xl border border-border bg-slate-950 p-4 text-xs text-slate-200">
          {JSON.stringify(data.tickets, null, 2)}
        </pre>
      </section>

      <section className="rounded-3xl border border-border bg-panel/70 p-5">
        <h2 className="text-xl font-black text-white">Recent Admin Actions</h2>
        <pre className="mt-4 max-h-96 overflow-auto rounded-xl border border-border bg-slate-950 p-4 text-xs text-slate-200">
          {JSON.stringify(data.adminActions, null, 2)}
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
