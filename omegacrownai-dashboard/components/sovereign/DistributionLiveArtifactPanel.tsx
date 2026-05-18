import { getProjectDistributionLiveDataBinding } from "@/lib/sovereign/project-distribution-live-data-binding";

type DistributionLiveArtifactPanelProps = {
  projectId?: string;
};

export function DistributionLiveArtifactPanel({
  projectId = "cmoyy1gl700004mkqn7or7hxr",
}: DistributionLiveArtifactPanelProps) {
  const binding = getProjectDistributionLiveDataBinding(projectId);
  const artifact = binding.latestArtifactCard;

  const layerCards = [
    ["Frontend", artifact.frontendCount],
    ["Backend/API", artifact.backendCount],
    ["Database", artifact.databaseCount],
    ["Admin", artifact.adminCount],
    ["Preview", artifact.previewCount],
    ["Deploy", artifact.deployCount],
  ];

  return (
    <section className="mt-8 rounded-3xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500/15 via-slate-950 to-cyan-500/10 p-6 shadow-2xl shadow-emerald-950/20">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-300">
            Full-Function Artifact Live Status
          </p>
          <h2 className="mt-2 text-3xl font-black text-white">
            Latest generated artifact is bound to live distribution data.
          </h2>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-300">
            Artifact: {artifact.artifactId} · Score: {artifact.completenessScore}/100 ·
            Customer Ready: {artifact.customerReady ? "Yes" : "No"}
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-5 py-4 text-right">
          <p className="text-xs font-black uppercase tracking-wide text-emerald-200">
            Customer-Ready Score
          </p>
          <p className="mt-1 text-4xl font-black text-white">
            {artifact.completenessScore}
          </p>
          <p className="text-xs text-emerald-100">{artifact.statusBadge}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-6">
        {layerCards.map(([label, count]) => (
          <div key={label} className="rounded-2xl border border-slate-700 bg-black/30 p-4">
            <p className="text-xs font-black uppercase tracking-wide text-slate-400">
              {label}
            </p>
            <p className="mt-2 text-2xl font-black text-white">{count}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <a href={artifact.previewPath} className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm font-black text-cyan-100 hover:bg-cyan-500/20">
          Preview
        </a>
        <a href={artifact.adminPreviewPath} className="rounded-xl border border-purple-400/30 bg-purple-500/10 px-4 py-2 text-sm font-black text-purple-100 hover:bg-purple-500/20">
          Admin Preview
        </a>
        <a href={artifact.downloadPath} className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm font-black text-emerald-100 hover:bg-emerald-500/20">
          Download ZIP
        </a>
        <a href={artifact.historyPath} className="rounded-xl border border-slate-500/40 bg-slate-800 px-4 py-2 text-sm font-black text-slate-100 hover:bg-slate-700">
          Artifact History
        </a>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-700 bg-black/30 p-4">
          <p className="text-sm font-black text-white">Validation report</p>
          <p className="mt-2 text-xs leading-6 text-slate-300">
            {artifact.validationReportPath}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-700 bg-black/30 p-4">
          <p className="text-sm font-black text-white">Missing-info report</p>
          <p className="mt-2 text-xs leading-6 text-slate-300">
            {artifact.missingInfoReportPath}
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-yellow-400/20 bg-yellow-500/10 p-4">
        <p className="text-sm font-black text-yellow-100">
          Homepage-only output remains blocked
        </p>
        <p className="mt-2 text-xs leading-6 text-yellow-50">
          A homepage-only artifact cannot be marked customer-ready. Distribution readiness
          requires backend/API, database/schema, admin review, preview, deployment package,
          validation report, and missing-info report.
        </p>
      </div>
    </section>
  );
}
