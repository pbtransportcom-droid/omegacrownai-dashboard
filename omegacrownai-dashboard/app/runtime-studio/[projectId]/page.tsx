"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type RuntimeFile = {
  name: string;
  path: string;
  size: number;
  modifiedAt: string;
};

export default function RuntimeStudioPage() {
  const params = useParams();
  const projectId = String(params.projectId);

  const [files, setFiles] = useState<RuntimeFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deploying, setDeploying] = useState(false);

  async function loadFiles() {
    setLoading(true);

    const response = await fetch(`/api/runtime-proxy/runs/${projectId}/files`, {
      cache: "no-store",
    });

    const data = await response.json();

    if (data?.ok) {
      setFiles(data.files || []);

      const first =
        data.files?.find((file: RuntimeFile) => file.path === "app/page.tsx") ||
        data.files?.[0];

      if (first) {
        await loadFile(first.path);
      }
    }

    setLoading(false);
  }

  async function loadFile(filePath: string) {
    setSelectedFile(filePath);

    const response = await fetch(
      `/api/runtime-proxy/runs/${projectId}/files/content?file=${encodeURIComponent(filePath)}`,
      { cache: "no-store" }
    );

    const data = await response.json();

    if (data?.ok) {
      setContent(data.content || "");
    }
  }

  async function redeployProject() {
    setDeploying(true);

    const response = await fetch(`/api/runtime-proxy/runs/${projectId}/deploy`, {
      method: "POST",
    });

    const data = await response.json();
    setDeploying(false);

    if (!data?.ok) {
      alert("Redeploy failed.");
      return;
    }

    window.open(data.previewUrl || `/deployed/${projectId}`, "_blank");
  }

  async function saveFile() {
    if (!selectedFile) return;

    setSaving(true);

    const response = await fetch(
      `/api/runtime-proxy/runs/${projectId}/files/save`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          file: selectedFile,
          content,
        }),
      }
    );

    const data = await response.json();
    setSaving(false);

    if (!data?.ok) {
      alert("Save failed.");
      return;
    }

    await loadFiles();
  }

  useEffect(() => {
    loadFiles();
  }, [projectId]);

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="border-b border-zinc-800 px-8 py-6">
        <p className="text-xs uppercase tracking-[0.35em] text-red-300">
          OmegaCrownAI Runtime Studio
        </p>

        <h1 className="mt-3 text-4xl font-black">Artifact File Browser</h1>

        <p className="mt-2 text-zinc-400">
          Project {projectId} generated source files, deployment package, and runtime artifacts.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <a
            href={`/live-runtime?projectId=${projectId}`}
            className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-bold"
          >
            Runtime
          </a>

          <a
            href={`/runtime-preview/${projectId}`}
            target="_blank"
            className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-bold"
          >
            Preview
          </a>

          <a
            href={`/api/runtime-proxy/runs/${projectId}/download`}
            className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-black"
          >
            Download ZIP
          </a>

          <a
            href={`/deployed/${projectId}`}
            target="_blank"
            className="rounded-xl bg-red-400 px-4 py-2 text-sm font-bold text-black"
          >
            Deployed Site
          </a>
        </div>
      </div>

      <div className="grid min-h-[calc(100vh-180px)] grid-cols-1 md:grid-cols-[320px_1fr]">
        <aside className="border-r border-zinc-800 bg-zinc-950 p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-black">Files</h2>
            <button
              onClick={loadFiles}
              className="rounded-lg border border-zinc-700 px-3 py-1 text-xs"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <p className="text-sm text-zinc-500">Loading files...</p>
          ) : (
            <div className="space-y-2">
              {files.map((file) => (
                <button
                  key={file.path}
                  onClick={() => loadFile(file.path)}
                  className={`w-full rounded-xl px-3 py-3 text-left text-sm ${
                    selectedFile === file.path
                      ? "bg-red-400 text-black"
                      : "bg-black text-zinc-300 hover:bg-zinc-900"
                  }`}
                >
                  <span className="block font-bold">{file.path}</span>
                  <span className="text-xs opacity-70">{file.size} bytes</span>
                </button>
              ))}
            </div>
          )}
        </aside>

        <section className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-black">{selectedFile || "Select a file"}</h2>
            <button
              onClick={saveFile}
              disabled={saving || !selectedFile}
              className="rounded-full bg-red-400 px-4 py-2 text-xs font-bold text-black disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save File"}
            </button>
          </div>

          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            className="min-h-[70vh] w-full overflow-auto rounded-3xl border border-zinc-800 bg-zinc-950 p-6 font-mono text-sm leading-6 text-zinc-200 outline-none"
            spellCheck={false}
          />
        </section>
      </div>
    </main>
  );
}
