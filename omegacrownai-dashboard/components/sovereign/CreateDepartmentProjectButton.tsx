"use client";

import { useState } from "react";

export function CreateDepartmentProjectButton({
  department,
  projectType,
  label = "Create Department Project",
}: {
  department: string;
  projectType: string;
  label?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function createProject() {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/sovereign/projects/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          department,
          type: projectType,
          name: `${department.charAt(0).toUpperCase()}${department.slice(1)} Department Project`,
          prompt: `Create a Sovereign AI Company OS project for the ${department} department.`,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.ok) {
        throw new Error(data?.error || "Could not create project.");
      }

      setMessage("Project created. Opening department workspace...");
      window.location.href = data.redirectTo || `/projects/${data.project?.id || ""}`;
    } catch (error: any) {
      setMessage(error?.message || "Project creation failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={createProject}
        disabled={loading}
        className="w-full rounded-2xl border border-cyan-300/30 bg-cyan-400 p-5 text-left text-black shadow-lg shadow-cyan-950/20 transition hover:bg-cyan-300 disabled:opacity-60"
      >
        <p className="text-xs font-black uppercase tracking-wide opacity-70">
          Create
        </p>
        <h3 className="mt-2 text-xl font-black">
          {loading ? "Creating Project..." : label}
        </h3>
        <p className="mt-2 text-sm font-semibold leading-6">
          Create a real project record and route directly into the matching department workspace.
        </p>
      </button>

      {message ? (
        <p className="mt-3 text-xs font-semibold text-cyan-100">{message}</p>
      ) : null}
    </div>
  );
}
