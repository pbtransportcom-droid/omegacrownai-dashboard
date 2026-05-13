import { getOAuthPublishingDashboard } from "@/lib/sugent/oauth-publishing/oauthPublishingEngine";
import { OmegaLogo } from "@/components/brand/OmegaLogo";

export default async function OAuthPublishingAdminPage() {
  const data = await getOAuthPublishingDashboard();

  return (
    <main className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex justify-center">
        <OmegaLogo className="h-16 w-auto object-contain" />
      </div>

      <section className="rounded-3xl border border-cyan-400/30 bg-cyan-500/10 p-6 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">
          v5.3 Real OAuth Publishing Activation
        </p>

        <h1 className="mt-3 text-4xl font-black text-white">
          OAuth Publishing Connections
        </h1>

        <p className="mx-auto mt-3 max-w-3xl text-sm leading-7 text-slate-200">
          Connect YouTube, TikTok, Instagram, LinkedIn, and X publishing accounts with OAuth state tracking, token storage placeholders, validation, and disconnect controls.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-6">
        <Metric label="Providers" value={String(data.summary.providers)} />
        <Metric label="Connected" value={String(data.summary.connected)} />
        <Metric label="Disconnected" value={String(data.summary.disconnected)} />
        <Metric label="Refresh Req." value={String(data.summary.refreshRequired)} />
        <Metric label="States" value={String(data.summary.states)} />
        <Metric label="YouTube" value={String(data.summary.youtube)} />
      </section>

      <section className="rounded-3xl border border-border bg-panel/70 p-5">
        <h2 className="text-xl font-black text-white">Create Connect URL</h2>

        <form action="/api/oauth/publishing/connect" method="POST" className="mt-4 grid gap-3 md:grid-cols-5">
          <input name="organizationId" placeholder="Organization ID" required className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none" />

          <select name="provider" defaultValue="youtube" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none">
            <option value="youtube">YouTube</option>
            <option value="tiktok">TikTok</option>
            <option value="instagram">Instagram</option>
            <option value="linkedin">LinkedIn</option>
            <option value="x">X</option>
          </select>

          <select name="mode" defaultValue="test" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none">
            <option value="test">Test</option>
            <option value="live">Live</option>
          </select>

          <input name="returnUrl" placeholder="Optional return URL" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none" />

          <button className="rounded-xl bg-cyan-600 px-5 py-3 text-sm font-black text-white hover:bg-cyan-500">
            Create URL
          </button>
        </form>
      </section>

      <section className="rounded-3xl border border-border bg-panel/70 p-5">
        <h2 className="text-xl font-black text-white">Connections</h2>

        <div className="mt-4 space-y-3">
          {data.connections.length ? data.connections.map((connection: any) => (
            <div key={connection.id} className="rounded-2xl border border-border bg-black/20 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="text-sm font-black text-white">
                    {connection.provider} · {connection.providerAccountHandle || connection.providerAccountName}
                  </div>
                  <div className="mt-1 text-xs text-cyan-300">{connection.mode} · {connection.status}</div>
                  <div className="mt-1 font-mono text-[11px] text-muted">{connection.id}</div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <form action={`/api/oauth/publishing/connections/${connection.id}/validate`} method="POST">
                    <button className="rounded-xl bg-cyan-600 px-3 py-2 text-xs font-black text-white hover:bg-cyan-500">
                      Validate
                    </button>
                  </form>

                  {connection.status !== "disconnected" && (
                    <form action={`/api/oauth/publishing/connections/${connection.id}/disconnect`} method="POST">
                      <button className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs font-black text-red-100 hover:bg-red-500/20">
                        Disconnect
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          )) : (
            <div className="rounded-xl border border-border bg-slate-950 p-3 text-sm text-muted">
              No OAuth publishing connections yet.
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-border bg-panel/70 p-5">
          <h2 className="text-xl font-black text-white">Providers</h2>
          <pre className="mt-4 max-h-96 overflow-auto rounded-xl border border-border bg-slate-950 p-4 text-xs text-slate-200">
            {JSON.stringify(data.providers, null, 2)}
          </pre>
        </div>

        <div className="rounded-3xl border border-border bg-panel/70 p-5">
          <h2 className="text-xl font-black text-white">Recent OAuth States</h2>
          <pre className="mt-4 max-h-96 overflow-auto rounded-xl border border-border bg-slate-950 p-4 text-xs text-slate-200">
            {JSON.stringify(data.states, null, 2)}
          </pre>
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
