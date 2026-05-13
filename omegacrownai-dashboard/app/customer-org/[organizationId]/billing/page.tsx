import { getOrganizationBillingDashboard } from "@/lib/sugent/customer-billing/customerPaymentProviderEngine";
import { OmegaLogo } from "@/components/brand/OmegaLogo";

export default async function CustomerBillingPage({
  params,
}: {
  params: Promise<{ organizationId: string }>;
}) {
  const { organizationId } = await params;
  const data = await getOrganizationBillingDashboard(organizationId);

  if (!data.ok) {
    return (
      <main className="p-6">
        <div className="rounded-3xl border border-red-400/30 bg-red-500/10 p-6 text-red-100">
          Billing organization not found.
        </div>
      
      <section className="rounded-3xl border border-yellow-400/30 bg-yellow-500/10 p-5">
        <h2 className="text-xl font-black text-white">Square / SwipeSimple Payments</h2>
        <p className="mt-2 text-sm leading-6 text-slate-200">
          Stripe remains available when Stripe test/live credentials are configured. You can also pay through Square or SwipeSimple using external payment links.
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <form action="/api/external-payments/checkout" method="POST">
            <input type="hidden" name="organizationId" value={organizationId} />
            <input type="hidden" name="provider" value="square" />
            <input type="hidden" name="planTier" value="pro" />
            <button className="rounded-xl bg-yellow-500 px-5 py-3 text-sm font-black text-black hover:bg-yellow-400">
              Pay with Square
            </button>
          </form>

          <form action="/api/external-payments/checkout" method="POST">
            <input type="hidden" name="organizationId" value={organizationId} />
            <input type="hidden" name="provider" value="swipesimple" />
            <input type="hidden" name="planTier" value="pro" />
            <button className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-5 py-3 text-sm font-black text-cyan-100 hover:bg-cyan-500/20">
              Pay with SwipeSimple
            </button>
          </form>
        </div>
      </section>

    </main>
    );
  }

  const summary = data.summary || {
    providers: 0,
    connectedProviders: 0,
    activeSubscription: null,
    supportedProviders: [],
  };

  const paymentProviders = (data as any).paymentProviders || [];
  const billingEvents = (data as any).billingEvents || [];
  const activeSubscription = summary.activeSubscription;

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex justify-center">
        <OmegaLogo className="h-16 w-auto object-contain" />
      </div>

      <section className="rounded-3xl border border-cyan-400/30 bg-cyan-500/10 p-6 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">
          v4.1 Optional Payment Provider Layer
        </p>

        <h1 className="mt-3 text-4xl font-black text-white">
          Billing Providers
        </h1>

        <p className="mx-auto mt-3 max-w-3xl text-sm leading-7 text-slate-200">
          Payment is optional. Keep manual billing active or connect Stripe, Square, or SwipeSimple later.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <Metric label="Providers" value={String(summary.providers)} />
        <Metric label="Connected" value={String(summary.connectedProviders)} />
        <Metric label="Plan" value={activeSubscription?.planTier || "none"} />
        <Metric label="Status" value={activeSubscription?.status || "none"} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-border bg-panel/70 p-5">
          <h2 className="text-xl font-black text-white">Connect Provider</h2>

          <form action={`/api/customer-org/${organizationId}/billing/provider`} method="POST" className="mt-4 grid gap-3">
            <select name="provider" defaultValue="manual" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none">
              <option value="manual">Manual Billing</option>
              <option value="stripe">Stripe</option>
              <option value="square">Square</option>
              <option value="swipesimple">SwipeSimple</option>
            </select>

            <select name="mode" defaultValue="test" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none">
              <option value="manual">Manual</option>
              <option value="test">Test</option>
              <option value="live">Live</option>
            </select>

            <button className="rounded-xl bg-cyan-600 px-5 py-3 text-sm font-black text-white hover:bg-cyan-500">
              Save Provider
            </button>
          </form>
        </div>

        <div className="rounded-3xl border border-border bg-panel/70 p-5">
          <h2 className="text-xl font-black text-white">Update Subscription</h2>

          <form action={`/api/customer-org/${organizationId}/billing/subscription`} method="POST" className="mt-4 grid gap-3">
            <select name="planTier" defaultValue={activeSubscription?.planTier || "starter"} className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none">
              <option value="free">Free</option>
              <option value="starter">Starter</option>
              <option value="pro">Pro</option>
              <option value="studio">Studio</option>
              <option value="enterprise">Enterprise</option>
            </select>

            <select name="provider" defaultValue={activeSubscription?.provider || "manual"} className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none">
              <option value="manual">Manual</option>
              <option value="stripe">Stripe</option>
              <option value="square">Square</option>
              <option value="swipesimple">SwipeSimple</option>
            </select>

            <select name="billingCycle" defaultValue={activeSubscription?.billingCycle || "manual"} className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none">
              <option value="manual">Manual</option>
              <option value="monthly">Monthly</option>
              <option value="annual">Annual</option>
            </select>

            <button className="rounded-xl bg-yellow-500 px-5 py-3 text-sm font-black text-black hover:bg-yellow-400">
              Update Subscription
            </button>
          </form>
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-panel/70 p-5">
        <h2 className="text-xl font-black text-white">Provider Records</h2>

        <div className="mt-4 space-y-3">
          {paymentProviders.length ? paymentProviders.map((provider: any) => (
            <div key={provider.id} className="rounded-2xl border border-border bg-black/20 p-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-sm font-black text-white">{provider.displayName || provider.provider}</div>
                  <div className="mt-1 text-xs text-cyan-300">{provider.provider} · {provider.status} · {provider.mode}</div>
                </div>
                <div className="font-mono text-xs text-muted">{provider.id}</div>
              </div>
            </div>
          )) : (
            <div className="rounded-xl border border-border bg-black/20 p-4 text-sm text-muted">
              No payment providers yet.
            </div>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-panel/70 p-5">
        <h2 className="text-xl font-black text-white">Billing Events</h2>

        <pre className="mt-4 max-h-96 overflow-auto rounded-xl border border-border bg-slate-950 p-4 text-xs text-slate-200">
          {JSON.stringify(billingEvents, null, 2)}
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
