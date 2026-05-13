import { getStripeBillingDashboard } from "@/lib/sugent/stripe-billing/stripeBillingEngine";
import { OmegaLogo } from "@/components/brand/OmegaLogo";

export default async function StripeBillingAdminPage() {
  const data = await getStripeBillingDashboard();

  return (
    <main className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex justify-center">
        <OmegaLogo className="h-16 w-auto object-contain" />
      </div>

      <section className="rounded-3xl border border-cyan-400/30 bg-cyan-500/10 p-6 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">
          v5.1 Live Stripe Billing Activation
        </p>

        <h1 className="mt-3 text-4xl font-black text-white">
          Stripe Billing Control
        </h1>

        <p className="mx-auto mt-3 max-w-3xl text-sm leading-7 text-slate-200">
          Create test-mode Checkout sessions, open Customer Portal sessions, sync webhook events, and enforce subscription plans.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-6">
        <Metric label="Customers" value={String(data.summary.customers)} />
        <Metric label="Subscriptions" value={String(data.summary.subscriptions)} />
        <Metric label="Active Subs" value={String(data.summary.activeSubscriptions)} />
        <Metric label="Sessions" value={String(data.summary.sessions)} />
        <Metric label="Events" value={String(data.summary.events)} />
        <Metric label="Failed Events" value={String(data.summary.failedEvents)} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-border bg-panel/70 p-5">
          <h2 className="text-xl font-black text-white">Create Checkout Session</h2>

          <form action="/api/stripe/checkout" method="POST" className="mt-4 grid gap-3">
            <input name="organizationId" placeholder="Organization ID" required className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none" />
            <input name="email" placeholder="Customer email" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none" />

            <select name="planTier" defaultValue="pro" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none">
              <option value="starter">Starter</option>
              <option value="pro">Pro</option>
              <option value="studio">Studio</option>
              <option value="enterprise">Enterprise</option>
            </select>

            <select name="mode" defaultValue="test" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none">
              <option value="test">Test</option>
              <option value="live">Live</option>
            </select>

            <button className="rounded-xl bg-cyan-600 px-5 py-3 text-sm font-black text-white hover:bg-cyan-500">
              Create Checkout
            </button>
          </form>
        </div>

        <div className="rounded-3xl border border-border bg-panel/70 p-5">
          <h2 className="text-xl font-black text-white">Plan Price Mapping</h2>
          <pre className="mt-4 max-h-80 overflow-auto rounded-xl border border-border bg-slate-950 p-4 text-xs text-slate-200">
            {JSON.stringify(data.plans, null, 2)}
          </pre>
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-panel/70 p-5">
        <h2 className="text-xl font-black text-white">Checkout Sessions</h2>
        <pre className="mt-4 max-h-96 overflow-auto rounded-xl border border-border bg-slate-950 p-4 text-xs text-slate-200">
          {JSON.stringify(data.sessions, null, 2)}
        </pre>
      </section>

      <section className="rounded-3xl border border-border bg-panel/70 p-5">
        <h2 className="text-xl font-black text-white">Stripe Subscriptions</h2>
        <pre className="mt-4 max-h-96 overflow-auto rounded-xl border border-border bg-slate-950 p-4 text-xs text-slate-200">
          {JSON.stringify(data.subscriptions, null, 2)}
        </pre>
      </section>

      <section className="rounded-3xl border border-border bg-panel/70 p-5">
        <h2 className="text-xl font-black text-white">Stripe Events</h2>
        <pre className="mt-4 max-h-96 overflow-auto rounded-xl border border-border bg-slate-950 p-4 text-xs text-slate-200">
          {JSON.stringify(data.events, null, 2)}
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
