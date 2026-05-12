import { getCustomerPublishingDashboard } from "@/lib/sugent/customer-publishing/customerPublishingEngine";
import { OmegaLogo } from "@/components/brand/OmegaLogo";

export default async function CustomerPublishingPage({
  params,
}: {
  params: Promise<{ organizationId: string }>;
}) {
  const { organizationId } = await params;
  const data = await getCustomerPublishingDashboard(organizationId);

  if (!data.ok) {
    return (
      <main className="p-6">
        <div className="rounded-3xl border border-red-400/30 bg-red-500/10 p-6 text-red-100">
          Publishing organization not found.
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
          v4.4 Real External Publishing Integrations
        </p>

        <h1 className="mt-3 text-4xl font-black text-white">
          Publishing Integrations
        </h1>

        <p className="mx-auto mt-3 max-w-3xl text-sm leading-7 text-slate-200">
          Connect provider accounts, prepare publishing jobs, and simulate provider-ready publish execution.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-6">
        <Metric label="Accounts" value={String(safeData.summary.accounts)} />
        <Metric label="Connected" value={String(safeData.summary.connectedAccounts)} />
        <Metric label="Jobs" value={String(safeData.summary.jobs)} />
        <Metric label="Queued" value={String(safeData.summary.queued)} />
        <Metric label="Published" value={String(safeData.summary.published)} />
        <Metric label="Failed" value={String(safeData.summary.failed)} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-border bg-panel/70 p-5">
          <h2 className="text-xl font-black text-white">Connect Publishing Account</h2>

          <form action={`/api/customer-org/${organizationId}/publishing/accounts`} method="POST" className="mt-4 grid gap-3">
            <select name="provider" defaultValue="youtube" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none">
              <option value="youtube">YouTube</option>
              <option value="tiktok">TikTok</option>
              <option value="instagram">Instagram</option>
              <option value="linkedin">LinkedIn</option>
              <option value="x">X</option>
              <option value="webhook">Webhook</option>
              <option value="s3">S3 Export</option>
              <option value="gcs">GCS Export</option>
            </select>

            <input name="displayName" placeholder="Display name" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none" />
            <input name="externalAccountId" placeholder="External account ID / channel ID" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none" />

            <select name="mode" defaultValue="test" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none">
              <option value="test">Test</option>
              <option value="live">Live</option>
            </select>

            <button className="rounded-xl bg-cyan-600 px-5 py-3 text-sm font-black text-white hover:bg-cyan-500">
              Save Account
            </button>
          </form>
        </div>

        <div className="rounded-3xl border border-border bg-panel/70 p-5">
          <h2 className="text-xl font-black text-white">Queue Publish Job</h2>

          <form action={`/api/customer-org/${organizationId}/publishing/jobs`} method="POST" className="mt-4 grid gap-3">
            <select name="provider" defaultValue="youtube" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none">
              <option value="youtube">YouTube</option>
              <option value="tiktok">TikTok</option>
              <option value="instagram">Instagram</option>
              <option value="linkedin">LinkedIn</option>
              <option value="x">X</option>
              <option value="webhook">Webhook</option>
              <option value="s3">S3 Export</option>
              <option value="gcs">GCS Export</option>
            </select>

            <input name="title" defaultValue="OmegaCrownAI Publish Job" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none" />
            <input name="mediaUrl" placeholder="/exports/company/file.mp4" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none" />
            <input name="destinationUrl" placeholder="Webhook/cloud destination URL" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none" />
            <textarea name="caption" placeholder="Caption" className="min-h-24 rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none" />

            <button className="rounded-xl bg-yellow-500 px-5 py-3 text-sm font-black text-black hover:bg-yellow-400">
              Queue Job
            </button>
          </form>
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-panel/70 p-5">
        <h2 className="text-xl font-black text-white">Connected Accounts</h2>

        <div className="mt-4 space-y-3">
          {safeData.accounts.length ? safeData.accounts.map((account: any) => (
            <div key={account.id} className="rounded-2xl border border-border bg-black/20 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="text-sm font-black text-white">{account.displayName || account.provider}</div>
                  <div className="mt-1 text-xs text-cyan-300">{account.provider} · {account.category} · {account.status} · {account.mode}</div>
                  <div className="mt-1 font-mono text-[11px] text-muted">{account.id}</div>
                </div>

                {account.status === "connected" && (
                  <form action={`/api/customer-org/${organizationId}/publishing/accounts/${account.id}/disconnect`} method="POST">
                    <button className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs font-black text-red-100 hover:bg-red-500/20">
                      Disconnect
                    </button>
                  </form>
                )}
              </div>
            </div>
          )) : (
            <div className="rounded-xl border border-border bg-slate-950 p-3 text-sm text-muted">
              No publishing accounts yet.
            </div>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-panel/70 p-5">
        <h2 className="text-xl font-black text-white">Publishing Jobs</h2>

        <div className="mt-4 space-y-3">
          {safeData.jobs.length ? safeData.jobs.map((job: any) => (
            <div key={job.id} className="rounded-2xl border border-border bg-black/20 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="text-sm font-black text-white">{job.title || "Publishing Job"}</div>
                  <div className="mt-1 text-xs text-cyan-300">{job.provider} · {job.targetType} · {job.status}</div>
                  <div className="mt-1 font-mono text-[11px] text-muted">{job.id}</div>
                </div>

                {job.status === "queued" && (
                  <form action={`/api/customer-org/${organizationId}/publishing/jobs/${job.id}/run`} method="POST">
                    <button className="rounded-xl bg-cyan-600 px-3 py-2 text-xs font-black text-white hover:bg-cyan-500">
                      Run
                    </button>
                  </form>
                )}
              </div>

              <pre className="mt-3 max-h-56 overflow-auto rounded-xl border border-border bg-slate-950 p-3 text-xs text-slate-200">
                {JSON.stringify(job.requestJson || job.responseJson || {}, null, 2)}
              </pre>
            </div>
          )) : (
            <div className="rounded-xl border border-border bg-slate-950 p-3 text-sm text-muted">
              No publishing jobs yet.
            </div>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-panel/70 p-5">
        <h2 className="text-xl font-black text-white">Publishing Events</h2>
        <pre className="mt-4 max-h-96 overflow-auto rounded-xl border border-border bg-slate-950 p-4 text-xs text-slate-200">
          {JSON.stringify(safeData.events, null, 2)}
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
