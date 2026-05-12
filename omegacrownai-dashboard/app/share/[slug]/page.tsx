import { notFound } from "next/navigation";
import { getSharePortalDetails, recordSharePortalEvent } from "@/lib/sugent/distribution/creatorDistributionEngine";
import { OmegaLogo } from "@/components/brand/OmegaLogo";

export default async function PublicSharePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const details = await getSharePortalDetails(slug);

  if (!details) return notFound();

  const { record, exportAsset, summary } = details;

  await recordSharePortalEvent({
    slug,
    eventType: "view",
    metadata: {
      source: "server_render_share_page",
    },
  });

  const isVideo = record.projectType === "video" || record.mediaUrl?.endsWith(".mp4");
  const isAudio = record.projectType === "podcast" || record.mediaUrl?.endsWith(".mp3");
  const absoluteShareUrl = `https://omegacrownai.com/share/${slug}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(absoluteShareUrl)}`;

  const payload: any = record.platformPayloadJson || {};
  const hashtags = Array.isArray(record.hashtags)
    ? record.hashtags.filter((tag): tag is string => typeof tag === "string")
    : [];

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex justify-center">
        <OmegaLogo className="h-16 w-auto object-contain" />
      </div>

      <section className="rounded-3xl border border-cyan-400/30 bg-cyan-500/10 p-6 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">
          OmegaCrownAI Download Portal
        </p>

        <h1 className="mt-3 text-4xl font-black text-white">
          {record.title || "Creator Export"}
        </h1>

        {record.description && (
          <p className="mx-auto mt-3 max-w-3xl text-sm leading-7 text-slate-200">
            {record.description}
          </p>
        )}

        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Pill label={record.channel} />
          <Pill label={record.projectType} />
          <Pill label={record.status} />
          {exportAsset?.format && <Pill label={exportAsset.format} />}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.5fr_0.8fr]">
        <div className="rounded-3xl border border-border bg-black/30 p-5">
          {isVideo && record.mediaUrl ? (
            <video
              src={record.mediaUrl}
              controls
              preload="metadata"
              poster={record.thumbnailUrl || undefined}
              className="w-full rounded-2xl border border-border bg-black"
            />
          ) : isAudio && record.mediaUrl ? (
            <div className="rounded-2xl border border-border bg-slate-950 p-5">
              <div className="mb-3 text-xs uppercase tracking-[0.18em] text-cyan-300">
                Podcast Preview
              </div>
              <audio src={record.mediaUrl} controls preload="metadata" className="w-full" />
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-black/20 p-5 text-sm text-muted">
              No media file available.
            </div>
          )}

          {record.mediaUrl && (
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <a
                href={`/share/${slug}/open`}
                className="rounded-xl bg-cyan-600 px-5 py-3 text-sm font-black text-white hover:bg-cyan-500"
              >
                Open Media
              </a>
              <a
                href={`/share/${slug}/download`}
                download
                className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-5 py-3 text-sm font-black text-cyan-100 hover:bg-cyan-500/20"
              >
                Download
              </a>
              <a
                href={`mailto:?subject=${encodeURIComponent(record.title || "OmegaCrownAI Export")}&body=${encodeURIComponent(absoluteShareUrl)}`}
                className="rounded-xl border border-slate-400/20 bg-slate-500/10 px-5 py-3 text-sm font-black text-slate-100 hover:bg-slate-500/20"
              >
                Email Share
              </a>
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-border bg-panel/70 p-5">
            <h2 className="text-xl font-black text-white">Share QR</h2>
            <p className="mt-2 text-sm text-muted">Scan to open this download portal.</p>
            <div className="mt-4 flex justify-center rounded-2xl border border-border bg-white p-4">
              <img src={qrUrl} alt="Share QR code" className="h-56 w-56" />
            </div>
            <div className="mt-4 break-all rounded-xl border border-border bg-slate-950 p-3 font-mono text-xs text-slate-200">
              {absoluteShareUrl}
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-panel/70 p-5">
            <h2 className="text-xl font-black text-white">Portal Activity</h2>
            <div className="mt-4 grid gap-3">
              <Metric label="Views" value={String(summary.views)} />
              <Metric label="Downloads" value={String(summary.downloads)} />
              <Metric label="Media Opens" value={String(summary.opens)} />
            </div>
          </section>
        </aside>
      </section>

      <section className="rounded-3xl border border-border bg-panel/70 p-5">
        <h2 className="text-xl font-black text-white">Media Details</h2>

        <div className="mt-4 grid gap-2 text-xs">
          <Row label="Channel" value={record.channel} />
          <Row label="Status" value={record.status} />
          <Row label="Project Type" value={record.projectType} />
          <Row label="Media URL" value={record.mediaUrl || "none"} />
          <Row label="Share Slug" value={record.shareSlug || "none"} />
          <Row label="Export ID" value={record.exportId} />
          <Row label="Size" value={exportAsset?.sizeBytes ? `${exportAsset.sizeBytes} bytes` : "unknown"} />
          <Row label="Duration" value={exportAsset?.durationSeconds ? `${exportAsset.durationSeconds}s` : "unknown"} />
        </div>

        {!!hashtags.length && (
          <div className="mt-5 flex flex-wrap gap-2">
            {hashtags.map((tag) => (
              <span key={tag} className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-100">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-border bg-panel/70 p-5">
        <h2 className="text-xl font-black text-white">Distribution Payload</h2>
        <pre className="mt-4 max-h-96 overflow-auto rounded-xl border border-border bg-slate-950 p-4 text-xs text-slate-200">
          {JSON.stringify(payload, null, 2)}
        </pre>
      </section>
    </main>
  );
}

function Pill({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-cyan-100">
      {label}
    </span>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-black/20 p-4">
      <div className="text-xs uppercase tracking-[0.18em] text-muted">{label}</div>
      <div className="mt-2 text-2xl font-black text-white">{value}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-border bg-slate-950 px-3 py-2 md:flex-row md:items-center md:justify-between">
      <span className="text-muted">{label}</span>
      <span className="break-all font-mono text-slate-200">{value}</span>
    </div>
  );
}
