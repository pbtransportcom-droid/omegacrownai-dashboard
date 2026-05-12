import { getCustomerStorageDashboard } from "@/lib/sugent/customer-storage/customerStorageEngine";
import { OmegaLogo } from "@/components/brand/OmegaLogo";

export default async function CustomerStoragePage({
  params,
}: {
  params: Promise<{ organizationId: string }>;
}) {
  const { organizationId } = await params;
  const data = await getCustomerStorageDashboard(organizationId);

  if (!data.ok) {
    return (
      <main className="p-6">
        <div className="rounded-3xl border border-red-400/30 bg-red-500/10 p-6 text-red-100">
          Storage organization not found.
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
          v4.6 Storage + Export CDN Hardening
        </p>

        <h1 className="mt-3 text-4xl font-black text-white">
          Storage Assets
        </h1>

        <p className="mx-auto mt-3 max-w-3xl text-sm leading-7 text-slate-200">
          Track export files, storage providers, signed URL placeholders, CDN URLs, checksums, lifecycle status, and asset versions.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-6">
        <Metric label="Assets" value={String(safeData.summary.assets)} />
        <Metric label="Active" value={String(safeData.summary.active)} />
        <Metric label="Public" value={String(safeData.summary.publicAssets)} />
        <Metric label="Signed" value={String(safeData.summary.signedAssets)} />
        <Metric label="Total MB" value={String(safeData.summary.totalMb)} />
        <Metric label="Archived" value={String(safeData.summary.archived)} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-border bg-panel/70 p-5">
          <h2 className="text-xl font-black text-white">Sync Public Exports</h2>
          <p className="mt-2 text-sm text-muted">
            Import existing files from public/exports into the customer storage registry.
          </p>

          <form action={`/api/customer-org/${organizationId}/storage/sync-exports`} method="POST" className="mt-4 grid gap-3">
            <input name="exportsDir" defaultValue="public/exports" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none" />

            <button className="rounded-xl bg-cyan-600 px-5 py-3 text-sm font-black text-white hover:bg-cyan-500">
              Sync Exports
            </button>
          </form>
        </div>

        <div className="rounded-3xl border border-border bg-panel/70 p-5">
          <h2 className="text-xl font-black text-white">Register Asset Placeholder</h2>

          <form action={`/api/customer-org/${organizationId}/storage/register`} method="POST" className="mt-4 grid gap-3">
            <input name="fileName" placeholder="example.mp4" required className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none" />
            <input name="publicUrl" placeholder="/exports/company/example.mp4" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none" />

            <select name="storageProvider" defaultValue="local" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none">
              <option value="local">Local</option>
              <option value="s3">S3</option>
              <option value="gcs">GCS</option>
              <option value="cloudflare_r2">Cloudflare R2</option>
            </select>

            <select name="visibility" defaultValue="public" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none">
              <option value="public">Public</option>
              <option value="signed">Signed</option>
              <option value="private">Private</option>
            </select>

            <button className="rounded-xl bg-yellow-500 px-5 py-3 text-sm font-black text-black hover:bg-yellow-400">
              Register Asset
            </button>
          </form>
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-panel/70 p-5">
        <h2 className="text-xl font-black text-white">Storage Provider Registry</h2>

        <div className="mt-4 grid gap-3 md:grid-cols-4">
          {safeData.registry.map((item: any) => (
            <div key={item.provider} className="rounded-2xl border border-border bg-black/20 p-4">
              <div className="text-sm font-black text-white">{item.provider}</div>
              <div className="mt-1 text-xs text-cyan-300">{item.status}</div>
              <div className="mt-2 text-xs text-muted">
                signedUrls: {String(item.signedUrls)} · cdn: {String(item.cdnTracking)}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-panel/70 p-5">
        <h2 className="text-xl font-black text-white">Assets</h2>

        <div className="mt-4 space-y-3">
          {safeData.assets.length ? safeData.assets.map((asset: any) => (
            <div key={asset.id} className="rounded-2xl border border-border bg-black/20 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="text-sm font-black text-white">{asset.fileName}</div>
                  <div className="mt-1 text-xs text-cyan-300">
                    {asset.assetType} · {asset.mimeType} · {asset.storageProvider} · {asset.status} · {asset.visibility}
                  </div>
                  <div className="mt-1 font-mono text-[11px] text-muted">{asset.publicUrl || asset.objectKey || asset.id}</div>
                  {asset.cdnUrl && (
                    <div className="mt-1 break-all font-mono text-[11px] text-emerald-200">{asset.cdnUrl}</div>
                  )}
                </div>

                <form action={`/api/customer-org/${organizationId}/storage/assets/${asset.id}/status`} method="POST" className="flex flex-wrap gap-2">
                  <select name="status" defaultValue={asset.status} className="rounded-xl border border-border bg-slate-950 px-3 py-2 text-xs text-white outline-none">
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                    <option value="deleted">Deleted</option>
                    <option value="failed">Failed</option>
                  </select>

                  <select name="visibility" defaultValue={asset.visibility} className="rounded-xl border border-border bg-slate-950 px-3 py-2 text-xs text-white outline-none">
                    <option value="public">Public</option>
                    <option value="signed">Signed</option>
                    <option value="private">Private</option>
                  </select>

                  <button className="rounded-xl bg-cyan-600 px-3 py-2 text-xs font-black text-white hover:bg-cyan-500">
                    Update
                  </button>
                </form>
              </div>

              <details className="mt-3">
                <summary className="cursor-pointer text-xs font-black text-cyan-200">
                  Versions ({asset.versions?.length || 0})
                </summary>

                <pre className="mt-3 max-h-56 overflow-auto rounded-xl border border-border bg-slate-950 p-3 text-xs text-slate-200">
                  {JSON.stringify(asset.versions || [], null, 2)}
                </pre>
              </details>
            </div>
          )) : (
            <div className="rounded-xl border border-border bg-slate-950 p-3 text-sm text-muted">
              No storage assets yet. Sync exports or register an asset placeholder.
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
