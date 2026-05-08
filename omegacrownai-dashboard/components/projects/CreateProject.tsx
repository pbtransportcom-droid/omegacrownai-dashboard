"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateProject({ initialPrompt = "" }: { initialPrompt?: string }) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function createProject() {
    if (!name.trim()) return;

    setLoading(true);
    setError("");

    const res = await fetch("/api/projects/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      setError(data?.error || "Project creation failed. Please make sure you are logged in.");
      setLoading(false);
      return;
    }

    const target = initialPrompt
      ? `/projects/${data.id}?prompt=${encodeURIComponent(initialPrompt)}`
      : `/projects/${data.id}`;

    router.push(target as any);
  }

  return (
    <div className="rounded-xl border border-border bg-panel/60 p-5">
      <h2 className="text-lg font-semibold">Create New Project</h2>

      <div className="mt-4 flex gap-3">
        <input
          className="w-full rounded-xl border border-border bg-black/20 px-3 py-2.5 text-sm outline-none placeholder:text-muted focus:border-accent"
          placeholder="Project name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <button
          onClick={createProject}
          disabled={loading}
          className="rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {loading ? "Creating..." : "Create"}
        </button>
      </div>

      {initialPrompt && (
        <p className="mt-3 text-xs text-muted">
          This project will open with your homepage prompt ready.
        </p>
      )}

      {error && (
        <div className="mt-4 rounded border border-red-700 bg-red-950/40 p-3 text-sm text-red-300">
          {error}
        </div>
      )}
    </div>
  );
}
