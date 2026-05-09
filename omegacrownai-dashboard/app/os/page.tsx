import { OSManifest } from "@/lib/sugent/osManifest";
import { CurrentRelease, ReleaseChannels } from "@/lib/sugent/release";
import { getSugentVersionString } from "@/lib/sugent/version";

export default function SugentOSPage() {
  return (
    <main className="space-y-6">
      <section className="rounded-3xl border border-border bg-panel/70 p-6">
        <p className="text-xs uppercase tracking-[0.25em] text-amber-300">
          Sugent OS Finalization
        </p>

        <h1 className="mt-3 text-4xl font-black text-white">
          Sugent OS v{getSugentVersionString()} · Crown
        </h1>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted">
          Stable operating system layer for Omega Crown AI: builders, runtime,
          cloud jobs, marketplace, memory, permissions, distribution, and replay.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <a href="/api/os/health" className="rounded-xl bg-amber-500 px-5 py-3 text-sm font-black text-slate-950 hover:bg-amber-400">
            Health API
          </a>
          <a href="/api/os/manifest" className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-5 py-3 text-sm font-black text-amber-100 hover:bg-amber-500/20">
            Manifest API
          </a>
          <a href="/api/os/version" className="rounded-xl border border-white/10 bg-black/20 px-5 py-3 text-sm font-black text-white hover:bg-white/10">
            Version API
          </a>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <Metric label="Version" value={getSugentVersionString()} />
        <Metric label="Release" value={CurrentRelease.channel} />
        <Metric label="Codename" value={OSManifest.version.codename} />
        <Metric label="Status" value={OSManifest.status} />
      </section>

      <section className="rounded-3xl border border-border bg-panel/70 p-5">
        <h2 className="text-xl font-black text-white">Modules</h2>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {OSManifest.modules.map((module) => (
            <div key={module} className="rounded-2xl border border-border bg-black/20 p-4">
              <div className="text-sm font-bold text-white">{module}</div>
              <div className="mt-1 text-xs text-emerald-300">active</div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-panel/70 p-5">
        <h2 className="text-xl font-black text-white">Release Channels</h2>
        <pre className="mt-4 overflow-auto rounded-xl border border-border bg-slate-950 p-4 text-xs text-slate-200">
          {JSON.stringify({ current: CurrentRelease, channels: ReleaseChannels }, null, 2)}
        </pre>
      </section>

      <section className="rounded-3xl border border-border bg-panel/70 p-5">
        <h2 className="text-xl font-black text-white">Stable v1 APIs</h2>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {[
            "/api/v1/brain/run",
            "/api/v1/cloud/jobs",
            "/api/v1/marketplace",
            "/api/v1/memory",
            "/api/v1/os/health",
          ].map((route) => (
            <div key={route} className="rounded-2xl border border-border bg-black/20 p-4">
              <div className="font-mono text-sm text-cyan-200">{route}</div>
              <div className="mt-1 text-xs text-muted">stable v1 wrapper</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-black/20 p-4">
      <div className="text-xs uppercase tracking-[0.18em] text-muted">{label}</div>
      <div className="mt-2 truncate text-xl font-black text-white">{value}</div>
    </div>
  );
}
