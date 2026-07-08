"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

function LiveRuntimeInner() {
  const searchParams = useSearchParams();

  const projectId = searchParams.get("projectId") || "";
  const runtimeId = searchParams.get("runtimeId") || "";
  const intent = searchParams.get("intent") || "general";

  const [runtime, setRuntime] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!projectId) return;

    fetch(`/api/runtime-proxy/runs/${projectId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.ok) {
          setError(data.error || "Runtime not found.");
          return;
        }

        setRuntime(data);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load runtime data.");
      });
  }, [projectId]);

  const agents =
    runtime?.agentHandoffs ||
    runtime?.run?.agentHandoffs ||
    runtime?.run?.agents ||
    runtime?.agents ||
    [];
  const artifacts =
    runtime?.artifacts ||
    runtime?.run?.artifacts ||
    [];
  const events =
    runtime?.events ||
    runtime?.run?.events ||
    [];
  const transcript = runtime?.transcript || [];
  const deliveryManifest = runtime?.deliveryManifest || runtime?.run?.deliveryManifest || null;
  const qualityReport =
    runtime?.generatedArtifactQualityReport ||
    runtime?.run?.generatedArtifactQualityReport ||
    deliveryManifest?.generatedArtifactQualityReport ||
    null;
  const deliveryProof =
    runtime?.delivery?.buildProof ||
    runtime?.run?.delivery?.buildProof ||
    deliveryManifest?.delivery?.buildProof ||
    null;
  const requiredFiles: string[] = deliveryProof?.requiredFiles || [];
  const fileList: string[] = deliveryManifest?.files || [];
  const hasReadme = Boolean(qualityReport?.readmePresent || requiredFiles.includes("README.md") || fileList.includes("README.md"));
  const hasDeliveryGuide = Boolean(qualityReport?.deliveryGuidePresent || requiredFiles.includes("DELIVERY.md") || fileList.includes("DELIVERY.md"));
  const hasLaunchChecklist = Boolean(qualityReport?.launchChecklistPresent || requiredFiles.includes("LAUNCH_CHECKLIST.md") || fileList.includes("LAUNCH_CHECKLIST.md"));
  const hasSmokeTest = Boolean(qualityReport?.smokeTestPresent || fileList.includes("scripts/smoke-test.ts") || fileList.includes("scripts/smoke-test.mjs"));
  const validationPassed = Boolean(
    runtime?.validation?.status === "passed" ||
      runtime?.generatedArtifactValidation?.ok ||
      deliveryManifest?.validation?.ok ||
      deliveryProof?.generatedArtifactValidation?.ok
  );
  const downloadReady = Boolean(projectId && (runtime?.downloadUrl || deliveryManifest?.downloadUrl || runtime?.delivery?.download || deliveryManifest?.delivery?.download));

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">
      <section className="mx-auto max-w-6xl">
        <p className="text-sm uppercase tracking-[0.3em] text-yellow-400">
          OmegaCrownAI Live Runtime
        </p>

        <h1 className="mt-4 text-4xl font-bold">
          Sovereign Runtime Execution
        </h1>

          {projectId && (
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={`/api/runtime-proxy/runs/${projectId}/download`}
                className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-black"
              >
                Download ZIP
              </a>

              <button
                onClick={() => deployRuntimeArtifact(projectId)}
                className="rounded-xl bg-red-400 px-5 py-3 text-sm font-bold text-black"
              >
                Deploy
              </button>

              <a
                href={`/deployed/${projectId}`}
                target="_blank"
                className="rounded-xl border border-emerald-500/60 bg-emerald-500/10 px-5 py-3 text-sm font-bold text-emerald-100"
              >
                Open Preview
              </a>

              <a
                href={`/runtime-deployments/${projectId}/index.html`}
                target="_blank"
                className="rounded-xl border border-cyan-500/60 bg-cyan-500/10 px-5 py-3 text-sm font-bold text-cyan-100"
              >
                Static HTML
              </a>

              <a
                href={`/projects/${projectId}/validation`}
                className="rounded-xl border border-yellow-500/60 bg-yellow-500/10 px-5 py-3 text-sm font-bold text-yellow-100"
              >
                View Validation
              </a>

              <a
                href={`/artifacts/${projectId}`}
                className="rounded-xl border border-purple-500/60 bg-purple-500/10 px-5 py-3 text-sm font-bold text-purple-100"
              >
                View Artifacts
              </a>
            </div>
          )}

        <p className="mt-3 text-white/70">
          Project: {projectId || "missing"} · Runtime: {runtimeId || "missing"} · Mode:{" "}
          {runtime?.mode || intent}
        </p>

        {runtime?.status === "completed" && (
          <div className="mt-8 rounded-3xl border border-emerald-400/30 bg-emerald-500/10 p-6 shadow-2xl shadow-emerald-500/10">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.3em] text-emerald-300">
                  Production Package Ready
                </div>

                <h2 className="mt-3 text-3xl font-black text-white">
                  Your production-ready package is ready.
                </h2>

                <p className="mt-3 max-w-4xl text-sm leading-7 text-emerald-100/80">
                  OmegaCrownAI generated the customer preview, runtime preview, ZIP package,
                  validation proof, delivery guide, and launch checklist. Review the preview,
                  download the package, then use the included docs to prepare for launch.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-right">
                <div className="text-xs uppercase tracking-[0.2em] text-white/50">Project ID</div>
                <div className="mt-1 font-mono text-sm font-black text-white">{projectId}</div>
                <div className="mt-2 text-xs text-emerald-200">{runtime?.mode || intent}</div>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <ProofBadge ok={validationPassed} label="Validation passed" />
              <ProofBadge ok={downloadReady} label="Download ready" />
              <ProofBadge ok={hasReadme} label="README included" />
              <ProofBadge ok={hasSmokeTest} label="Smoke test included" />
              <ProofBadge ok={hasDeliveryGuide} label="Delivery guide included" />
              <ProofBadge ok={hasLaunchChecklist} label="Launch checklist included" />
              <ProofBadge ok={Boolean(qualityReport?.frontendComplete)} label="Frontend complete" />
              <ProofBadge ok={Boolean(qualityReport?.adminComplete)} label="Admin complete" />
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={`/deployed/${projectId}`}
                target="_blank"
                className="rounded-xl bg-emerald-400 px-5 py-3 text-sm font-black text-black hover:bg-emerald-300"
              >
                View Live Preview
              </a>

              <a
                href={`/runtime-preview/${projectId}`}
                target="_blank"
                className="rounded-xl border border-cyan-400/50 bg-cyan-500/10 px-5 py-3 text-sm font-black text-cyan-100 hover:bg-cyan-500/20"
              >
                View Runtime Preview
              </a>

              <a
                href={`/api/runtime-proxy/runs/${projectId}/download`}
                className="rounded-xl bg-white px-5 py-3 text-sm font-black text-black hover:bg-slate-200"
              >
                Download ZIP
              </a>

              <a
                href={`/artifacts/${projectId}`}
                className="rounded-xl border border-purple-400/50 bg-purple-500/10 px-5 py-3 text-sm font-black text-purple-100 hover:bg-purple-500/20"
              >
                Review Artifacts
              </a>

              <a
                href={`/projects/${projectId}/validation`}
                className="rounded-xl border border-yellow-400/50 bg-yellow-500/10 px-5 py-3 text-sm font-black text-yellow-100 hover:bg-yellow-500/20"
              >
                View Validation
              </a>
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-black/25 p-4">
              <div className="text-sm font-black text-white">Included delivery documents</div>
              <div className="mt-3 grid gap-2 text-sm text-white/75 md:grid-cols-3">
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">README.md setup guide</div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">DELIVERY.md customer handoff</div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">LAUNCH_CHECKLIST.md launch checklist</div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-red-200">
            {error}
          </div>
        )}

        {runtime?.status === "completed" && projectId && (
          <section className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black">Live Preview</h2>
                <p className="mt-1 text-sm text-white/60">
                  This is the generated customer-facing output.
                </p>
              </div>

              <a
                href={`/deployed/${projectId}`}
                target="_blank"
                className="rounded-xl border border-cyan-400/50 bg-cyan-500/10 px-4 py-2 text-sm font-black text-cyan-100 hover:bg-cyan-500/20"
              >
                Open Full Screen
              </a>
            </div>

            <iframe
              src={`/deployed/${projectId}`}
              className="h-[620px] w-full rounded-2xl border border-white/10 bg-white"
              title="Generated project preview"
            />
          </section>
        )}

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-3xl font-bold">{agents.length}</div>
            <div className="text-sm text-white/60">Agents</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-3xl font-bold">{events.length}</div>
            <div className="text-sm text-white/60">Runtime Events</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-3xl font-bold">{artifacts.length}</div>
            <div className="text-sm text-white/60">Artifacts</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-3xl font-bold">
              {runtime?.status || "loading"}
            </div>
            <div className="text-sm text-white/60">Status</div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">Agent Handoff Timeline</h2>

            <div className="mt-4 space-y-3">
              {agents.length ? (
                agents.map((agent: any, index: number) => (
                  <div key={index} className="rounded-xl border border-white/10 p-4">
                    <div className="font-semibold">{agent.name || `Agent ${index + 1}`}</div>
                    <div className="text-sm text-white/60">{agent.role}</div>
                    <p className="mt-2 text-sm text-white/80">{agent.output}</p>
                  </div>
                ))
              ) : (
                <p className="text-white/60">No agent handoffs loaded yet.</p>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">Runtime Events</h2>

            <div className="mt-4 space-y-3">
              {events.length ? (
                events.map((event: any, index: number) => (
                  <div key={index} className="rounded-xl border border-white/10 p-4">
                    <div className="text-xs uppercase text-yellow-300">
                      {event.agent || event.type || "runtime-event"}
                    </div>
                    <p className="mt-2 text-sm text-white/80">
                      {event.event || event.message || JSON.stringify(event)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-white/60">No runtime events loaded yet.</p>
              )}
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold">Delivery Summary</h2>

          <pre className="mt-4 overflow-auto rounded-xl bg-black/60 p-4 text-xs text-white/80">
            {JSON.stringify(
              {
                validation: runtime?.validation,
                delivery: runtime?.delivery,
                summary: runtime?.summary,
                artifacts,
                transcript,
              },
              null,
              2
            )}
          </pre>
        </section>
      </section>
    </main>
  );
}

function ProofBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div
      className={`rounded-2xl border p-4 text-sm font-black ${
        ok
          ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-100"
          : "border-white/10 bg-white/5 text-white/45"
      }`}
    >
      <span className="mr-2">{ok ? "✓" : "○"}</span>
      {label}
    </div>
  );
}

async function deployRuntimeArtifact(projectId: string) {
  const response = await fetch(`/api/runtime-proxy/runs/${projectId}/deploy`, {
    method: "POST",
  });

  const data = await response.json();

  if (!data?.ok) {
    alert("Deployment failed.");
    return;
  }

  window.open(data.previewUrl || `/deployed/${projectId}`, "_blank");
}

export default function LiveRuntimePage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-black text-white p-10">Loading runtime...</main>}>
      <LiveRuntimeInner />
    </Suspense>
  );
}
