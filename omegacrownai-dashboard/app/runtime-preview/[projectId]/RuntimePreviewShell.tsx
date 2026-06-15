"use client";

import { useMemo, useState } from "react";

type ValidationResult = {
  ok?: boolean;
  passed?: number;
  failed?: number;
  error?: string;
};

export function RuntimePreviewShell({ projectId }: { projectId: string }) {
  const staticPreview = `/api/runtime-proxy/runs/${projectId}/preview`;
  const activeApp = `/generated-app/${projectId}`;
  const [frameSrc, setFrameSrc] = useState(staticPreview);
  const [status, setStatus] = useState("Static preview loaded.");
  const [featureRequest, setFeatureRequest] = useState("");
  const [validation, setValidation] = useState<ValidationResult | null>(null);

  const downloadUrl = useMemo(
    () => `/api/runtime-proxy/runs/${projectId}/download`,
    [projectId]
  );

  async function startApp(path = "") {
    setStatus("Starting active generated app...");
    try {
      const response = await fetch(`/api/runtime-proxy/runs/${projectId}/start-app`, {
        method: "POST",
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || data?.ok === false) {
        setStatus(data?.error || "Active app could not be started. Static preview remains available.");
        return false;
      }

      const nextUrl = `${activeApp}${path}`;
      setFrameSrc(nextUrl);
      setStatus(`Active app opened: ${path || "/"}`);
      return true;
    } catch {
      setStatus("Active app start failed. Static preview remains available.");
      return false;
    }
  }

  async function openActivePath(path: string) {
    const ok = await startApp(path);
    if (ok) {
      window.open(`${activeApp}${path}`, "_blank", "noopener,noreferrer");
    }
  }

  async function validateBuild() {
    setStatus("Running validation...");
    setValidation(null);
    try {
      const response = await fetch(`/api/sovereign/runs/${projectId}/validate`, {
        cache: "no-store",
      });
      const data = await response.json();
      setValidation(data);
      setStatus(data.ok ? `Validation complete: ${data.passed} passed, ${data.failed} failed.` : data.error || "Validation failed.");
    } catch {
      setStatus("Validation request failed.");
    }
  }

  async function submitFeatureRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const request = featureRequest.trim();
    if (!request) {
      setStatus("Describe the feature you want AI to add first.");
      return;
    }

    setStatus("Saving AI feature request...");
    try {
      const response = await fetch(`/api/runtime-proxy/runs/${projectId}/feature-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request }),
      });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        setStatus(data.error || "Feature request could not be saved.");
        return;
      }

      setFeatureRequest("");
      setStatus(data.request?.aiResponse || "Feature request saved.");
    } catch {
      setStatus("Feature request failed to save.");
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="sticky top-0 z-50 border-b border-white/10 bg-black/95 px-4 py-3 shadow-2xl backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.35em] text-cyan-300">
                OmegaCrownAI Runtime Preview
              </p>
              <h1 className="mt-1 text-xl font-black">{projectId}</h1>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setFrameSrc(staticPreview)}
                className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold hover:bg-white/10"
              >
                Static Preview
              </button>
              <button
                type="button"
                onClick={() => startApp("")}
                className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-black text-black hover:bg-cyan-200"
              >
                Open Active App
              </button>
              <button
                type="button"
                onClick={() => openActivePath("/customer")}
                className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold hover:bg-white/10"
              >
                Customer
              </button>
              <button
                type="button"
                onClick={() => openActivePath("/admin")}
                className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold hover:bg-white/10"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => openActivePath("/editor")}
                className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold hover:bg-white/10"
              >
                Editor
              </button>
              <button
                type="button"
                onClick={validateBuild}
                className="rounded-full border border-emerald-300/40 px-4 py-2 text-sm font-bold text-emerald-200 hover:bg-emerald-300/10"
              >
                Validate
              </button>
              <a
                href={downloadUrl}
                className="rounded-full bg-white px-4 py-2 text-sm font-black text-black hover:bg-zinc-200"
              >
                Download ZIP
              </a>
            </div>
          </div>

          <form onSubmit={submitFeatureRequest} className="grid gap-2 md:grid-cols-[1fr_auto]">
            <input
              value={featureRequest}
              onChange={(event) => setFeatureRequest(event.target.value)}
              placeholder="Ask AI to add features, pages, integrations, admin tools, automations, or design changes..."
              className="rounded-2xl border border-white/15 bg-zinc-950 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-cyan-300"
            />
            <button
              type="submit"
              className="rounded-2xl bg-gradient-to-r from-cyan-300 to-blue-400 px-5 py-3 text-sm font-black text-black"
            >
              Ask AI to Add
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-300">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              Status: {status}
            </span>
            {validation ? (
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                Validation: {validation.ok ? "OK" : "Needs review"} · {validation.passed ?? 0} passed · {validation.failed ?? 0} failed
              </span>
            ) : null}
          </div>
        </div>
      </section>

      <iframe
        key={frameSrc}
        src={frameSrc}
        title={`${projectId} runtime preview`}
        className="h-[calc(100vh-178px)] w-full border-0 bg-white"
      />
    </main>
  );
}
