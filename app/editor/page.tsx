"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Project } from "@/lib/types";

export default function EditorDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/editor/projects")
      .then((r) => {
        if (!r.ok) throw new Error(`Server error ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setProjects(data);
        } else if (data.error) {
          setError(data.error);
        }
      })
      .catch((err) => setError(err.message || "Failed to load projects"))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(projectId: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;

    const res = await fetch(`/api/editor/projects/${projectId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setProjects((p) => p.filter((pr) => pr.id !== projectId));
    } else {
      alert("Failed to delete project");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-zinc-500">Loading projects...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Editor Dashboard
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Manage your Scratch coding projects
          </p>
        </div>
        <Link
          href="/editor/new"
          className="rounded-lg bg-scratch-blue px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-scratch-purple"
        >
          + New Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
          <p className="text-zinc-500">No projects yet.</p>
          <Link
            href="/editor/new"
            className="mt-2 inline-block text-sm font-medium text-scratch-blue hover:text-scratch-purple"
          >
            Create your first project
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-200/80 dark:border-zinc-800/80">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200/80 bg-zinc-50/50 dark:border-zinc-800/80 dark:bg-zinc-950/50">
                <th className="px-4 py-3 font-semibold text-zinc-600 dark:text-zinc-400">
                  Project
                </th>
                <th className="px-4 py-3 font-semibold text-zinc-600 dark:text-zinc-400">
                  Steps
                </th>
                <th className="px-4 py-3 font-semibold text-zinc-600 dark:text-zinc-400">
                  ID
                </th>
                <th className="px-4 py-3 text-right font-semibold text-zinc-600 dark:text-zinc-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {projects.map((project) => (
                <tr
                  key={project.id}
                  className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                >
                  <td className="px-4 py-3">
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      {project.meta.title}
                    </span>
                    {project.meta.description && (
                      <p className="mt-0.5 truncate text-xs text-zinc-400 max-w-xs">
                        {project.meta.description.slice(0, 80)}
                        {(project.meta.description.length ?? 0) > 80 ? "..." : ""}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {project.stepCount}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-400">
                    {project.id}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/editor/${project.id}`}
                        className="rounded-md px-3 py-1.5 text-xs font-medium text-scratch-blue transition-colors hover:bg-scratch-blue/10"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/${project.id}`}
                        className="rounded-md px-3 py-1.5 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        target="_blank"
                      >
                        View
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(project.id, project.meta.title)}
                        className="rounded-md px-3 py-1.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
