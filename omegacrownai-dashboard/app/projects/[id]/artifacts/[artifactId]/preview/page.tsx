import { getLivePreviewArtifactRoute } from "@/lib/sovereign/live-preview-artifact-route";

type PageProps = {
  params: Promise<{
    id: string;
    artifactId: string;
  }>;
};

export default async function ProjectArtifactPreviewPage({ params }: PageProps) {
  const { id, artifactId } = await params;
  const livePreview = getLivePreviewArtifactRoute();

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <section className="mx-auto max-w-6xl">
        <div className="rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/15 via-slate-950 to-purple-500/10 p-8">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-300">
            Live Artifact Preview
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight">
            Project Artifact Preview
          </h1>

          <p className="mt-4 text-sm leading-7 text-slate-300">
            Project: {id}
            <br />
            Artifact: {artifactId}
          </p>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
            This preview route confirms the artifact can be opened for review before
            customer-ready approval. Full implementation will connect this page to the
            generated bundle files, validation report, missing-info report, admin preview,
            and download package.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {livePreview.previewRuntimeSections.map((section) => (
            <div
              key={section.section}
              className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5"
            >
              <h2 className="text-xl font-black">{section.section}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {section.purpose}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
