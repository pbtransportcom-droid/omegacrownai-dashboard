import { getPremiumProviderActivationDashboard } from "@/lib/sugent/premium-provider-activation/premiumProviderActivationEngine";
import { OmegaLogo } from "@/components/brand/OmegaLogo";

export default async function PremiumProvidersAdminPage() {
  const data = await getPremiumProviderActivationDashboard();

  return (
    <main className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex justify-center">
        <OmegaLogo className="h-16 w-auto object-contain" />
      </div>

      <section className="rounded-3xl border border-cyan-400/30 bg-cyan-500/10 p-6 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">
          v5.5 Real Premium Provider API Activation
        </p>

        <h1 className="mt-3 text-4xl font-black text-white">
          Premium Provider Activation
        </h1>

        <p className="mx-auto mt-3 max-w-3xl text-sm leading-7 text-slate-200">
          Run ElevenLabs, PlayHT, AWS Polly, Google TTS, Stability, Runway, and Pika through provider adapters with fallback logic, usage tracking, and response history.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-6">
        <Metric label="Adapters" value={String(data.summary.adapters)} />
        <Metric label="Runs" value={String(data.summary.runs)} />
        <Metric label="Completed" value={String(data.summary.completed)} />
        <Metric label="Fallback" value={String(data.summary.fallback)} />
        <Metric label="Units" value={String(data.summary.unitsUsed)} />
        <Metric label="Cost" value={`$${(data.summary.estimatedCostCents / 100).toFixed(2)}`} />
      </section>

      <section className="rounded-3xl border border-border bg-panel/70 p-5">
        <h2 className="text-xl font-black text-white">Run Provider</h2>

        <form action="/api/premium-provider-activation/run" method="POST" className="mt-4 grid gap-3 md:grid-cols-4">
          <input name="organizationId" placeholder="Organization ID" required className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none" />

          <select name="category" defaultValue="tts" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none">
            <option value="tts">TTS</option>
            <option value="image">Image</option>
            <option value="video">Video</option>
          </select>

          <select name="provider" defaultValue="elevenlabs" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none">
            <option value="elevenlabs">ElevenLabs</option>
            <option value="playht">PlayHT</option>
            <option value="aws_polly">AWS Polly</option>
            <option value="google_tts">Google TTS</option>
            <option value="stability">Stability</option>
            <option value="runway">Runway</option>
            <option value="pika">Pika</option>
            <option value="omega_native">Omega Native</option>
          </select>

          <select name="mode" defaultValue="test" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none">
            <option value="test">Test</option>
            <option value="live">Live</option>
          </select>

          <textarea name="prompt" defaultValue="OmegaCrownAI Phase 76 premium provider test." className="min-h-24 rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none md:col-span-3" />

          <button className="rounded-xl bg-cyan-600 px-5 py-3 text-sm font-black text-white hover:bg-cyan-500">
            Run Provider
          </button>
        </form>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-border bg-panel/70 p-5">
          <h2 className="text-xl font-black text-white">Adapters</h2>
          <pre className="mt-4 max-h-96 overflow-auto rounded-xl border border-border bg-slate-950 p-4 text-xs text-slate-200">
            {JSON.stringify(data.adapters, null, 2)}
          </pre>
        </div>

        <div className="rounded-3xl border border-border bg-panel/70 p-5">
          <h2 className="text-xl font-black text-white">Usage</h2>
          <pre className="mt-4 max-h-96 overflow-auto rounded-xl border border-border bg-slate-950 p-4 text-xs text-slate-200">
            {JSON.stringify(data.usage, null, 2)}
          </pre>
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-panel/70 p-5">
        <h2 className="text-xl font-black text-white">Runs</h2>

        <div className="mt-4 space-y-3">
          {data.runs.length ? data.runs.map((run: any) => (
            <div key={run.id} className="rounded-2xl border border-border bg-black/20 p-4">
              <div className="text-sm font-black text-white">{run.provider} · {run.category} · {run.status}</div>
              <div className="mt-1 text-xs text-cyan-300">
                fallback {String(run.usedFallback)} · units {run.unitsUsed} · output {run.outputUrl || "none"}
              </div>
              <pre className="mt-3 max-h-40 overflow-auto rounded-xl border border-border bg-slate-950 p-3 text-xs text-slate-200">
                {JSON.stringify({ responseJson: run.responseJson, error: run.error }, null, 2)}
              </pre>
            </div>
          )) : (
            <div className="rounded-xl border border-border bg-slate-950 p-3 text-sm text-muted">
              No premium provider runs yet.
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
