import { getPremiumProviderDashboard } from "@/lib/sugent/customer-providers/customerPremiumProviderEngine";
import { OmegaLogo } from "@/components/brand/OmegaLogo";

export default async function CustomerProvidersPage({
  params,
}: {
  params: Promise<{ organizationId: string }>;
}) {
  const { organizationId } = await params;
  const data = await getPremiumProviderDashboard(organizationId);

  if (!data.ok) {
    return (
      <main className="p-6">
        <div className="rounded-3xl border border-red-400/30 bg-red-500/10 p-6 text-red-100">
          Provider organization not found.
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
          v4.5 Premium TTS / Image Provider Integration
        </p>

        <h1 className="mt-3 text-4xl font-black text-white">
          Premium Providers
        </h1>

        <p className="mx-auto mt-3 max-w-3xl text-sm leading-7 text-slate-200">
          Connect provider credentials, select TTS/image/video providers, run simulated generation, track usage, and validate fallback logic.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-6">
        <Metric label="Credentials" value={String(safeData.summary.credentials)} />
        <Metric label="Connected" value={String(safeData.summary.connectedCredentials)} />
        <Metric label="Runs" value={String(safeData.summary.runs)} />
        <Metric label="Completed" value={String(safeData.summary.completedRuns)} />
        <Metric label="TTS" value={String(safeData.summary.ttsProviders)} />
        <Metric label="Image" value={String(safeData.summary.imageProviders)} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-border bg-panel/70 p-5">
          <h2 className="text-xl font-black text-white">Connect Provider</h2>

          <form action={`/api/customer-org/${organizationId}/providers/credentials`} method="POST" className="mt-4 grid gap-3">
            <select name="provider" defaultValue="elevenlabs" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none">
              <option value="omega_native">Omega Native</option>
              <option value="elevenlabs">ElevenLabs</option>
              <option value="playht">PlayHT</option>
              <option value="aws_polly">AWS Polly</option>
              <option value="google_tts">Google TTS</option>
              <option value="stability">Stability</option>
              <option value="runway">Runway</option>
              <option value="pika">Pika</option>
            </select>

            <select name="category" defaultValue="tts" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none">
              <option value="tts">TTS</option>
              <option value="image">Image</option>
              <option value="video">Video</option>
              <option value="music">Music</option>
            </select>

            <input name="displayName" placeholder="Display name" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none" />
            <input name="apiKey" placeholder="API key placeholder" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none" />
            <input name="defaultModel" placeholder="Default model" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none" />
            <input name="defaultVoiceId" placeholder="Default voice ID" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none" />

            <button className="rounded-xl bg-cyan-600 px-5 py-3 text-sm font-black text-white hover:bg-cyan-500">
              Save Provider
            </button>
          </form>
        </div>

        <div className="rounded-3xl border border-border bg-panel/70 p-5">
          <h2 className="text-xl font-black text-white">Run Provider Generation</h2>

          <form action={`/api/customer-org/${organizationId}/providers/run`} method="POST" className="mt-4 grid gap-3">
            <select name="provider" defaultValue="elevenlabs" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none">
              <option value="omega_native">Omega Native</option>
              <option value="elevenlabs">ElevenLabs</option>
              <option value="playht">PlayHT</option>
              <option value="aws_polly">AWS Polly</option>
              <option value="google_tts">Google TTS</option>
              <option value="stability">Stability</option>
              <option value="runway">Runway</option>
              <option value="pika">Pika</option>
            </select>

            <select name="category" defaultValue="tts" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none">
              <option value="tts">TTS</option>
              <option value="image">Image</option>
              <option value="video">Video</option>
              <option value="music">Music</option>
            </select>

            <input name="outputType" defaultValue="tts" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none" />
            <textarea name="prompt" defaultValue="Welcome to OmegaCrownAI, the sovereign AI company operating system." className="min-h-28 rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none" />

            <button className="rounded-xl bg-yellow-500 px-5 py-3 text-sm font-black text-black hover:bg-yellow-400">
              Run Simulated Generation
            </button>
          </form>
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-panel/70 p-5">
        <h2 className="text-xl font-black text-white">Provider Registry</h2>

        <div className="mt-4 grid gap-3 md:grid-cols-4">
          {safeData.registry.map((item: any) => (
            <div key={item.provider} className="rounded-2xl border border-border bg-black/20 p-4">
              <div className="text-sm font-black text-white">{item.provider}</div>
              <div className="mt-1 text-xs text-cyan-300">{item.categories.join(", ")}</div>
              <div className="mt-2 font-mono text-[11px] text-muted">{item.defaultModel}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-panel/70 p-5">
        <h2 className="text-xl font-black text-white">Credentials</h2>

        <div className="mt-4 space-y-3">
          {safeData.credentials.length ? safeData.credentials.map((credential: any) => (
            <div key={credential.id} className="rounded-2xl border border-border bg-black/20 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="text-sm font-black text-white">{credential.displayName || credential.provider}</div>
                  <div className="mt-1 text-xs text-cyan-300">{credential.provider} · {credential.category} · {credential.status} · {credential.mode}</div>
                  <div className="mt-1 font-mono text-[11px] text-muted">{credential.id}</div>
                </div>

                {credential.status === "connected" && (
                  <form action={`/api/customer-org/${organizationId}/providers/credentials/${credential.id}/revoke`} method="POST">
                    <button className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs font-black text-red-100 hover:bg-red-500/20">
                      Revoke
                    </button>
                  </form>
                )}
              </div>
            </div>
          )) : (
            <div className="rounded-xl border border-border bg-slate-950 p-3 text-sm text-muted">
              No premium provider credentials yet.
            </div>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-panel/70 p-5">
        <h2 className="text-xl font-black text-white">Provider Runs</h2>

        <div className="mt-4 space-y-3">
          {safeData.runs.length ? safeData.runs.map((run: any) => (
            <div key={run.id} className="rounded-2xl border border-border bg-black/20 p-4">
              <div className="text-sm font-black text-white">{run.provider} · {run.category}</div>
              <div className="mt-1 text-xs text-cyan-300">{run.status} · {run.outputType || "output"}</div>
              <div className="mt-1 font-mono text-[11px] text-muted">{run.outputUrl || run.id}</div>
              <pre className="mt-3 max-h-56 overflow-auto rounded-xl border border-border bg-slate-950 p-3 text-xs text-slate-200">
                {JSON.stringify(run.responseJson || run.requestJson || {}, null, 2)}
              </pre>
            </div>
          )) : (
            <div className="rounded-xl border border-border bg-slate-950 p-3 text-sm text-muted">
              No provider runs yet.
            </div>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-panel/70 p-5">
        <h2 className="text-xl font-black text-white">Usage Events</h2>
        <pre className="mt-4 max-h-96 overflow-auto rounded-xl border border-border bg-slate-950 p-4 text-xs text-slate-200">
          {JSON.stringify(safeData.usageEvents, null, 2)}
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
