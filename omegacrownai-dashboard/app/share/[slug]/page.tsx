import { notFound } from "next/navigation";
import { getPublicShareBySlug } from "@/lib/sugent/distribution/creatorDistributionEngine";
import { OmegaLogo } from "@/components/brand/OmegaLogo";

export default async function PublicSharePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const record = await getPublicShareBySlug(slug);

  if (!record) return notFound();

  const isVideo = record.projectType === "video" || record.mediaUrl?.endsWith(".mp4");
  const isAudio = record.projectType === "podcast" || record.mediaUrl?.endsWith(".mp3");

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex justify-center">
        <OmegaLogo className="h-16 w-auto object-contain" />
      </div>

      <section className="rounded-3xl border border-border bg-panel/70 p-6 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">
          OmegaCrownAI Public Share
        </p>

        <h1 className="mt-3 text-4xl font-black text-white">
          {record.title || "Creator Export"}
        </h1>

        {record.description && (
          <p className="mx-auto mt-3 max-w-3xl text-sm leading-7 text-muted">
            {record.description}
          </p>
        )}
      </section>

      <section className="rounded-3xl border border-border bg-black/30 p-5">
        {isVideo && record.mediaUrl ? (
          <video
            src={record.mediaUrl}
            controls
            preload="metadata"
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
              href={record.mediaUrl}
              className="rounded-xl bg-cyan-600 px-5 py-3 text-sm font-black text-white hover:bg-cyan-500"
            >
              Open Media
            </a>
            <a
              href={record.mediaUrl}
              download
              className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-5 py-3 text-sm font-black text-cyan-100 hover:bg-cyan-500/20"
            >
              Download
            </a>
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-border bg-panel/70 p-5">
        <h2 className="text-xl font-black text-white">Distribution Details</h2>

        <div className="mt-4 grid gap-2 text-xs">
          <Row label="Channel" value={record.channel} />
          <Row label="Status" value={record.status} />
          <Row label="Project Type" value={record.projectType} />
          <Row label="Media URL" value={record.mediaUrl || "none"} />
        </div>
      </section>
    </main>
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
