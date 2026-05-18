import { getArtifactHistoryUiUpgrade } from "@/lib/sovereign/artifact-history-ui-upgrade";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProjectArtifactHistoryPage({ params }: PageProps) {
  const { id } = await params;
  const ui = getArtifactHistoryUiUpgrade();

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <section className="mx-auto max-w-6xl">
        <div className="rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/15 via-slate-950 to-purple-500/10 p-8">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-300">
            Artifact History
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight">
            Project Artifact History
          </h1>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            Project: {id}
          </p>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
            Review generated artifact versions, customer-ready status, validation evidence,
            preview/download links, missing-info reports, and rebuild lineage.
          </p>
        </div>

        <div className="mt-8 grid gap-5">
          {ui.sampleArtifactCards.map((artifact) => (
            <article
              key={artifact.artifactId}
              className="rounded-3xl border border-slate-700 bg-slate-900/70 p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                    Version {artifact.version} · {artifact.statusBadge}
                  </p>
                  <h2 className="mt-2 text-2xl font-black text-white">
                    {artifact.title}
                  </h2>
                  <p className="mt-2 text-sm text-slate-300">
                    Score: {artifact.completenessScore}/100 · Customer Ready:{" "}
                    {artifact.customerReady ? "Yes" : "No"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {artifact.previewPath && (
                    <a
                      href={artifact.previewPath}
                      className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm font-black text-cyan-100 hover:bg-cyan-500/20"
                    >
                      Preview
                    </a>
                  )}
                  {artifact.adminPreviewPath && (
                    <a
                      href={artifact.adminPreviewPath}
                      className="rounded-xl border border-purple-400/30 bg-purple-500/10 px-4 py-2 text-sm font-black text-purple-100 hover:bg-purple-500/20"
                    >
                      Admin Preview
                    </a>
                  )}
                  {artifact.downloadPath && (
                    <a
                      href={artifact.downloadPath}
                      className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm font-black text-emerald-100 hover:bg-emerald-500/20"
                    >
                      Download
                    </a>
                  )}
                </div>
              </div>

              {artifact.blockedReasons.length > 0 && (
                <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/10 p-4">
                  <p className="text-sm font-black text-red-100">Blocked reasons</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-6 text-red-50">
                    {artifact.blockedReasons.map((reason) => (
                      <li key={reason}>{reason}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-5 grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-700 bg-black/30 p-4">
                  <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                    Validation
                  </p>
                  <p className="mt-2 text-sm text-white">
                    {artifact.validationStatus}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-700 bg-black/30 p-4">
                  <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                    Validation Report
                  </p>
                  <p className="mt-2 text-sm text-white">
                    {artifact.validationReportPath}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-700 bg-black/30 p-4">
                  <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                    Missing Info
                  </p>
                  <p className="mt-2 text-sm text-white">
                    {artifact.missingInfoReportPath}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
