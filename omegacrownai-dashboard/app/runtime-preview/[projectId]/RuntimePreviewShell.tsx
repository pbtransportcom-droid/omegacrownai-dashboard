"use client";

import { useEffect, useMemo, useState } from "react";

type ValidationResult = {
  ok?: boolean;
  passed?: number;
  failed?: number;
  error?: string;
};

type RuntimeFile = {
  name: string;
  path: string;
  size: number;
  modifiedAt: string;
};

type BuildSpecSummary = {
  buildSpec?: {
    industry?: string;
    brandName?: string;
    productType?: string;
    isIncomplete?: boolean;
    pages?: string[];
    features?: string[];
    customerWorkflow?: string[];
    adminWorkflow?: string[];
    deliveryFiles?: string[];
    missingFields?: string[];
    designPreset?: {
      id?: string;
      name?: string;
      mood?: string;
      palette?: Record<string, string>;
      typography?: string;
      layout?: string;
      heroStyle?: string;
      sectionStyle?: string;
      imageDirection?: string;
      motionDirection?: string;
    };
  } | null;
  originalPrompt?: string;
  normalizedPrompt?: string;
  missingFields?: string[];
  suggestedPrompt?: string;
  deliveryManifest?: {
    files?: string[];
  } | null;
};

function asText(value: unknown, fallback = "Not provided") {
  const text = String(value || "").trim();
  return text || fallback;
}

function asTextList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.map((item) => String(item || "").trim()).filter(Boolean)
    : [];
}

export function RuntimePreviewShell({ projectId }: { projectId: string }) {
  const staticPreview = `/api/runtime-proxy/runs/${projectId}/preview`;
  const activeApp = `/generated-app/${projectId}`;
  const [frameSrc, setFrameSrc] = useState(staticPreview);
  const [status, setStatus] = useState("Static preview loaded.");
  const [featureRequest, setFeatureRequest] = useState("");
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [files, setFiles] = useState<RuntimeFile[]>([]);
  const [selectedFile, setSelectedFile] = useState("");
  const [fileContent, setFileContent] = useState("");
  const [filePanelOpen, setFilePanelOpen] = useState(false);
  const [fileBusy, setFileBusy] = useState(false);
  const [fileFilter, setFileFilter] = useState("");
  const [summary, setSummary] = useState<BuildSpecSummary | null>(null);

  const downloadUrl = useMemo(
    () => `/api/runtime-proxy/runs/${projectId}/download`,
    [projectId]
  );

  useEffect(() => {
    let cancelled = false;

    async function loadSummary() {
      try {
        const response = await fetch(`/api/runtime-proxy/runs/${projectId}/summary`, {
          cache: "no-store",
        });
        const data = await response.json().catch(() => ({}));
        if (!cancelled && response.ok) {
          setSummary(data);
        }
      } catch {
        if (!cancelled) {
          setSummary(null);
        }
      }
    }

    loadSummary();

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const visibleFiles = useMemo(() => {
    const q = fileFilter.trim().toLowerCase();
    if (!q) return files;
    return files.filter((file) => file.path.toLowerCase().includes(q));
  }, [fileFilter, files]);

  const buildSpec = summary?.buildSpec || null;
  const originalPrompt = asText(summary?.originalPrompt, "");
  const normalizedPrompt = asText(summary?.normalizedPrompt, "");
  const missingFields = asTextList(summary?.missingFields || buildSpec?.missingFields);
  const pagesGenerated = asTextList(buildSpec?.pages);
  const featuresGenerated = asTextList(buildSpec?.features);
  const customerWorkflow = asTextList(buildSpec?.customerWorkflow);
  const adminWorkflow = asTextList(buildSpec?.adminWorkflow);
  const deliveryFiles = asTextList(buildSpec?.deliveryFiles || summary?.deliveryManifest?.files);
  const designPreset = buildSpec?.designPreset || null;
  const designPalette: Record<string, string> = designPreset?.palette || {};
  const buildSpecReportVisible = Boolean(buildSpec || summary?.originalPrompt || summary?.normalizedPrompt);

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

  async function restartActiveApp(path = "") {
    setStatus("Restarting active generated app...");
    try {
      const response = await fetch(`/api/runtime-proxy/runs/${projectId}/restart-app`, {
        method: "POST",
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || data?.ok === false) {
        setStatus(data?.error || "Active app restart failed.");
        return false;
      }

      const nextUrl = `${activeApp}${path}`;
      setFrameSrc(nextUrl);
      setStatus("Active app restarted with latest saved files.");
      return true;
    } catch {
      setStatus("Active app restart request failed.");
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

  async function loadFiles() {
    setFileBusy(true);
    setStatus("Loading generated artifact files...");
    try {
      const response = await fetch(`/api/runtime-proxy/runs/${projectId}/files`, {
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        setStatus(data.error || "Could not load generated files.");
        return;
      }

      setFiles(data.files || []);
      setFilePanelOpen(true);
      setStatus(`Loaded ${(data.files || []).length} generated files.`);
    } catch {
      setStatus("File list request failed.");
    } finally {
      setFileBusy(false);
    }
  }

  async function openFile(filePath: string) {
    setFileBusy(true);
    setSelectedFile(filePath);
    setStatus(`Opening ${filePath}...`);
    try {
      const response = await fetch(
        `/api/runtime-proxy/runs/${projectId}/files/content?file=${encodeURIComponent(filePath)}`,
        { cache: "no-store" }
      );
      const data = await response.json();

      if (!response.ok || !data.ok) {
        setStatus(data.error || "Could not open file.");
        return;
      }

      setFileContent(data.content || "");
      setStatus(`Opened ${filePath}.`);
    } catch {
      setStatus("File content request failed.");
    } finally {
      setFileBusy(false);
    }
  }

  async function saveFile() {
    if (!selectedFile) {
      setStatus("Choose a file before saving.");
      return;
    }

    setFileBusy(true);
    setStatus(`Saving ${selectedFile}...`);
    try {
      const response = await fetch(`/api/runtime-proxy/runs/${projectId}/files/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: selectedFile, content: fileContent }),
      });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        setStatus(data.error || "File save failed.");
        return;
      }

      setStatus(`Saved ${selectedFile}. Restart active app to preview changes.`);
      await loadFiles();
    } catch {
      setStatus("File save request failed.");
    } finally {
      setFileBusy(false);
    }
  }

  async function saveAndRestart() {
    await saveFile();
    await restartActiveApp(selectedFile.endsWith("page.tsx") ? "" : "/editor");
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
              <button
                type="button"
                onClick={loadFiles}
                className="rounded-full border border-yellow-300/40 px-4 py-2 text-sm font-bold text-yellow-100 hover:bg-yellow-300/10"
              >
                Edit Files
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

      {buildSpecReportVisible ? (
        <section className="border-b border-white/10 bg-black px-4 py-5">
          <div className="mx-auto max-w-7xl rounded-3xl border border-cyan-300/20 bg-zinc-950 p-5 shadow-2xl shadow-cyan-950/20">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-200">
                  Build Spec Report
                </p>
                <h2 className="mt-2 text-2xl font-black text-white">
                  OmegaCrownAI turned the prompt into a full product brief.
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
                  Review the original prompt, smart defaults, generated pages, workflows,
                  and delivery files before opening the active app or downloading the ZIP.
                </p>
              </div>
              <a
                href={downloadUrl}
                className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-black text-black hover:bg-cyan-200"
              >
                Download Package
              </a>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-black p-4">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
                  Original Prompt
                </p>
                <p className="mt-2 text-sm leading-6 text-zinc-200">
                  {originalPrompt || "Not provided"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black p-4 lg:col-span-2">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
                  Normalized Build Spec
                </p>
                <p className="mt-2 line-clamp-6 text-sm leading-6 text-zinc-200">
                  {normalizedPrompt || "No normalized prompt available."}
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Industry</p>
                <p className="mt-2 text-sm font-bold text-white">{asText(buildSpec?.industry)}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Product Type</p>
                <p className="mt-2 text-sm font-bold text-white">{asText(buildSpec?.productType)}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Brand / Default</p>
                <p className="mt-2 text-sm font-bold text-white">{asText(buildSpec?.brandName)}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Completeness</p>
                <p className="mt-2 text-sm font-bold text-white">
                  {buildSpec?.isIncomplete ? "Smart defaults applied" : "Complete prompt"}
                </p>
              </div>
            </div>

            {designPreset ? (
              <div className="mt-5 rounded-2xl border border-fuchsia-300/20 bg-fuchsia-500/10 p-4">
                <div className="text-xs font-black uppercase tracking-[0.28em] text-fuchsia-200">
                  Prompt-Fit Design System
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  {[
                    ["Design Preset", designPreset.name],
                    ["Mood", designPreset.mood],
                    ["Typography", designPreset.typography],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-white/10 bg-black/30 p-3">
                      <div className="text-xs uppercase tracking-[0.2em] text-white/50">{label}</div>
                      <p className="mt-2 text-sm font-bold text-white">{asText(value)}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {[
                    ["Layout", designPreset.layout],
                    ["Hero Style", designPreset.heroStyle],
                    ["Section Style", designPreset.sectionStyle],
                    ["Image Direction", designPreset.imageDirection],
                    ["Motion Direction", designPreset.motionDirection],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-white/10 bg-black/30 p-3">
                      <div className="text-xs uppercase tracking-[0.2em] text-white/50">{label}</div>
                      <p className="mt-2 text-sm font-bold text-white">{asText(value)}</p>
                    </div>
                  ))}
                </div>

                {Object.keys(designPalette).length ? (
                  <div className="mt-4">
                    <div className="text-xs font-black uppercase tracking-[0.2em] text-white/50">
                      Palette
                    </div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                      {Object.entries(designPalette).map(([name, value]) => (
                        <div key={name} className="rounded-xl border border-white/10 bg-black/30 p-3">
                          <div className="flex items-center gap-2">
                            <span
                              className="h-5 w-5 rounded-full border border-white/20"
                              style={{ backgroundColor: value }}
                            />
                            <span className="text-xs font-black uppercase tracking-[0.16em] text-white/50">
                              {name}
                            </span>
                          </div>
                          <div className="mt-2 font-mono text-xs font-bold text-white">
                            {value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            {missingFields.length ? (
              <div className="mt-4 rounded-2xl border border-yellow-300/20 bg-yellow-300/5 p-4">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-100">
                  Missing Fields Filled With Smart Defaults
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {missingFields.map((field) => (
                    <span key={field} className="rounded-full border border-yellow-300/20 px-3 py-1 text-xs font-bold text-yellow-100">
                      {field}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {[
                ["Pages Generated", pagesGenerated],
                ["Features Generated", featuresGenerated],
                ["Customer Workflow", customerWorkflow],
                ["Admin Workflow", adminWorkflow],
                ["Delivery Files", deliveryFiles],
              ].map(([title, items]) => (
                <div key={String(title)} className="rounded-2xl border border-white/10 bg-black p-4">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
                    {String(title)}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(items as string[]).length ? (
                      (items as string[]).map((item) => (
                        <span key={item} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-200">
                          {item}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-zinc-500">Not available</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {filePanelOpen ? (
        <section className="border-b border-white/10 bg-zinc-950 px-4 py-4">
          <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[360px_1fr]">
            <aside className="rounded-3xl border border-white/10 bg-black p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-yellow-200">
                    Artifact Files
                  </p>
                  <p className="mt-1 text-xs text-zinc-400">{files.length} files available</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFilePanelOpen(false)}
                  className="rounded-full border border-white/10 px-3 py-1 text-xs font-bold text-zinc-300"
                >
                  Hide
                </button>
              </div>

              <input
                value={fileFilter}
                onChange={(event) => setFileFilter(event.target.value)}
                placeholder="Filter files..."
                className="mt-4 w-full rounded-2xl border border-white/10 bg-zinc-950 px-3 py-2 text-xs text-white outline-none placeholder:text-zinc-600"
              />

              <div className="mt-4 max-h-[360px] overflow-auto pr-1">
                {visibleFiles.map((file) => (
                  <button
                    key={file.path}
                    type="button"
                    onClick={() => openFile(file.path)}
                    className={`mb-2 block w-full rounded-2xl border px-3 py-2 text-left text-xs transition ${
                      selectedFile === file.path
                        ? "border-cyan-300 bg-cyan-300/10 text-cyan-100"
                        : "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
                    }`}
                  >
                    <span className="block truncate font-bold">{file.path}</span>
                    <span className="text-[10px] text-zinc-500">{file.size} bytes</span>
                  </button>
                ))}
              </div>
            </aside>

            <section className="rounded-3xl border border-white/10 bg-black p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-200">
                    File Editor
                  </p>
                  <h2 className="mt-1 text-sm font-black">{selectedFile || "Choose a file to edit"}</h2>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={!selectedFile || fileBusy}
                    onClick={saveFile}
                    className="rounded-full bg-white px-4 py-2 text-xs font-black text-black disabled:opacity-40"
                  >
                    Save File
                  </button>
                  <button
                    type="button"
                    disabled={!selectedFile || fileBusy}
                    onClick={saveAndRestart}
                    className="rounded-full bg-emerald-300 px-4 py-2 text-xs font-black text-black disabled:opacity-40"
                  >
                    Save & Restart App
                  </button>
                  <button
                    type="button"
                    onClick={() => restartActiveApp("/editor")}
                    className="rounded-full border border-white/15 px-4 py-2 text-xs font-bold text-zinc-200"
                  >
                    Restart App
                  </button>
                  <a
                    href={downloadUrl}
                    className="rounded-full border border-white/15 px-4 py-2 text-xs font-bold text-zinc-200"
                  >
                    Download Updated ZIP
                  </a>
                </div>
              </div>

              <textarea
                value={fileContent}
                onChange={(event) => setFileContent(event.target.value)}
                spellCheck={false}
                placeholder="Open a generated file to edit its source..."
                className="mt-4 h-[420px] w-full rounded-2xl border border-white/10 bg-zinc-950 p-4 font-mono text-xs leading-6 text-zinc-100 outline-none placeholder:text-zinc-600"
              />
            </section>
          </div>
        </section>
      ) : null}

      <iframe
        key={frameSrc}
        src={frameSrc}
        title={`${projectId} runtime preview`}
        className={`w-full border-0 bg-white ${filePanelOpen ? "h-[calc(100vh-610px)] min-h-[360px]" : "h-[calc(100vh-178px)]"}`}
      />
    </main>
  );
}
