"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import type { Category, Path, Project } from "@/lib/types";

export default function EditorDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [paths, setPaths] = useState<Path[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingPath, setEditingPath] = useState<Path | null>(null);
  const [editPathName, setEditPathName] = useState("");
  const [editPathDescription, setEditPathDescription] = useState("");
  const [pathProjectIds, setPathProjectIds] = useState<string[]>([]);
  const [savingPath, setSavingPath] = useState(false);

  const handleEditPath = useCallback(
    (e: Event) => {
      const detail = (e as CustomEvent).detail as { pathId: string };
      const path = paths.find((p) => p.id === detail.pathId);
      if (!path) return;
      setEditingPath(path);
      setEditPathName(path.name);
      setEditPathDescription(path.description || "");
      const assigned = projects
        .filter((p) => p.paths.some((pp) => pp.id === path.id))
        .map((p) => p.id);
      setPathProjectIds(assigned);
    },
    [paths, projects]
  );

  useEffect(() => {
    window.addEventListener("edit-path", handleEditPath);
    return () => window.removeEventListener("edit-path", handleEditPath);
  }, [handleEditPath]);

  useEffect(() => {
    Promise.all([
      fetch("/api/editor/projects").then((r) => {
        if (!r.ok) throw new Error(`Server error ${r.status}`);
        return r.json();
      }),
      fetch("/api/editor/categories").then((r) => {
        if (!r.ok) throw new Error(`Server error ${r.status}`);
        return r.json();
      }),
      fetch("/api/editor/paths").then((r) => {
        if (!r.ok) throw new Error(`Server error ${r.status}`);
        return r.json();
      }),
    ])
      .then(([projectsData, categoriesData, pathsData]) => {
        if (Array.isArray(projectsData)) {
          setProjects(projectsData);
        } else if (projectsData.error) {
          setError(projectsData.error);
        }
        if (Array.isArray(categoriesData)) {
          setCategories(categoriesData);
        }
        if (Array.isArray(pathsData)) {
          setPaths(pathsData);
        }
      })
      .catch((err) => setError(err.message || "Failed to load data"))
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

  async function savePathEdit() {
    if (!editingPath) return;
    setSavingPath(true);

    const res = await fetch(`/api/editor/paths/${editingPath.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editPathName.trim(),
        description: editPathDescription.trim() || undefined,
        projectIds: pathProjectIds,
      }),
    });

    if (res.ok) {
      const slug = editPathName
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setPaths((prev) =>
        prev
          .map((p) =>
            p.id === editingPath.id
              ? { ...p, name: editPathName.trim(), slug, description: editPathDescription.trim() || null }
              : p
          )
          .sort((a, b) => a.name.localeCompare(b.name))
      );
      setProjects((prev) =>
        prev.map((p) => {
          const hasPath = pathProjectIds.includes(p.id);
          const currentlyHas = p.paths.some((pp) => pp.id === editingPath.id);
          if (hasPath && !currentlyHas) {
            const updatedPath = paths.find((pp) => pp.id === editingPath.id);
            return { ...p, paths: [...p.paths, updatedPath || { id: editingPath.id, name: editPathName.trim(), slug, description: editPathDescription.trim() || null }] };
          }
          if (!hasPath && currentlyHas) {
            return { ...p, paths: p.paths.filter((pp) => pp.id !== editingPath.id) };
          }
          return p;
        })
      );
      setEditingPath(null);
    } else {
      alert("Failed to update path");
    }
    setSavingPath(false);
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

      {/* Projects Table */}
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
                  Categories
                </th>
                <th className="px-4 py-3 font-semibold text-zinc-600 dark:text-zinc-400">
                  Paths
                </th>
                <th className="px-4 py-3 font-semibold text-zinc-600 dark:text-zinc-400">
                  Steps
                </th>
                <th className="px-4 py-3 text-right font-semibold text-zinc-600 dark:text-zinc-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {projects.map((project) => (
                <ProjectRow
                  key={project.id}
                  project={project}
                  allCategories={categories}
                  onDelete={handleDelete}
                  onCategoriesChange={(updated) =>
                    setProjects((prev) =>
                      prev.map((p) => (p.id === updated.id ? updated : p))
                    )
                  }
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Path Edit Panel */}
      {editingPath && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-lg rounded-xl bg-white shadow-2xl dark:bg-zinc-900">
            <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Edit Path
              </h2>
              <button
                type="button"
                onClick={() => setEditingPath(null)}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto px-6 py-4 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Name
                </label>
                <input
                  type="text"
                  value={editPathName}
                  onChange={(e) => setEditPathName(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-scratch-blue focus:outline-none focus:ring-1 focus:ring-scratch-blue dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Description
                </label>
                <input
                  type="text"
                  value={editPathDescription}
                  onChange={(e) => setEditPathDescription(e.target.value)}
                  placeholder="Optional description..."
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-scratch-blue focus:outline-none focus:ring-1 focus:ring-scratch-blue dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Projects in this path ({pathProjectIds.length})
                </label>
                <div className="max-h-60 space-y-1 overflow-y-auto rounded-lg border border-zinc-200 p-2 dark:border-zinc-700">
                  {projects.length === 0 ? (
                    <p className="text-xs text-zinc-400">No projects available.</p>
                  ) : (
                    projects.map((project) => (
                      <label
                        key={project.id}
                        className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                      >
                        <input
                          type="checkbox"
                          checked={pathProjectIds.includes(project.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setPathProjectIds((prev) => [...prev, project.id]);
                            } else {
                              setPathProjectIds((prev) =>
                                prev.filter((id) => id !== project.id)
                              );
                            }
                          }}
                          className="rounded border-zinc-300 text-scratch-blue focus:ring-scratch-blue"
                        />
                        <span className="flex-1 text-zinc-700 dark:text-zinc-300">
                          {project.meta.title}
                        </span>
                        <span className="text-xs text-zinc-400">
                          {project.stepCount} steps
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-zinc-200 px-6 py-4 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setEditingPath(null)}
                className="rounded-lg px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={savePathEdit}
                disabled={savingPath || !editPathName.trim()}
                className="rounded-lg bg-scratch-blue px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-scratch-purple disabled:opacity-50"
              >
                {savingPath ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProjectRow({
  project,
  allCategories,
  onDelete,
  onCategoriesChange,
}: {
  project: Project;
  allCategories: Category[];
  onDelete: (id: string, title: string) => void;
  onCategoriesChange: (project: Project) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>(
    project.categories.map((c) => c.id)
  );
  const [saving, setSaving] = useState(false);

  async function saveCategories() {
    setSaving(true);
    const res = await fetch(
      `/api/editor/projects/${project.id}/categories`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryIds: selectedIds }),
      }
    );

    if (res.ok) {
      const updatedCategories = allCategories.filter((c) =>
        selectedIds.includes(c.id)
      );
      onCategoriesChange({ ...project, categories: updatedCategories });
      setEditing(false);
    }
    setSaving(false);
  }

  return (
    <tr className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
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
      <td className="px-4 py-3">
        {editing ? (
          <div className="flex flex-wrap items-center gap-1">
            {allCategories.map((cat) => (
              <label
                key={cat.id}
                className="flex items-center gap-1 rounded bg-zinc-100 px-2 py-0.5 text-xs dark:bg-zinc-800"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(cat.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedIds((prev) => [...prev, cat.id]);
                    } else {
                      setSelectedIds((prev) =>
                        prev.filter((id) => id !== cat.id)
                      );
                    }
                  }}
                  className="rounded border-zinc-300 text-scratch-blue focus:ring-scratch-blue"
                />
                {cat.name}
              </label>
            ))}
            <div className="ml-1 flex gap-1">
              <button
                type="button"
                onClick={saveCategories}
                disabled={saving}
                className="rounded px-2 py-0.5 text-xs font-medium text-scratch-blue hover:text-scratch-purple disabled:opacity-50"
              >
                {saving ? "..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setSelectedIds(project.categories.map((c) => c.id));
                }}
                className="rounded px-2 py-0.5 text-xs text-zinc-400 hover:text-zinc-600"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-1">
            {project.categories.length === 0 ? (
              <span className="text-xs text-zinc-400">None</span>
            ) : (
              project.categories.map((cat) => (
                <span
                  key={cat.id}
                  className="rounded-full bg-scratch-blue/10 px-2 py-0.5 text-[11px] font-medium text-scratch-blue"
                >
                  {cat.name}
                </span>
              ))
            )}
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="ml-1 rounded px-1.5 py-0.5 text-[11px] text-zinc-400 hover:bg-zinc-100 hover:text-scratch-blue dark:hover:bg-zinc-800"
            >
              Edit
            </button>
          </div>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap items-center gap-1">
          {project.paths.length === 0 ? (
            <span className="text-xs text-zinc-400">None</span>
          ) : (
            project.paths.map((path) => (
              <span
                key={path.id}
                className="rounded-full bg-green-500/10 px-2 py-0.5 text-[11px] font-medium text-green-600 dark:text-green-400"
              >
                {path.name}
              </span>
            ))
          )}
        </div>
      </td>
      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
        {project.stepCount}
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
            onClick={() => onDelete(project.id, project.meta.title)}
            className="rounded-md px-3 py-1.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}
