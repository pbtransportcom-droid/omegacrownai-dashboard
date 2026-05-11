"use client";

import { useEffect, useState } from "react";

const COMPANY_ID = "cmoyy1gl700004mkqn7or7hxr";

export default function RuntimeDashboard() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    const res = await fetch(`/api/runtime/projects?companyId=${COMPANY_ID}`, {
      cache: "no-store",
    });
    const data = await res.json();
    setProjects(data.projects || []);
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  async function runFullPipeline() {
    setLoading(true);

    await fetch("/api/runtime/flows/video-from-brief", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyId: COMPANY_ID,
        title: "Runtime Coordinator OmegaCrownAI Video",
        brief:
          "Create a premium, accurate, production-quality OmegaCrownAI video showing the sovereign AI company operating system with strong prompt alignment and cinematic detail.",
        autoApprove: false,
      }),
    });

    await load();
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
        <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">
          OmegaCrownAI Runtime · Phase 27
        </p>

        <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-black">Runtime Pipeline Dashboard</h1>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-300">
              Mission control for Brief → Project → QA → Version → Review → Render → Publish.
            </p>
          </div>

          <button
            onClick={runFullPipeline}
            disabled={loading}
            className="rounded-xl bg-cyan-600 px-5 py-3 text-sm font-black text-white hover:bg-cyan-500 disabled:opacity-60"
          >
            {loading ? "Running..." : "Run Full Pipeline"}
          </button>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {projects.length ? (
          projects.map((project) => (
            <PipelineCard key={`${project.type}-${project.projectId}`} project={project} reload={load} />
          ))
        ) : (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 text-sm text-slate-400">
            No runtime projects yet.
          </div>
        )}
      </section>
    </main>
  );
}

function PipelineCard({ project, reload }: { project: any; reload: () => Promise<void> }) {
  async function runQA() {
    if (!project.latestVersion?.id) return;

    await fetch("/api/runtime/flows/run-qa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId: project.companyId, versionId: project.latestVersion.id }),
    });

    await reload();
  }

  async function approveLatest() {
    await fetch("/api/runtime/flows/approve-latest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyId: project.companyId,
        projectId: project.projectId,
        projectType: project.type === "PODCAST" ? "podcast" : "video",
      }),
    });

    await reload();
  }

  async function approveAndRender() {
    await fetch("/api/runtime/flows/approve-render", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId: project.companyId, projectId: project.projectId }),
    });

    await reload();
  }

  async function renderIfApproved() {
    await fetch("/api/runtime/flows/render-if-approved", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId: project.companyId, projectId: project.projectId }),
    });

    await reload();
  }

  async function runRenderWorker() {
    await fetch("/api/runtime/workers/render/run-one", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    await reload();
  }

  async function publishIfRendered() {
    await fetch("/api/runtime/flows/publish-if-rendered", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId: project.companyId, projectId: project.projectId }),
    });

    await reload();
  }

  async function runPublishWorker() {
    await fetch("/api/runtime/workers/publish/run-one", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    await reload();
  }

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-black">{project.title}</h2>
          <p className="mt-1 font-mono text-[11px] text-slate-500">{project.projectId}</p>
        </div>

        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-bold text-cyan-200">
          {project.type}
        </span>
      </div>

      <div className="mt-4 space-y-2 text-xs">
        <PipelineRow label="Scenes / Segments" ok={project.hasScenes} />
        <PipelineRow label="Assets" ok={project.hasAssets} />
        <PipelineRow label="Timeline / Outline" ok={project.hasTimeline} />
        <PipelineRow label="Normalized Timeline" ok={project.hasNormalizedTimeline} />
        <PipelineValue label="Version" value={project.latestVersion?.status || "none"} />
        <PipelineValue
          label="QA Score"
          value={project.latestQA ? `${project.latestQA.overallScore} / ${project.latestQA.status}` : "none"}
        />
        <PipelineValue
          label="Prompt Accuracy"
          value={project.latestQA ? String(project.latestQA.promptAccuracyScore) : "none"}
        />
        <PipelineValue
          label="Production Quality"
          value={project.latestQA ? String(project.latestQA.productionQualityScore) : "none"}
        />
        <PipelineValue label="Open Reviews" value={String(project.openReviewThreads || 0)} />
        <PipelineValue label="Render" value={project.latestRender?.status || "none"} />
        <PipelineValue label="Publish" value={project.latestPublish?.status || "none"} />
      </div>

      <div className="mt-5 grid gap-2">
        <button
          onClick={runQA}
          className="rounded-xl bg-amber-600 px-4 py-3 text-xs font-black text-white hover:bg-amber-500"
        >
          Run QA Scorecard
        </button>

        <button
          onClick={approveLatest}
          className="rounded-xl bg-blue-600 px-4 py-3 text-xs font-black text-white hover:bg-blue-500"
        >
          Approve Latest Version
        </button>

        <button
          onClick={approveAndRender}
          className="rounded-xl bg-fuchsia-600 px-4 py-3 text-xs font-black text-white hover:bg-fuchsia-500"
        >
          Approve + Queue Render
        </button>

        <button
          onClick={renderIfApproved}
          className="rounded-xl bg-purple-600 px-4 py-3 text-xs font-black text-white hover:bg-purple-500"
        >
          Render If Approved
        </button>

        <button
          onClick={runRenderWorker}
          className="rounded-xl border border-purple-400/30 bg-purple-500/10 px-4 py-3 text-xs font-black text-purple-100 hover:bg-purple-500/20"
        >
          Run Render Worker
        </button>

        <button
          onClick={publishIfRendered}
          className="rounded-xl bg-emerald-600 px-4 py-3 text-xs font-black text-white hover:bg-emerald-500"
        >
          Publish If Rendered
        </button>

        <button
          onClick={runPublishWorker}
          className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-xs font-black text-emerald-100 hover:bg-emerald-500/20"
        >
          Run Publish Worker
        </button>
      </div>
    </div>
  );
}

function PipelineRow({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-black/20 px-3 py-2">
      <span className="text-slate-300">{label}</span>
      <span className={`rounded-full px-2 py-1 font-bold ${ok ? "bg-green-600 text-white" : "bg-slate-700 text-slate-300"}`}>
        {ok ? "OK" : "Missing"}
      </span>
    </div>
  );
}

function PipelineValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-black/20 px-3 py-2">
      <span className="text-slate-300">{label}</span>
      <span className="rounded-full bg-slate-700 px-2 py-1 font-bold text-white">
        {value}
      </span>
    </div>
  );
}
