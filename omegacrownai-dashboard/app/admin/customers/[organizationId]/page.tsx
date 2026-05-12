import { getCustomerAdminOrganizationDetail } from "@/lib/sugent/customer-admin/customerAdminEngine";
import { OmegaLogo } from "@/components/brand/OmegaLogo";

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ organizationId: string }>;
}) {
  const { organizationId } = await params;
  const data = await getCustomerAdminOrganizationDetail(organizationId);

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

  return (
    <main className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex justify-center">
        <OmegaLogo className="h-16 w-auto object-contain" />
      </div>

      <section className="rounded-3xl border border-cyan-400/30 bg-cyan-500/10 p-6 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">
          Admin Customer Detail
        </p>

        <h1 className="mt-3 text-4xl font-black text-white">{org.name}</h1>
        <p className="mx-auto mt-3 max-w-3xl font-mono text-xs text-slate-200">{org.id}</p>
      </section>

      <section className="grid gap-4 md:grid-cols-5">
        <Metric label="Members" value={String(safeData.summary.members)} />
        <Metric label="Subscriptions" value={String(safeData.summary.subscriptions)} />
        <Metric label="Providers" value={String(safeData.summary.providers)} />
        <Metric label="Storage Assets" value={String(safeData.summary.storageAssets)} />
        <Metric label="Tickets" value={String(safeData.summary.tickets)} />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-border bg-panel/70 p-5">
          <h2 className="text-xl font-black text-white">Subscription Override</h2>

          <form action={`/api/admin/customers/${org.id}/subscription-override`} method="POST" className="mt-4 grid gap-3">
            <select name="planTier" defaultValue="pro" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none">
              <option value="free">Free</option>
              <option value="starter">Starter</option>
              <option value="pro">Pro</option>
              <option value="studio">Studio</option>
              <option value="enterprise">Enterprise</option>
            </select>

            <select name="status" defaultValue="manual" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none">
              <option value="manual">Manual</option>
              <option value="active">Active</option>
              <option value="trialing">Trialing</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <input name="reason" defaultValue="Admin override from Phase 68 console" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none" />

            <button className="rounded-xl bg-yellow-500 px-5 py-3 text-sm font-black text-black hover:bg-yellow-400">
              Override Subscription
            </button>
          </form>
        </div>

        <div className="rounded-3xl border border-border bg-panel/70 p-5">
          <h2 className="text-xl font-black text-white">Usage Reset Placeholder</h2>

          <form action={`/api/admin/customers/${org.id}/usage-reset`} method="POST" className="mt-4 grid gap-3">
            <input name="usageType" placeholder="render, video_export, all..." className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none" />
            <input name="reason" defaultValue="Admin usage reset test" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none" />

            <button className="rounded-xl bg-cyan-600 px-5 py-3 text-sm font-black text-white hover:bg-cyan-500">
              Record Reset Intent
            </button>
          </form>
        </div>

        <div className="rounded-3xl border border-border bg-panel/70 p-5">
          <h2 className="text-xl font-black text-white">Create Ticket</h2>

          <form action="/api/admin/support/tickets" method="POST" className="mt-4 grid gap-3">
            <input type="hidden" name="organizationId" value={org.id} />
            <input name="subject" defaultValue="Admin customer support test" required className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none" />
            <input name="description" defaultValue="Created from customer detail page." className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none" />

            <button className="rounded-xl bg-cyan-600 px-5 py-3 text-sm font-black text-white hover:bg-cyan-500">
              Create Ticket
            </button>
          </form>
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-panel/70 p-5">
        <h2 className="text-xl font-black text-white">Organization Snapshot</h2>
        <pre className="mt-4 max-h-96 overflow-auto rounded-xl border border-border bg-slate-950 p-4 text-xs text-slate-200">
          {JSON.stringify({ organization: org, tickets: safeData.tickets, abuseControls: safeData.abuseControls }, null, 2)}
        </pre>
      </section>

      <section className="rounded-3xl border border-border bg-panel/70 p-5">
        <h2 className="text-xl font-black text-white">Admin Actions</h2>
        <pre className="mt-4 max-h-96 overflow-auto rounded-xl border border-border bg-slate-950 p-4 text-xs text-slate-200">
          {JSON.stringify(safeData.adminActions, null, 2)}
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
