import { getExternalPaymentsDashboard } from "@/lib/sugent/external-payments/externalPaymentEngine";
import { OmegaLogo } from "@/components/brand/OmegaLogo";

export default async function ExternalPaymentsAdminPage() {
  const data = await getExternalPaymentsDashboard();

  return (
    <main className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex justify-center">
        <OmegaLogo className="h-16 w-auto object-contain" />
      </div>

      <section className="rounded-3xl border border-cyan-400/30 bg-cyan-500/10 p-6 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">
          v5.2 Square + SwipeSimple Payment Activation
        </p>

        <h1 className="mt-3 text-4xl font-black text-white">
          External Payment Links
        </h1>

        <p className="mx-auto mt-3 max-w-3xl text-sm leading-7 text-slate-200">
          Manage Square and SwipeSimple payment links, redirect attempts, manual confirmation, and subscription fallback.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-6">
        <Metric label="Links" value={String(data.summary.links)} />
        <Metric label="Active" value={String(data.summary.activeLinks)} />
        <Metric label="Square" value={String(data.summary.squareLinks)} />
        <Metric label="SwipeSimple" value={String(data.summary.swipeSimpleLinks)} />
        <Metric label="Attempts" value={String(data.summary.attempts)} />
        <Metric label="Confirmed" value={String(data.summary.confirmed)} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-border bg-panel/70 p-5">
          <h2 className="text-xl font-black text-white">Add Payment Link</h2>

          <form action="/api/external-payments/links" method="POST" className="mt-4 grid gap-3">
            <select name="provider" defaultValue="square" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none">
              <option value="square">Square</option>
              <option value="swipesimple">SwipeSimple</option>
              <option value="manual">Manual</option>
            </select>

            <input name="label" defaultValue="Pay with Square" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none" />
            <input name="paymentUrl" defaultValue="https://square.link/u/VEalNxqW" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none" />
            <input name="planTier" defaultValue="pro" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none" />
            <input name="description" defaultValue="OmegaCrownAI external payment link" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none" />

            <button className="rounded-xl bg-cyan-600 px-5 py-3 text-sm font-black text-white hover:bg-cyan-500">
              Save Link
            </button>
          </form>
        </div>

        <div className="rounded-3xl border border-border bg-panel/70 p-5">
          <h2 className="text-xl font-black text-white">Links</h2>
          <pre className="mt-4 max-h-80 overflow-auto rounded-xl border border-border bg-slate-950 p-4 text-xs text-slate-200">
            {JSON.stringify(data.links, null, 2)}
          </pre>
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-panel/70 p-5">
        <h2 className="text-xl font-black text-white">Attempts</h2>

        <div className="mt-4 space-y-3">
          {data.attempts.length ? data.attempts.map((attempt: any) => (
            <div key={attempt.id} className="rounded-2xl border border-border bg-black/20 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="text-sm font-black text-white">{attempt.provider} · {attempt.planTier} · {attempt.status}</div>
                  <div className="mt-1 text-xs text-cyan-300">{attempt.referenceCode}</div>
                  <div className="mt-1 break-all font-mono text-[11px] text-muted">{attempt.checkoutUrl}</div>
                </div>

                {!["paid", "manually_confirmed"].includes(attempt.status) && (
                  <form action={`/api/external-payments/attempts/${attempt.id}/confirm`} method="POST">
                    <button className="rounded-xl bg-yellow-500 px-3 py-2 text-xs font-black text-black hover:bg-yellow-400">
                      Confirm Manually
                    </button>
                  </form>
                )}
              </div>
            </div>
          )) : (
            <div className="rounded-xl border border-border bg-slate-950 p-3 text-sm text-muted">
              No payment attempts yet.
            </div>
          )}
        </div>
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
