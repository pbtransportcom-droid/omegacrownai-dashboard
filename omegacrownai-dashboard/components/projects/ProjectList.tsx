"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Project = {
  id: string;
  name: string;
  createdAt?: string;
};

export default function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/projects/list");

      if (!res.ok) {
        setError("Please log in to view your projects.");
        return;
      }

      const data = await res.json();
      setProjects(Array.isArray(data) ? data : []);
    }

    load();
  }, []);

  return (
    <div className="rounded-xl border border-border bg-panel/60 p-5">
      <h2 className="text-lg font-semibold">Your Projects</h2>

      {error && (
        <div className="mt-4 rounded border border-red-700 bg-red-950/40 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {!error && projects.length === 0 && (
        <p className="mt-4 text-sm text-muted">No projects yet. Create your first project above.</p>
      )}

      <div className="mt-4 space-y-3">
        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/projects/${project.id}`}
            className="block rounded-xl border border-border bg-black/20 p-4 transition hover:border-accent"
          >
            <div className="font-medium text-text">{project.name}</div>
            <div className="mt-1 text-xs text-muted">{project.id}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
