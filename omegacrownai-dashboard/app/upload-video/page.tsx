"use client";

import { useState } from "react";

type UploadedFile = {
  id: string;
  originalName: string;
  url: string;
  fullUrl: string;
  caption: string;
};

export default function UploadVideoPage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [title, setTitle] = useState("My AI Video");
  const [brandName, setBrandName] = useState("OmegaCrownAI");
  const [website, setWebsite] = useState("OmegaCrownAI.com");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoPreview, setLogoPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [error, setError] = useState("");

  async function uploadLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");

    const formData = new FormData();
    formData.append("logo", file);

    try {
      const res = await fetch("/api/ai/brand/upload-logo", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Logo upload failed.");
      }

      setLogoUrl(data.logoUrl || "");
      setLogoPreview(data.fullLogoUrl || "");
    } catch (err: any) {
      setError(err?.message || "Logo upload failed.");
    }
  }

  async function uploadFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;

    setLoading(true);
    setError("");
    setVideoUrl("");

    const formData = new FormData();
    selected.forEach((file) => formData.append("files", file));

    try {
      const res = await fetch("/api/ai/video/upload-files", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Upload failed.");
      }

      setFiles(data.files || []);
    } catch (err: any) {
      setError(err?.message || "Upload failed.");
    }

    setLoading(false);
  }

  function updateCaption(index: number, caption: string) {
    setFiles((prev) =>
      prev.map((file, i) => (i === index ? { ...file, caption } : file))
    );
  }

  async function renderVideo() {
    if (!files.length) {
      setError("Upload images first.");
      return;
    }

    setRendering(true);
    setError("");
    setVideoUrl("");

    try {
      const res = await fetch("/api/ai/video/render-uploaded", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          scenes: files,
          logoUrl,
          brandName,
          website,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Render failed.");
      }

      const base = window.location.origin;
      setVideoUrl(data.fullVideoUrl || `${base}${data.videoUrl}`);
    } catch (err: any) {
      setError(err?.message || "Render failed.");
    }

    setRendering(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted">
          Upload Video
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          Turn Customer Images Into Video
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Upload real photos, add captions, and render a branded MP4 video.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-panel/60 p-5">
        <h2 className="text-lg font-semibold">Upload Images</h2>

        <input
          className="mt-4 block w-full rounded-xl border border-border bg-black/20 p-3 text-sm"
          type="file"
          accept="image/*"
          multiple
          onChange={uploadFiles}
        />

        <input
          className="mt-4 w-full rounded-xl border border-border bg-black/20 px-3 py-2 text-sm outline-none"
          placeholder="Video title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <input
            className="w-full rounded-xl border border-border bg-black/20 px-3 py-2 text-sm outline-none"
            placeholder="Brand name..."
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
          />

          <input
            className="w-full rounded-xl border border-border bg-black/20 px-3 py-2 text-sm outline-none"
            placeholder="Website..."
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />

          <label className="cursor-pointer rounded-xl border border-border bg-black/20 px-3 py-2 text-sm text-muted">
            Upload Logo
            <input
              className="hidden"
              type="file"
              accept="image/*"
              onChange={uploadLogo}
            />
          </label>
        </div>

        {logoPreview && (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-border bg-black/20 p-3">
            <img src={logoPreview} alt="Brand logo" className="h-12 w-12 rounded-lg object-contain bg-white/10" />
            <div>
              <div className="text-sm font-medium">Logo uploaded</div>
              <div className="text-xs text-muted">This logo will be used as a video watermark.</div>
            </div>
          </div>
        )}

        {loading && (
          <div className="mt-4 text-sm text-orange-300">Uploading images...</div>
        )}

        {error && (
          <div className="mt-4 rounded border border-red-700 bg-red-950/40 p-3 text-sm text-red-300">
            {error}
          </div>
        )}
      </div>

      {files.length > 0 && (
        <div className="rounded-xl border border-border bg-panel/60 p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="text-lg font-semibold">Scenes</h2>

            <button
              onClick={renderVideo}
              disabled={rendering}
              className="rounded-xl bg-gradient-to-r from-orange-500 to-yellow-500 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
            >
              {rendering ? "Rendering Video..." : "Render Upload Video"}
            </button>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {files.map((file, index) => (
              <div
                key={file.id}
                className="overflow-hidden rounded-2xl border border-border bg-black/20"
              >
                <img
                  src={file.fullUrl}
                  alt={file.originalName}
                  className="h-56 w-full object-cover"
                />

                <div className="space-y-3 p-4">
                  <div className="text-sm font-semibold">
                    Scene {index + 1}
                  </div>

                  <input
                    className="w-full rounded-xl border border-border bg-black/20 px-3 py-2 text-sm outline-none"
                    value={file.caption}
                    onChange={(e) => updateCaption(index, e.target.value)}
                    placeholder="Caption for this scene..."
                  />

                  <div className="text-xs text-muted">
                    {file.originalName}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {videoUrl && (
        <div className="rounded-xl border border-emerald-500/30 bg-panel/60 p-5">
          <h2 className="text-lg font-semibold">Video Preview</h2>

          <video
            className="mt-4 w-full rounded-xl border border-border"
            controls
            src={videoUrl}
          />

          <a
            href={videoUrl}
            download
            target="_blank"
            className="mt-4 inline-block rounded-xl bg-white px-4 py-2 text-sm font-medium text-black"
          >
            Download Video
          </a>
        </div>
      )}
    </div>
  );
}
