"use client";

import { OmegaLogo } from "@/components/brand/OmegaLogo";

import { useEffect, useState } from "react";
import Link from "next/link";
import WebsitePreview from "@/components/projects/WebsitePreview";
import { getBuilderPath } from "@/lib/sugent/builder/registry";

type ProjectWorkspaceProps = {
  project: {
    id: string;
    name: string;
    owner: { email: string };
    createdAt: string;
  };
  initialPrompt?: string;
};

type ChatMessage = {
  id: string;
  role: string;
  content: string;
  createdAt: string;
};

export default function ProjectWorkspace({ project, initialPrompt = "" }: ProjectWorkspaceProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const [executePrompt, setExecutePrompt] = useState("");
  const [executeLoading, setExecuteLoading] = useState(false);
  const [executeResult, setExecuteResult] = useState<any>(null);
  const [executeError, setExecuteError] = useState("");

  const [websitePrompt, setWebsitePrompt] = useState(
    initialPrompt ||
      "Build me a modern biscuit shop website with menu, about section, contact section, warm colors, and order call-to-action."
  );
  const [websiteLoading, setWebsiteLoading] = useState(false);
  const [websiteResult, setWebsiteResult] = useState<any>(null);
  const [websiteError, setWebsiteError] = useState("");
  const [autoBuilt, setAutoBuilt] = useState(false);

  const [publishSlug, setPublishSlug] = useState("");
  const [publishStatus, setPublishStatus] = useState("");
  const [publishedUrl, setPublishedUrl] = useState("");
  const [builds, setBuilds] = useState<any[]>([]);
  const [publishedSites, setPublishedSites] = useState<any[]>([]);
  const [buildsLoading, setBuildsLoading] = useState(false);
  const [sugentEvents, setSugentEvents] = useState<any[]>([]);

  const [editMode, setEditMode] = useState(false);
  const [editableWebsite, setEditableWebsite] = useState<any>(null);
  const [editStatus, setEditStatus] = useState("");

  const [assetStatus, setAssetStatus] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [heroImageUrl, setHeroImageUrl] = useState("");

  async function loadMessages() {
    const res = await fetch(`/api/projects/${project.id}/chat`);
    if (!res.ok) return;

    const data = await res.json();
    setMessages(data.messages || []);
  }

  function makeSlug(value: string) {
    return String(value || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80);
  }

  async function loadBuilds() {
    setBuildsLoading(true);

    try {
      const res = await fetch(`/api/projects/${project.id}/builds`);
      const data = await res.json();

      if (res.ok && data.ok) {
        setBuilds(data.builds || []);
        setPublishedSites(data.published || []);
      }
    } catch {}

    setBuildsLoading(false);
  }

  async function loadSugentEvents() {
    try {
      const res = await fetch(`/api/projects/${project.id}/events`);
      const data = await res.json();

      if (res.ok && data.ok) {
        setSugentEvents(data.events || []);
      }
    } catch {}
  }

  async function publishWebsite(executionId?: string) {
    const selectedId = executionId || websiteResult?.saved?.id;

    if (!selectedId) {
      setPublishStatus("Build a website first before publishing.");
      return;
    }

    const slug =
      makeSlug(publishSlug) ||
      makeSlug(websiteResult?.result?.business || websiteResult?.result?.title || project.name);

    if (!slug) {
      setPublishStatus("Enter a valid slug.");
      return;
    }

    setPublishStatus("Publishing website...");

    try {
      const res = await fetch(`/api/projects/${project.id}/publish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          executionId: selectedId,
          slug,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Publish failed.");
      }

      setPublishedUrl(data.fullUrl || `https://omegacrownai.com/site/${slug}`);
      setPublishStatus("Website published successfully.");
      await loadBuilds();
    } catch (error: any) {
      setPublishStatus(error?.message || "Publish failed.");
    }
  }

  async function copyPublishedLink(url?: string) {
    const link = url || publishedUrl || "";

    if (!link) {
      setPublishStatus("No published link to copy yet.");
      return;
    }

    try {
      await navigator.clipboard.writeText(link);
      setPublishStatus("Published link copied.");
    } catch {
      setPublishStatus(link);
    }
  }

  async function deleteBuild(buildId: string) {
    if (!buildId) return;

    const yes = window.confirm("Delete this saved website build?");
    if (!yes) return;

    try {
      const res = await fetch(`/api/projects/${project.id}/builds/${buildId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Delete failed.");
      }

      if (websiteResult?.saved?.id === buildId) {
        setWebsiteResult(null);
      }

      setPublishStatus("Build deleted.");
      await loadBuilds();
    } catch (error: any) {
      setPublishStatus(error?.message || "Delete failed.");
    }
  }

  useEffect(() => {
    loadMessages();
    loadBuilds();
    loadSugentEvents();
  }, [project.id]);

  useEffect(() => {
    if (!initialPrompt.trim()) return;
    if (autoBuilt) return;

    setAutoBuilt(true);

    setTimeout(() => {
      buildWebsite();
    }, 600);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPrompt, autoBuilt]);

  async function sendMessage() {
    if (!message.trim()) return;

    setLoading(true);

    const current = message;
    setMessage("");

    const res = await fetch(`/api/projects/${project.id}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: current }),
    });

    if (res.ok) {
      await loadMessages();
    }

    setLoading(false);
  }

  async function runExecution() {
    if (!executePrompt.trim()) return;

    setExecuteLoading(true);
    setExecuteError("");
    setExecuteResult(null);

    const res = await fetch(`/api/projects/${project.id}/execute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt: executePrompt }),
    });

    const data = await res.json();

    if (!res.ok || !data.ok) {
      setExecuteError(data.error || "Execution failed");
      setExecuteLoading(false);
      return;
    }

    setExecuteResult(data);
    setExecutePrompt("");
    setExecuteLoading(false);
  }

  async function uploadProjectAsset(file: File | null, kind: string) {
    if (!file) return;

    setAssetStatus(`Uploading ${kind}...`);

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("kind", kind);

      const res = await fetch(`/api/projects/${project.id}/assets`, {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Upload failed.");
      }

      if (kind === "logo") {
        setLogoUrl(data.asset.url);
      }

      if (kind === "hero") {
        setHeroImageUrl(data.asset.url);
      }

      setAssetStatus(`${kind} uploaded successfully.`);

      if (websiteResult?.result) {
        setWebsiteResult((current: any) => ({
          ...current,
          result: {
            ...current.result,
            assets: {
              ...(current.result.assets || {}),
              [kind]: data.asset.url,
            },
          },
        }));
      }
    } catch (error: any) {
      setAssetStatus(error?.message || "Upload failed.");
    }
  }

  function startEditingWebsite() {
    if (!websiteResult?.result) {
      setEditStatus("Build a website first before editing.");
      return;
    }

    setEditableWebsite({
      ...JSON.parse(JSON.stringify(websiteResult.result)),
      assets: {
        ...(websiteResult.result.assets || {}),
        ...(logoUrl ? { logo: logoUrl } : {}),
        ...(heroImageUrl ? { hero: heroImageUrl } : {}),
      },
    });
    setEditMode(true);
    setEditStatus("Editing mode enabled.");
  }

  function updateEditable(path: string, value: string) {
    setEditableWebsite((current: any) => {
      const next = JSON.parse(JSON.stringify(current || {}));
      const parts = path.split(".");
      let target = next;

      for (let i = 0; i < parts.length - 1; i++) {
        if (!target[parts[i]]) target[parts[i]] = {};
        target = target[parts[i]];
      }

      target[parts[parts.length - 1]] = value;
      return next;
    });
  }

  function updateEditableArray(path: string, index: number, key: string, value: string) {
    setEditableWebsite((current: any) => {
      const next = JSON.parse(JSON.stringify(current || {}));
      const arr = path.split(".").reduce((obj: any, part: string) => obj?.[part], next);

      if (Array.isArray(arr) && arr[index]) {
        arr[index][key] = value;
      }

      return next;
    });
  }

  async function saveEditedWebsite() {
    if (!editableWebsite) {
      setEditStatus("Nothing to save.");
      return;
    }

    const savedId = websiteResult?.saved?.id;

    if (!savedId) {
      setEditStatus("Missing saved build ID.");
      return;
    }

    const finalWebsite = {
      ...editableWebsite,
      assets: {
        ...(editableWebsite.assets || {}),
        ...(logoUrl ? { logo: logoUrl } : {}),
        ...(heroImageUrl ? { hero: heroImageUrl } : {}),
      },
    };

    setWebsiteResult((current: any) => ({
      ...current,
      result: finalWebsite,
    }));

    setEditMode(false);
    setEditStatus("Edited website saved in preview. Publish again to make it live.");

    try {
      const res = await fetch(`/api/projects/${project.id}/builds/${savedId}/edit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          execution: finalWebsite,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Database save failed.");
      }

      setWebsiteResult((current: any) => ({
        ...current,
        result: data.build.execution,
      }));

      setEditStatus("Edited website saved to database. Publish again to update the live site.");
      await loadBuilds();
    } catch (error: any) {
      setEditStatus(error?.message || "Saved in preview, but database update failed.");
    }
  }

  async function buildWebsite() {
    if (!websitePrompt.trim()) return;

    setWebsiteLoading(true);
    setWebsiteError("");
    setWebsiteResult(null);

    const res = await fetch(`/api/projects/${project.id}/builder`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt: websitePrompt }),
    });

    const data = await res.json();

    if (!res.ok || !data.ok) {
      setWebsiteError(data.error || "Website build failed");
      setWebsiteLoading(false);
      return;
    }

    setWebsiteResult(data);

    const suggestedSlug = makeSlug(data.result?.business || data.result?.title || project.name);
    if (suggestedSlug) {
      setPublishSlug(suggestedSlug);
    }

    await loadBuilds();
    await loadSugentEvents();
    setWebsiteLoading(false);
  }

  const latestWebsiteBuild =
    builds.find((build: any) => build.domain === "website") || builds[0] || null;

  const latestWebsiteBuilderUrl = latestWebsiteBuild
    ? getBuilderPath("website", project.id, latestWebsiteBuild.id)
    : "";

  const latestTradingBuild =
    builds.find((build: any) => build.domain === "trading") || null;

  const latestTradingBuilderUrl = latestTradingBuild
    ? getBuilderPath("trading", project.id, latestTradingBuild.id)
    : "";

  const latestAutomationBuild =
    builds.find((build: any) => build.domain === "automation") || null;

  const latestAutomationBuilderUrl = latestAutomationBuild
    ? getBuilderPath("automation", project.id, latestAutomationBuild.id)
    : "";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{project.name}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#0f0f12] p-4 rounded-md border border-[#1c1c20]">
          <h2 className="text-lg mb-2">Project Info</h2>
          <p className="text-gray-400 text-sm">ID: {project.id}</p>
          <p className="text-gray-400 text-sm">Owner: {project.owner.email}</p>
          <p className="text-gray-400 text-sm">
            Created: {new Date(project.createdAt).toLocaleString()}
          </p>
        </div>

        <div className="bg-[#0f0f12] p-4 rounded-md border border-[#1c1c20]">
          <h2 className="text-lg mb-2">Project Tools</h2>
          <ul className="text-gray-400 text-sm space-y-1">
            <li>• Project AI Chat</li>
            <li>• Multi-Agent Execution</li>
            <li>• Website Builder</li>
            <li>• Saved Build Results</li>
            <li>• Trading Analysis Engine</li>
          </ul>
        </div>
      </div>

      <div className="rounded-md border border-cyan-500/25 bg-cyan-500/10 p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">
              Sugent Website Builder
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">
              {latestWebsiteBuild ? latestWebsiteBuild.label : "No website draft yet"}
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              {latestWebsiteBuild
                ? `${latestWebsiteBuild.status || "draft"} · ${latestWebsiteBuild.domain || "website"} · Build ID: ${latestWebsiteBuild.id}`
                : "Create a website draft first, then open the structured builder."}
            </p>
          </div>

          {latestWebsiteBuild ? (
            <a
              href={latestWebsiteBuilderUrl}
              className="inline-flex rounded-xl bg-cyan-600 px-5 py-3 text-sm font-bold text-white hover:bg-cyan-500"
            >
              Open Website Builder
            </a>
          ) : (
            <button
              onClick={buildWebsite}
              disabled={websiteLoading}
              className="inline-flex rounded-xl bg-amber-600 px-5 py-3 text-sm font-bold text-white hover:bg-amber-500 disabled:opacity-60"
            >
              {websiteLoading ? "Creating Draft..." : "Create Website Draft"}
            </button>
          )}
        </div>
      </div>

      <div className="rounded-md border border-emerald-500/25 bg-emerald-500/10 p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">
              Sugent Trading Builder
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">
              {latestTradingBuild ? latestTradingBuild.label : "No trading strategy yet"}
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              {latestTradingBuild
                ? `${latestTradingBuild.status || "draft"} · ${latestTradingBuild.domain || "trading"} · Build ID: ${latestTradingBuild.id}`
                : "Create a trading strategy with the Super Agent, then open the trading builder."}
            </p>
          </div>

          {latestTradingBuild ? (
            <a
              href={latestTradingBuilderUrl}
              className="inline-flex rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-500"
            >
              Open Trading Builder
            </a>
          ) : (
            <a
              href="/chat"
              className="inline-flex rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-5 py-3 text-sm font-bold text-emerald-100 hover:bg-emerald-500/20"
            >
              Ask Super Agent
            </a>
          )}
        </div>
      </div>

      <div className="rounded-md border border-violet-500/25 bg-violet-500/10 p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-violet-300">
              Sugent Automation Builder
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">
              {latestAutomationBuild ? latestAutomationBuild.label : "No automation flow yet"}
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              {latestAutomationBuild
                ? `${latestAutomationBuild.status || "draft"} · ${latestAutomationBuild.domain || "automation"} · Build ID: ${latestAutomationBuild.id}`
                : "Create an automation flow with the Super Agent, then open the automation builder."}
            </p>
          </div>

          {latestAutomationBuild ? (
            <a
              href={latestAutomationBuilderUrl}
              className="inline-flex rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white hover:bg-violet-500"
            >
              Open Automation Builder
            </a>
          ) : (
            <a
              href="/chat"
              className="inline-flex rounded-xl border border-violet-400/30 bg-violet-500/10 px-5 py-3 text-sm font-bold text-violet-100 hover:bg-violet-500/20"
            >
              Ask Super Agent
            </a>
          )}
        </div>
      </div>

      <div className="rounded-md border border-white/10 bg-[#0f0f12] p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
              Sugent OS Audit
            </p>
            <h2 className="mt-1 text-lg font-semibold text-white">
              Project Activity
            </h2>
          </div>

          <button
            onClick={loadSugentEvents}
            className="rounded-lg border border-white/10 px-3 py-2 text-xs text-gray-200 hover:bg-white/5"
          >
            Refresh
          </button>
        </div>

        <div className="mt-4 space-y-2">
          {sugentEvents.length ? (
            sugentEvents.slice(0, 8).map((event: any) => (
              <div
                key={event.id}
                className="rounded-xl border border-white/10 bg-black/20 p-3"
              >
                <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                  <div className="text-sm font-semibold text-white">
                    {event.message}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(event.createdAt).toLocaleString()}
                  </div>
                </div>

                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-white/10 px-2 py-1 text-gray-300">
                    {event.type}
                  </span>
                  {event.domain && (
                    <span className="rounded-full bg-cyan-500/10 px-2 py-1 text-cyan-200">
                      {event.domain}
                    </span>
                  )}
                  {event.buildId && (
                    <span className="rounded-full bg-amber-500/10 px-2 py-1 text-amber-200">
                      build: {event.buildId}
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-gray-400">
              No Sugent OS activity has been recorded for this project yet.
            </div>
          )}
        </div>
      </div>

      <div className="bg-[#0f0f12] p-4 rounded-md border border-[#1c1c20] space-y-4">
        <h2 className="text-lg">Brand Assets</h2>

        <p className="text-sm text-gray-500">
          Upload a logo and hero image for this website project.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="rounded border border-[#2a2a33] bg-[#111116] p-4">
            <div className="text-sm font-medium text-gray-100">Logo</div>
            <div className="mt-1 text-xs text-gray-500">PNG, JPG, or WebP</div>
            <input
              type="file"
              accept="image/*"
              className="mt-3 block w-full text-xs text-gray-400"
              onChange={(e) => uploadProjectAsset(e.target.files?.[0] || null, "logo")}
            />
            {logoUrl && (
              <img src={logoUrl} alt="Logo" className="mt-3 h-16 rounded bg-white/10 object-contain p-2" />
            )}
          </label>

          <label className="rounded border border-[#2a2a33] bg-[#111116] p-4">
            <div className="text-sm font-medium text-gray-100">Hero Image</div>
            <div className="mt-1 text-xs text-gray-500">Main visual for the generated website</div>
            <input
              type="file"
              accept="image/*"
              className="mt-3 block w-full text-xs text-gray-400"
              onChange={(e) => uploadProjectAsset(e.target.files?.[0] || null, "hero")}
            />
            {heroImageUrl && (
              <img src={heroImageUrl} alt="Hero" className="mt-3 h-32 w-full rounded object-cover" />
            )}
          </label>
        </div>

        {assetStatus && (
          <div className="rounded border border-[#2a2a33] bg-[#111116] px-3 py-2 text-xs text-gray-300">
            {assetStatus}
          </div>
        )}
      </div>

      <div className="bg-[#0f0f12] p-4 rounded-md border border-[#1c1c20] space-y-4">
        <h2 className="text-lg">Build Website</h2>

        <p className="text-sm text-gray-500">
          Generate a real website build result from your prompt. The output is saved to this project.
        </p>

        {initialPrompt && (
          <div className="rounded border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
            Super Agent detected your prompt and is preparing a premium website draft automatically.
          </div>
        )}

        <textarea
          className="min-h-32 w-full bg-[#1c1c20] p-3 rounded text-gray-200"
          placeholder="Example: build me a biscuit shop website with warm colors, menu, about section, and order CTA"
          value={websitePrompt}
          onChange={(e) => setWebsitePrompt(e.target.value)}
        />

        <button
          onClick={buildWebsite}
          disabled={websiteLoading}
          className="px-4 py-2 bg-amber-600 text-white rounded disabled:opacity-60"
        >
          {websiteLoading ? "Building Website..." : "Build Website"}
        </button>

        {websiteError && (
          <div className="rounded border border-red-700 bg-red-950/40 p-3 text-sm text-red-300">
            {websiteError}
          </div>
        )}

        {websiteResult && (
          <div className="space-y-4 rounded border border-[#2a2a33] bg-[#111116] p-4">
            <div>
              <div className="text-xs uppercase tracking-wide text-gray-500">
                Live Website Preview
              </div>
              <div className="mt-3">
                <WebsitePreview data={websiteResult.result} />
              </div>
            </div>

            <div>
              <div className="text-xs uppercase tracking-wide text-gray-500">
                Website Title
              </div>
              <div className="text-lg font-semibold text-gray-100">
                {websiteResult.result?.title || "Generated Website"}
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded bg-[#1c1c20] p-3">
                <div className="text-xs uppercase tracking-wide text-gray-500">
                  Business
                </div>
                <div className="text-sm text-gray-200">
                  {websiteResult.result?.business || project.name}
                </div>
              </div>

              <div className="rounded bg-[#1c1c20] p-3">
                <div className="text-xs uppercase tracking-wide text-gray-500">
                  Style
                </div>
                <div className="text-sm text-gray-200">
                  {websiteResult.result?.style || "modern"}
                </div>
              </div>

              <div className="rounded bg-[#1c1c20] p-3">
                <div className="text-xs uppercase tracking-wide text-gray-500">
                  Saved ID
                </div>
                <div className="text-xs text-gray-400">
                  {websiteResult.saved?.id}
                </div>
              </div>
            </div>

            {websiteResult.saved?.id && (
              <div className="space-y-3 rounded border border-amber-500/20 bg-amber-500/5 p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div className="text-xs uppercase tracking-wide text-amber-300">
                    Publish Controls
                  </div>

                  <button
                    onClick={startEditingWebsite}
                    className="w-fit rounded border border-cyan-400/30 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-200"
                  >
                    Edit Website Sections
                  </button>
                </div>

                <div className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto]">
                  <input
                    className="rounded bg-[#1c1c20] px-3 py-2 text-sm text-gray-100 outline-none"
                    value={publishSlug}
                    onChange={(e) => setPublishSlug(makeSlug(e.target.value))}
                    placeholder="custom-site-slug"
                  />

                  <button
                    onClick={() => publishWebsite()}
                    className="rounded bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-500"
                  >
                    Publish
                  </button>

                  <a
                    href={`/site/${websiteResult.saved.id}`}
                    target="_blank"
                    className="rounded border border-[#2a2a33] px-4 py-2 text-sm text-gray-200 hover:bg-[#1c1c20]"
                  >
                    Open Build
                  </a>

                  <button
                    onClick={() => copyPublishedLink()}
                    className="rounded border border-[#2a2a33] px-4 py-2 text-sm text-gray-200 hover:bg-[#1c1c20]"
                  >
                    Copy Link
                  </button>
                </div>

                {publishedUrl && (
                  <a
                    href={publishedUrl.replace("https://omegacrownai.com", "")}
                    target="_blank"
                    className="block break-all text-sm text-amber-300 hover:underline"
                  >
                    {publishedUrl}
                  </a>
                )}

                {publishStatus && (
                  <div className="rounded border border-[#2a2a33] bg-[#0f0f12] px-3 py-2 text-xs text-gray-300">
                    {publishStatus}
                  </div>
                )}

                {editStatus && (
                  <div className="rounded border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-200">
                    {editStatus}
                  </div>
                )}

                {editMode && editableWebsite && (
                  <div className="space-y-4 rounded border border-cyan-500/20 bg-cyan-500/5 p-4">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="text-sm font-semibold text-cyan-200">
                          Website Section Editor
                        </div>
                        <div className="text-xs text-gray-500">
                          Edit the generated website copy, then save and publish again.
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={saveEditedWebsite}
                          className="rounded bg-cyan-600 px-3 py-2 text-xs font-semibold text-white hover:bg-cyan-500"
                        >
                          Save Edited Website
                        </button>

                        <button
                          onClick={() => setEditMode(false)}
                          className="rounded border border-[#2a2a33] px-3 py-2 text-xs text-gray-200 hover:bg-[#1c1c20]"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <label className="space-y-1">
                        <div className="text-xs text-gray-500">Website Title</div>
                        <input
                          className="w-full rounded bg-[#1c1c20] px-3 py-2 text-sm text-gray-100 outline-none"
                          value={editableWebsite.title || ""}
                          onChange={(e) => updateEditable("title", e.target.value)}
                        />
                      </label>

                      <label className="space-y-1">
                        <div className="text-xs text-gray-500">Business Name</div>
                        <input
                          className="w-full rounded bg-[#1c1c20] px-3 py-2 text-sm text-gray-100 outline-none"
                          value={editableWebsite.business || ""}
                          onChange={(e) => updateEditable("business", e.target.value)}
                        />
                      </label>

                      <label className="space-y-1 md:col-span-2">
                        <div className="text-xs text-gray-500">Hero Headline</div>
                        <input
                          className="w-full rounded bg-[#1c1c20] px-3 py-2 text-sm text-gray-100 outline-none"
                          value={editableWebsite.hero?.headline || ""}
                          onChange={(e) => updateEditable("hero.headline", e.target.value)}
                        />
                      </label>

                      <label className="space-y-1 md:col-span-2">
                        <div className="text-xs text-gray-500">Hero Subheadline</div>
                        <textarea
                          className="min-h-24 w-full rounded bg-[#1c1c20] px-3 py-2 text-sm text-gray-100 outline-none"
                          value={editableWebsite.hero?.subheadline || ""}
                          onChange={(e) => updateEditable("hero.subheadline", e.target.value)}
                        />
                      </label>

                      <label className="space-y-1">
                        <div className="text-xs text-gray-500">Primary CTA</div>
                        <input
                          className="w-full rounded bg-[#1c1c20] px-3 py-2 text-sm text-gray-100 outline-none"
                          value={editableWebsite.hero?.primaryCta || ""}
                          onChange={(e) => updateEditable("hero.primaryCta", e.target.value)}
                        />
                      </label>

                      <label className="space-y-1">
                        <div className="text-xs text-gray-500">Secondary CTA</div>
                        <input
                          className="w-full rounded bg-[#1c1c20] px-3 py-2 text-sm text-gray-100 outline-none"
                          value={editableWebsite.hero?.secondaryCta || ""}
                          onChange={(e) => updateEditable("hero.secondaryCta", e.target.value)}
                        />
                      </label>
                    </div>

                    <div className="space-y-3">
                      <div className="text-xs uppercase tracking-wide text-gray-500">
                        Features / Services
                      </div>

                      {(editableWebsite.features || []).slice(0, 6).map((feature: any, index: number) => (
                        <div key={`feature-edit-${index}`} className="grid gap-2 rounded bg-[#111116] p-3 md:grid-cols-2">
                          <input
                            className="rounded bg-[#1c1c20] px-3 py-2 text-sm text-gray-100 outline-none"
                            value={feature.title || ""}
                            onChange={(e) => updateEditableArray("features", index, "title", e.target.value)}
                            placeholder="Feature title"
                          />
                          <input
                            className="rounded bg-[#1c1c20] px-3 py-2 text-sm text-gray-100 outline-none"
                            value={feature.description || ""}
                            onChange={(e) => updateEditableArray("features", index, "description", e.target.value)}
                            placeholder="Feature description"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="space-y-3">
                      <div className="text-xs uppercase tracking-wide text-gray-500">
                        Products / Packages
                      </div>

                      {(editableWebsite.products || []).slice(0, 6).map((product: any, index: number) => (
                        <div key={`product-edit-${index}`} className="grid gap-2 rounded bg-[#111116] p-3 md:grid-cols-4">
                          <input
                            className="rounded bg-[#1c1c20] px-3 py-2 text-sm text-gray-100 outline-none"
                            value={product.name || ""}
                            onChange={(e) => updateEditableArray("products", index, "name", e.target.value)}
                            placeholder="Name"
                          />
                          <input
                            className="rounded bg-[#1c1c20] px-3 py-2 text-sm text-gray-100 outline-none md:col-span-2"
                            value={product.description || ""}
                            onChange={(e) => updateEditableArray("products", index, "description", e.target.value)}
                            placeholder="Description"
                          />
                          <input
                            className="rounded bg-[#1c1c20] px-3 py-2 text-sm text-gray-100 outline-none"
                            value={product.price || ""}
                            onChange={(e) => updateEditableArray("products", index, "price", e.target.value)}
                            placeholder="Price"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="space-y-3 rounded border border-[#2a2a33] bg-[#111116] p-4">
                      <div>
                        <div className="text-sm font-semibold text-amber-200">
                          Brand Color Editor
                        </div>
                        <div className="text-xs text-gray-500">
                          Choose the website colors, then save and publish again.
                        </div>
                      </div>

                      <div className="grid gap-3 md:grid-cols-3">
                        {[
                          ["theme.background", "Background"],
                          ["theme.surface", "Surface / Cards"],
                          ["theme.primary", "Primary Text"],
                          ["theme.secondary", "Secondary / Gold"],
                          ["theme.accent", "Accent"],
                          ["theme.muted", "Muted Text"],
                        ].map(([path, label]) => {
                          const value = path
                            .split(".")
                            .reduce((obj: any, key: string) => obj?.[key], editableWebsite) || "#ffffff";

                          return (
                            <label key={path} className="space-y-1">
                              <div className="text-xs text-gray-500">{label}</div>
                              <div className="flex gap-2">
                                <input
                                  type="color"
                                  className="h-10 w-12 rounded border border-[#2a2a33] bg-[#1c1c20]"
                                  value={value}
                                  onChange={(e) => updateEditable(path, e.target.value)}
                                />

                                <input
                                  className="w-full rounded bg-[#1c1c20] px-3 py-2 text-sm text-gray-100 outline-none"
                                  value={value}
                                  onChange={(e) => updateEditable(path, e.target.value)}
                                />
                              </div>
                            </label>
                          );
                        })}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {[
                          {
                            name: "Luxury Black Gold",
                            theme: {
                              background: "#050505",
                              surface: "#14100a",
                              primary: "#fff7ed",
                              secondary: "#facc15",
                              accent: "#f97316",
                              muted: "#d6b98c",
                            },
                          },
                          {
                            name: "Royal Blue",
                            theme: {
                              background: "#020617",
                              surface: "#0f172a",
                              primary: "#eff6ff",
                              secondary: "#38bdf8",
                              accent: "#2563eb",
                              muted: "#93c5fd",
                            },
                          },
                          {
                            name: "Emerald Premium",
                            theme: {
                              background: "#02130d",
                              surface: "#06281b",
                              primary: "#ecfdf5",
                              secondary: "#34d399",
                              accent: "#10b981",
                              muted: "#a7f3d0",
                            },
                          },
                          {
                            name: "Purple SaaS",
                            theme: {
                              background: "#0f0620",
                              surface: "#1e1038",
                              primary: "#faf5ff",
                              secondary: "#c084fc",
                              accent: "#9333ea",
                              muted: "#d8b4fe",
                            },
                          },
                        ].map((preset) => (
                          <button
                            key={preset.name}
                            onClick={() => {
                              setEditableWebsite((current: any) => ({
                                ...(current || {}),
                                theme: preset.theme,
                              }));
                            }}
                            className="rounded-full border border-[#2a2a33] px-3 py-2 text-xs text-gray-200 hover:border-amber-400/50 hover:text-white"
                          >
                            {preset.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <label className="space-y-1">
                        <div className="text-xs text-gray-500">Footer Headline</div>
                        <input
                          className="w-full rounded bg-[#1c1c20] px-3 py-2 text-sm text-gray-100 outline-none"
                          value={editableWebsite.footer?.headline || ""}
                          onChange={(e) => updateEditable("footer.headline", e.target.value)}
                        />
                      </label>

                      <label className="space-y-1">
                        <div className="text-xs text-gray-500">Footer CTA</div>
                        <input
                          className="w-full rounded bg-[#1c1c20] px-3 py-2 text-sm text-gray-100 outline-none"
                          value={editableWebsite.footer?.cta || ""}
                          onChange={(e) => updateEditable("footer.cta", e.target.value)}
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div>
              <div className="text-xs uppercase tracking-wide text-gray-500">
                Pages
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {(websiteResult.result?.pages || []).map((page: string) => (
                  <span
                    key={page}
                    className="rounded-full bg-[#1c1c20] px-3 py-1 text-xs text-gray-200"
                  >
                    {page}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs uppercase tracking-wide text-gray-500">
                Sections
              </div>
              <div className="mt-2 space-y-2">
                {(websiteResult.result?.sections || []).map((section: any, index: number) => (
                  <div key={index} className="rounded bg-[#1c1c20] p-3">
                    <div className="font-medium text-gray-100">
                      {section.name || `Section ${index + 1}`}
                    </div>
                    {section.headline && (
                      <div className="mt-1 text-sm text-gray-200">
                        {section.headline}
                      </div>
                    )}
                    {section.body && (
                      <div className="mt-1 text-sm text-gray-400">
                        {section.body}
                      </div>
                    )}
                    {section.cta && (
                      <div className="mt-2 text-xs text-amber-400">
                        CTA: {section.cta}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <details className="rounded bg-[#1c1c20] p-3">
              <summary className="cursor-pointer text-sm text-gray-200">
                View Generated Code
              </summary>
              <pre className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap text-xs text-gray-300">
                {websiteResult.result?.code?.["app/page.tsx"] || "No code returned."}
              </pre>
            </details>
          </div>
        )}
      </div>

      <div className="bg-[#0f0f12] p-4 rounded-md border border-[#1c1c20] space-y-4">
        <h2 className="text-lg">Run Multi-Agent Execution</h2>

        <p className="text-sm text-gray-500">
          Ask OmegaCrownAI to build, analyze, automate, or plan inside this project.
          The result will be saved to the project database.
        </p>

        <textarea
          className="min-h-28 w-full bg-[#1c1c20] p-3 rounded text-gray-200"
          placeholder="Example: build a luxury AI homepage, analyze BTC, and create an automation workflow"
          value={executePrompt}
          onChange={(e) => setExecutePrompt(e.target.value)}
        />

        <button
          onClick={runExecution}
          disabled={executeLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60"
        >
          {executeLoading ? "Running..." : "Run AI Execution"}
        </button>

        {executeError && (
          <div className="rounded border border-red-700 bg-red-950/40 p-3 text-sm text-red-300">
            {executeError}
          </div>
        )}

        {executeResult && (
          <div className="space-y-3 rounded border border-[#2a2a33] bg-[#111116] p-4">
            <div>
              <div className="text-xs uppercase tracking-wide text-gray-500">
                Provider
              </div>
              <div className="text-sm text-gray-200">
                {executeResult.ai?.provider || "local"} · {executeResult.ai?.model || "router"}
              </div>
            </div>

            <div>
              <div className="text-xs uppercase tracking-wide text-gray-500">
                Intents
              </div>
              <div className="text-sm text-gray-200">
                {(executeResult.ai?.intents || []).join(", ")}
              </div>
            </div>

            <div>
              <div className="text-xs uppercase tracking-wide text-gray-500">
                AI Reply
              </div>
              <div className="whitespace-pre-wrap text-sm text-gray-200">
                {executeResult.ai?.reply}
              </div>
            </div>

            <div>
              <div className="text-xs uppercase tracking-wide text-gray-500">
                Saved Execution ID
              </div>
              <div className="text-xs text-gray-400">
                {executeResult.saved?.id}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-[#0f0f12] p-4 rounded-md border border-[#1c1c20] space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg">Previous Website Builds</h2>
            <p className="text-sm text-gray-500">
              Publish, open, copy, or delete saved website drafts.
            </p>
          </div>

          <button
            onClick={loadBuilds}
            disabled={buildsLoading}
            className="rounded border border-[#2a2a33] px-3 py-2 text-xs text-gray-200 hover:bg-[#1c1c20] disabled:opacity-60"
          >
            {buildsLoading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {builds.length === 0 && (
          <div className="rounded border border-[#2a2a33] bg-[#111116] p-3 text-sm text-gray-500">
            No saved website builds yet.
          </div>
        )}

        {builds.length > 0 && (
          <div className="grid gap-3">
            {builds.map((build: any) => {
              const published = publishedSites.find((site: any) => site.executionId === build.id);
              const publicUrl = published
                ? `https://omegacrownai.com/site/${published.slug}`
                : `https://omegacrownai.com/site/${build.id}`;

              return (
                <div
                  key={build.id}
                  className="rounded border border-[#2a2a33] bg-[#111116] p-3"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="font-medium text-gray-100">
                        {build.execution?.title || build.execution?.business || "Website Build"}
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        {new Date(build.createdAt).toLocaleString()} · {build.id}
                      </div>
                      {published && (
                        <div className="mt-1 text-xs text-amber-300">
                          Published: /site/{published.slug}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <a
                        href={published ? `/site/${published.slug}` : `/site/${build.id}`}
                        target="_blank"
                        className="rounded bg-amber-600 px-3 py-2 text-xs font-medium text-white hover:bg-amber-500"
                      >
                        Open
                      </a>

                      <button
                        onClick={() => copyPublishedLink(publicUrl)}
                        className="rounded border border-[#2a2a33] px-3 py-2 text-xs text-gray-200 hover:bg-[#1c1c20]"
                      >
                        Copy
                      </button>

                      <button
                        onClick={() => publishWebsite(build.id)}
                        className="rounded border border-amber-500/40 px-3 py-2 text-xs text-amber-200 hover:bg-amber-500/10"
                      >
                        Publish Current Slug
                      </button>

                      <button
                        onClick={() => deleteBuild(build.id)}
                        className="rounded border border-red-500/40 px-3 py-2 text-xs text-red-300 hover:bg-red-500/10"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-[#0f0f12] p-4 rounded-md border border-[#1c1c20] space-y-4">
        <h2 className="text-lg">Project AI Chat</h2>

        <div className="space-y-3 max-h-[420px] overflow-auto">
          {messages.length === 0 && (
            <p className="text-sm text-gray-500">
              No project messages yet. Start a conversation with the AI inside this project.
            </p>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-3 rounded-md text-sm border ${
                msg.role === "user"
                  ? "bg-blue-600/15 border-blue-600/30 text-white"
                  : "bg-[#1c1c20] border-[#2a2a33] text-gray-200"
              }`}
            >
              <div className="text-xs uppercase tracking-wide mb-1 text-gray-400">
                {msg.role}
              </div>
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            className="flex-1 bg-[#1c1c20] p-2 rounded text-gray-200"
            placeholder="Ask AI inside this project..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <button
            onClick={sendMessage}
            disabled={loading}
            className="px-4 bg-blue-600 text-white rounded disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
