import { getProviderSecretsDashboard } from "@/lib/sugent/provider-secrets/providerSecretsEngine";
import { OmegaLogo } from "@/components/brand/OmegaLogo";

export default async function ProviderSecretsPage() {
  const data = await getProviderSecretsDashboard();
  const safeData = data as any;

  return (
    <main className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex justify-center">
        <OmegaLogo className="h-16 w-auto object-contain" />
      </div>

      <section className="rounded-3xl border border-cyan-400/30 bg-cyan-500/10 p-6 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">
          v5.0 Production Environment + Secrets Vault
        </p>

        <h1 className="mt-3 text-4xl font-black text-white">
          Provider Secrets Vault
        </h1>

        <p className="mx-auto mt-3 max-w-3xl text-sm leading-7 text-slate-200">
          Manage provider environments, secret placeholders, live/test activation guards, rotation records, and production readiness.
        </p>

        <div className="mt-5 flex justify-center">
          <form action="/api/admin/provider-secrets/seed" method="POST">
            <button className="rounded-xl bg-cyan-600 px-5 py-3 text-sm font-black text-white hover:bg-cyan-500">
              Seed Provider Environments
            </button>
          </form>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-6">
        <Metric label="Environments" value={String(safeData.summary.environments)} />
        <Metric label="Ready" value={String(safeData.summary.ready)} />
        <Metric label="Configured" value={String(safeData.summary.configured)} />
        <Metric label="Blocked" value={String(safeData.summary.blocked)} />
        <Metric label="Secrets" value={String(safeData.summary.activeSecrets)} />
        <Metric label="Live Enabled" value={String(safeData.summary.liveEnabled)} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-border bg-panel/70 p-5">
          <h2 className="text-xl font-black text-white">Add / Rotate Secret</h2>

          <form action="/api/admin/provider-secrets/upsert" method="POST" className="mt-4 grid gap-3">
            <input name="provider" defaultValue="stripe" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none" />
            <input name="category" defaultValue="payment" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none" />

            <select name="mode" defaultValue="test" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none">
              <option value="test">Test</option>
              <option value="live">Live</option>
            </select>

            <input name="secretName" defaultValue="secret_key" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none" />
            <input name="secretType" defaultValue="api_key" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none" />
            <input name="value" placeholder="Paste secret value" required className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none" />
            <input name="reason" defaultValue="Phase 71 secret setup" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none" />

            <button className="rounded-xl bg-yellow-500 px-5 py-3 text-sm font-black text-black hover:bg-yellow-400">
              Save Secret
            </button>
          </form>
        </div>

        <div className="rounded-3xl border border-border bg-panel/70 p-5">
          <h2 className="text-xl font-black text-white">Activate Environment</h2>

          <form action="/api/admin/provider-environments/activation" method="POST" className="mt-4 grid gap-3">
            <input name="provider" defaultValue="stripe" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none" />
            <input name="category" defaultValue="payment" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none" />

            <select name="mode" defaultValue="test" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none">
              <option value="test">Test</option>
              <option value="live">Live</option>
            </select>

            <select name="testEnabled" defaultValue="true" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none">
              <option value="true">Test Enabled</option>
              <option value="false">Test Disabled</option>
            </select>

            <select name="liveEnabled" defaultValue="false" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none">
              <option value="false">Live Disabled</option>
              <option value="true">Live Enabled</option>
            </select>

            <input name="reason" defaultValue="Phase 71 activation guard test" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none" />

            <button className="rounded-xl bg-cyan-600 px-5 py-3 text-sm font-black text-white hover:bg-cyan-500">
              Update Activation
            </button>
          </form>
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-panel/70 p-5">
        <h2 className="text-xl font-black text-white">Provider Environments</h2>

        <div className="mt-4 space-y-3">
          {safeData.environments.map((environment: any) => (
            <div key={environment.id} className="rounded-2xl border border-border bg-black/20 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="text-sm font-black text-white">{environment.provider} · {environment.category} · {environment.mode}</div>
                  <div className="mt-1 text-xs text-cyan-300">
                    {environment.status} · live {String(environment.liveEnabled)} · test {String(environment.testEnabled)}
                  </div>
                  <div className="mt-1 font-mono text-[11px] text-muted">{environment.id}</div>
                </div>

                <form action="/api/admin/provider-environments/validate" method="POST" className="flex flex-wrap gap-2">
                  <input type="hidden" name="provider" value={environment.provider} />
                  <input type="hidden" name="category" value={environment.category} />
                  <input type="hidden" name="mode" value={environment.mode} />
                  <button className="rounded-xl bg-cyan-600 px-3 py-2 text-xs font-black text-white hover:bg-cyan-500">
                    Validate
                  </button>
                </form>
              </div>

              <pre className="mt-3 max-h-40 overflow-auto rounded-xl border border-border bg-slate-950 p-3 text-xs text-slate-200">
                {JSON.stringify(environment.validationJson || {}, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-panel/70 p-5">
        <h2 className="text-xl font-black text-white">Secrets</h2>

        <div className="mt-4 space-y-3">
          {safeData.secrets.length ? safeData.secrets.map((secret: any) => (
            <div key={secret.id} className="rounded-2xl border border-border bg-black/20 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="text-sm font-black text-white">{secret.provider} · {secret.secretName}</div>
                  <div className="mt-1 text-xs text-cyan-300">{secret.category} · {secret.mode} · {secret.status} · {secret.maskedValue}</div>
                  <div className="mt-1 font-mono text-[11px] text-muted">{secret.id}</div>
                </div>

                {secret.status === "active" && (
                  <form action={`/api/admin/provider-secrets/${secret.id}/revoke`} method="POST">
                    <button className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs font-black text-red-100 hover:bg-red-500/20">
                      Revoke
                    </button>
                  </form>
                )}
              </div>
            </div>
          )) : (
            <div className="rounded-xl border border-border bg-slate-950 p-3 text-sm text-muted">
              No provider secrets yet.
            </div>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-panel/70 p-5">
        <h2 className="text-xl font-black text-white">Rotations</h2>
        <pre className="mt-4 max-h-96 overflow-auto rounded-xl border border-border bg-slate-950 p-4 text-xs text-slate-200">
          {JSON.stringify(safeData.rotations, null, 2)}
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
