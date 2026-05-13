import { getPublishingExecutionDashboard } from "@/lib/sugent/publishing-execution/publishingExecutionEngine";
import { OmegaLogo } from "@/components/brand/OmegaLogo";

export default async function PublishingExecutionAdminPage() {
  const data = await getPublishingExecutionDashboard();

  return (
    <main className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex justify-center">
        <OmegaLogo className="h-16 w-auto object-contain" />
      </div>

      <section className="rounded-3xl border border-cyan-400/30 bg-cyan-500/10 p-6 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">
          v5.4 Real Publishing Execution
        </p>

        <h1 className="mt-3 text-4xl font-black text-white">
          Publishing Execution
        </h1>

        <p className="mx-auto mt-3 max-w-3xl text-sm leading-7 text-slate-200">
          Execute publishing attempts through connected OAuth accounts, track provider responses, retry failures, and store publish history.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-6">
        <Metric label="Attempts" value={String(data.summary.attempts)} />
        <Metric label="Queued" value={String(data.summary.queued)} />
        <Metric label="Published" value={String(data.summary.published)} />
        <Metric label="Failed" value={String(data.summary.failed)} />
        <Metric label="Webhooks" value={String(data.summary.webhookDeliveries)} />
        <Metric label="Connected" value={String(data.summary.connectedAccounts)} />
      </section>

      <section className="rounded-3xl border border-border bg-panel/70 p-5">
        <h2 className="text-xl font-black text-white">Create Execution Attempt</h2>

        <form action="/api/publishing-execution/attempts" method="POST" className="mt-4 grid gap-3 md:grid-cols-4">
          <input name="organizationId" placeholder="Organization ID" required className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none" />

          <select name="provider" defaultValue="youtube" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none">
            <option value="youtube">YouTube</option>
            <option value="tiktok">TikTok</option>
            <option value="instagram">Instagram</option>
            <option value="linkedin">LinkedIn</option>
            <option value="x">X</option>
          </select>

          <input name="title" defaultValue="OmegaCrownAI Phase 75 Test Publish" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none" />

          <button className="rounded-xl bg-cyan-600 px-5 py-3 text-sm font-black text-white hover:bg-cyan-500">
            Queue Attempt
          </button>
        </form>
      </section>

      <section className="rounded-3xl border border-border bg-panel/70 p-5">
        <h2 className="text-xl font-black text-white">Attempts</h2>

        <div className="mt-4 space-y-3">
          {data.attempts.length ? data.attempts.map((attempt: any) => (
            <div key={attempt.id} className="rounded-2xl border border-border bg-black/20 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="text-sm font-black text-white">{attempt.provider} · {attempt.status}</div>
                  <div className="mt-1 text-xs text-cyan-300">
                    attempt {attempt.attemptNumber}/{attempt.maxAttempts} · {attempt.providerPostUrl || "not published"}
                  </div>
                  <div className="mt-1 font-mono text-[11px] text-muted">{attempt.id}</div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {attempt.status !== "published" && attempt.status !== "cancelled" && (
                    <form action={`/api/publishing-execution/attempts/${attempt.id}/run`} method="POST">
                      <button className="rounded-xl bg-cyan-600 px-3 py-2 text-xs font-black text-white hover:bg-cyan-500">
                        Run
                      </button>
                    </form>
                  )}

                  {attempt.status === "failed" && (
                    <form action={`/api/publishing-execution/attempts/${attempt.id}/retry`} method="POST">
                      <button className="rounded-xl bg-yellow-500 px-3 py-2 text-xs font-black text-black hover:bg-yellow-400">
                        Retry
                      </button>
                    </form>
                  )}

                  {!["published", "cancelled"].includes(attempt.status) && (
                    <form action={`/api/publishing-execution/attempts/${attempt.id}/cancel`} method="POST">
                      <button className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs font-black text-red-100 hover:bg-red-500/20">
                        Cancel
                      </button>
                    </form>
                  )}
                </div>
              </div>

              <pre className="mt-3 max-h-40 overflow-auto rounded-xl border border-border bg-slate-950 p-3 text-xs text-slate-200">
                {JSON.stringify({ responseJson: attempt.responseJson, error: attempt.error, webhooks: attempt.webhookDeliveries }, null, 2)}
              </pre>
            </div>
          )) : (
            <div className="rounded-xl border border-border bg-slate-950 p-3 text-sm text-muted">
              No publishing execution attempts yet.
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-border bg-panel/70 p-5">
          <h2 className="text-xl font-black text-white">Connections</h2>
          <pre className="mt-4 max-h-96 overflow-auto rounded-xl border border-border bg-slate-950 p-4 text-xs text-slate-200">
            {JSON.stringify(data.connections, null, 2)}
          </pre>
        </div>

        <div className="rounded-3xl border border-border bg-panel/70 p-5">
          <h2 className="text-xl font-black text-white">Webhook Deliveries</h2>
          <pre className="mt-4 max-h-96 overflow-auto rounded-xl border border-border bg-slate-950 p-4 text-xs text-slate-200">
            {JSON.stringify(data.webhookDeliveries, null, 2)}
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
