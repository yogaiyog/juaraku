"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Category, Path, Project } from "@/lib/types";

export default function EditorDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [paths, setPaths] = useState<Path[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);

  const [newPathName, setNewPathName] = useState("");
  const [newPathDescription, setNewPathDescription] = useState("");
  const [editingPath, setEditingPath] = useState<Path | null>(null);
  const [editPathName, setEditPathName] = useState("");
  const [editPathDescription, setEditPathDescription] = useState("");
  const [pathError, setPathError] = useState<string | null>(null);
  const [pathsExpanded, setPathsExpanded] = useState(false);

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

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    setCategoryError(null);

    const name = newCategoryName.trim();
    if (!name) return;

    const res = await fetch("/api/editor/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    if (res.ok) {
      const cat = await res.json();
      setCategories((prev) => [...prev, cat].sort((a, b) => a.name.localeCompare(b.name)));
      setNewCategoryName("");
    } else {
      const data = await res.json();
      setCategoryError(data.error || "Failed to add category");
    }
  }

  async function handleUpdateCategory(categoryId: string) {
    setCategoryError(null);

    const name = editCategoryName.trim();
    if (!name) return;

    const res = await fetch(`/api/editor/categories/${categoryId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    if (res.ok) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setCategories((prev) =>
        prev
          .map((c) => (c.id === categoryId ? { ...c, name, slug } : c))
          .sort((a, b) => a.name.localeCompare(b.name))
      );
      setEditingCategory(null);
      setEditCategoryName("");
    } else {
      const data = await res.json();
      setCategoryError(data.error || "Failed to update category");
    }
  }

  async function handleDeleteCategory(categoryId: string, name: string) {
    if (!confirm(`Delete category "${name}"? Projects will keep their other categories.`)) return;
    setCategoryError(null);

    const res = await fetch(`/api/editor/categories/${categoryId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setCategories((prev) => prev.filter((c) => c.id !== categoryId));
    } else {
      setCategoryError("Failed to delete category");
    }
  }

  async function handleAddPath(e: React.FormEvent) {
    e.preventDefault();
    setPathError(null);

    const name = newPathName.trim();
    if (!name) return;

    const res = await fetch("/api/editor/paths", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description: newPathDescription.trim() || undefined }),
    });

    if (res.ok) {
      const path = await res.json();
      setPaths((prev) => [...prev, path].sort((a, b) => a.name.localeCompare(b.name)));
      setNewPathName("");
      setNewPathDescription("");
    } else {
      const data = await res.json();
      setPathError(data.error || "Failed to add path");
    }
  }

  async function handleUpdatePath(pathId: string) {
    setPathError(null);

    const name = editPathName.trim();
    if (!name) return;

    const res = await fetch(`/api/editor/paths/${pathId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description: editPathDescription.trim() || undefined }),
    });

    if (res.ok) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setPaths((prev) =>
        prev
          .map((p) => (p.id === pathId ? { ...p, name, slug, description: editPathDescription.trim() || null } : p))
          .sort((a, b) => a.name.localeCompare(b.name))
      );
      setEditingPath(null);
      setEditPathName("");
      setEditPathDescription("");
    } else {
      const data = await res.json();
      setPathError(data.error || "Failed to update path");
    }
  }

  async function handleDeletePath(pathId: string, name: string) {
    if (!confirm(`Delete path "${name}"? Projects will keep their other paths.`)) return;
    setPathError(null);

    const res = await fetch(`/api/editor/paths/${pathId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setPaths((prev) => prev.filter((p) => p.id !== pathId));
    } else {
      setPathError("Failed to delete path");
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

      {/* Categories Section */}
      <section className="mb-8 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80">
        <button
          type="button"
          onClick={() => setCategoriesExpanded(!categoriesExpanded)}
          className="flex w-full items-center justify-between px-5 py-4 text-left"
        >
          <div>
            <h2 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
              Categories ({categories.length})
            </h2>
            <p className="mt-0.5 text-xs text-zinc-400">
              Manage project categories
            </p>
          </div>
          <span className="text-zinc-400">
            {categoriesExpanded ? "\u25B2" : "\u25BC"}
          </span>
        </button>

        {categoriesExpanded && (
          <div className="border-t border-zinc-200/80 px-5 py-4 dark:border-zinc-800/80">
            {categoryError && (
              <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-600 dark:border-red-800 dark:bg-red-950/20 dark:text-red-400">
                {categoryError}
              </div>
            )}

            <form onSubmit={handleAddCategory} className="mb-4 flex gap-2">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="New category name..."
                className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-scratch-blue focus:outline-none focus:ring-1 focus:ring-scratch-blue dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
              <button
                type="submit"
                className="rounded-lg bg-scratch-blue px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-scratch-purple"
              >
                Add
              </button>
            </form>

            {categories.length === 0 ? (
              <p className="text-xs text-zinc-400">No categories yet.</p>
            ) : (
              <ul className="space-y-1">
                {categories.map((cat) => (
                  <li
                    key={cat.id}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                  >
                    {editingCategory?.id === cat.id ? (
                      <>
                        <input
                          type="text"
                          value={editCategoryName}
                          onChange={(e) => setEditCategoryName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleUpdateCategory(cat.id);
                            if (e.key === "Escape") {
                              setEditingCategory(null);
                              setEditCategoryName("");
                            }
                          }}
                          autoFocus
                          className="flex-1 rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-900 focus:border-scratch-blue focus:outline-none focus:ring-1 focus:ring-scratch-blue dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                        />
                        <button
                          type="button"
                          onClick={() => handleUpdateCategory(cat.id)}
                          className="text-xs font-medium text-scratch-blue hover:text-scratch-purple"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCategory(null);
                            setEditCategoryName("");
                          }}
                          className="text-xs text-zinc-400 hover:text-zinc-600"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 text-sm text-zinc-700 dark:text-zinc-300">
                          {cat.name}
                        </span>
                        <span className="text-xs text-zinc-400">/{cat.slug}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCategory(cat);
                            setEditCategoryName(cat.name);
                          }}
                          className="rounded px-2 py-1 text-xs text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-scratch-blue dark:hover:bg-zinc-800"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(cat.id, cat.name)}
                          className="rounded px-2 py-1 text-xs text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>

      {/* Paths Section */}
      <section className="mb-8 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80">
        <button
          type="button"
          onClick={() => setPathsExpanded(!pathsExpanded)}
          className="flex w-full items-center justify-between px-5 py-4 text-left"
        >
          <div>
            <h2 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
              Paths ({paths.length})
            </h2>
            <p className="mt-0.5 text-xs text-zinc-400">
              Manage learning paths
            </p>
          </div>
          <span className="text-zinc-400">
            {pathsExpanded ? "\u25B2" : "\u25BC"}
          </span>
        </button>

        {pathsExpanded && (
          <div className="border-t border-zinc-200/80 px-5 py-4 dark:border-zinc-800/80">
            {pathError && (
              <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-600 dark:border-red-800 dark:bg-red-950/20 dark:text-red-400">
                {pathError}
              </div>
            )}

            <form onSubmit={handleAddPath} className="mb-4 flex gap-2">
              <input
                type="text"
                value={newPathName}
                onChange={(e) => setNewPathName(e.target.value)}
                placeholder="New path name..."
                className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-scratch-blue focus:outline-none focus:ring-1 focus:ring-scratch-blue dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
              <input
                type="text"
                value={newPathDescription}
                onChange={(e) => setNewPathDescription(e.target.value)}
                placeholder="Description (optional)..."
                className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-scratch-blue focus:outline-none focus:ring-1 focus:ring-scratch-blue dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
              <button
                type="submit"
                className="rounded-lg bg-scratch-blue px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-scratch-purple"
              >
                Add
              </button>
            </form>

            {paths.length === 0 ? (
              <p className="text-xs text-zinc-400">No paths yet.</p>
            ) : (
              <ul className="space-y-1">
                {paths.map((path) => (
                  <li
                    key={path.id}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                  >
                    {editingPath?.id === path.id ? (
                      <>
                        <input
                          type="text"
                          value={editPathName}
                          onChange={(e) => setEditPathName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleUpdatePath(path.id);
                            if (e.key === "Escape") {
                              setEditingPath(null);
                              setEditPathName("");
                              setEditPathDescription("");
                            }
                          }}
                          autoFocus
                          className="flex-1 rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-900 focus:border-scratch-blue focus:outline-none focus:ring-1 focus:ring-scratch-blue dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                        />
                        <input
                          type="text"
                          value={editPathDescription}
                          onChange={(e) => setEditPathDescription(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleUpdatePath(path.id);
                            if (e.key === "Escape") {
                              setEditingPath(null);
                              setEditPathName("");
                              setEditPathDescription("");
                            }
                          }}
                          placeholder="Description..."
                          className="flex-1 rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-900 placeholder-zinc-400 focus:border-scratch-blue focus:outline-none focus:ring-1 focus:ring-scratch-blue dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                        />
                        <button
                          type="button"
                          onClick={() => handleUpdatePath(path.id)}
                          className="text-xs font-medium text-scratch-blue hover:text-scratch-purple"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingPath(null);
                            setEditPathName("");
                            setEditPathDescription("");
                          }}
                          className="text-xs text-zinc-400 hover:text-zinc-600"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="flex-1">
                          <span className="text-sm text-zinc-700 dark:text-zinc-300">
                            {path.name}
                          </span>
                          <span className="ml-2 text-xs text-zinc-400">/{path.slug}</span>
                          {path.description && (
                            <p className="mt-0.5 text-xs text-zinc-400">{path.description}</p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingPath(path);
                            setEditPathName(path.name);
                            setEditPathDescription(path.description || "");
                          }}
                          className="rounded px-2 py-1 text-xs text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-scratch-blue dark:hover:bg-zinc-800"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePath(path.id, path.name)}
                          className="rounded px-2 py-1 text-xs text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>

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
                  allPaths={paths}
                  onDelete={handleDelete}
                  onCategoriesChange={(updated) =>
                    setProjects((prev) =>
                      prev.map((p) => (p.id === updated.id ? updated : p))
                    )
                  }
                  onPathsChange={(updated) =>
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
    </div>
  );
}

function ProjectRow({
  project,
  allCategories,
  allPaths,
  onDelete,
  onCategoriesChange,
  onPathsChange,
}: {
  project: Project;
  allCategories: Category[];
  allPaths: Path[];
  onDelete: (id: string, title: string) => void;
  onCategoriesChange: (project: Project) => void;
  onPathsChange: (project: Project) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>(
    project.categories.map((c) => c.id)
  );
  const [saving, setSaving] = useState(false);

  const [editingPaths, setEditingPaths] = useState(false);
  const [selectedPathIds, setSelectedPathIds] = useState<string[]>(
    project.paths.map((p) => p.id)
  );
  const [savingPaths, setSavingPaths] = useState(false);

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

  async function savePaths() {
    setSavingPaths(true);
    const res = await fetch(
      `/api/editor/projects/${project.id}/paths`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pathIds: selectedPathIds }),
      }
    );

    if (res.ok) {
      const updatedPaths = allPaths.filter((p) =>
        selectedPathIds.includes(p.id)
      );
      onPathsChange({ ...project, paths: updatedPaths });
      setEditingPaths(false);
    }
    setSavingPaths(false);
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
        {editingPaths ? (
          <div className="flex flex-wrap items-center gap-1">
            {allPaths.map((path) => (
              <label
                key={path.id}
                className="flex items-center gap-1 rounded bg-zinc-100 px-2 py-0.5 text-xs dark:bg-zinc-800"
              >
                <input
                  type="checkbox"
                  checked={selectedPathIds.includes(path.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedPathIds((prev) => [...prev, path.id]);
                    } else {
                      setSelectedPathIds((prev) =>
                        prev.filter((id) => id !== path.id)
                      );
                    }
                  }}
                  className="rounded border-zinc-300 text-scratch-blue focus:ring-scratch-blue"
                />
                {path.name}
              </label>
            ))}
            <div className="ml-1 flex gap-1">
              <button
                type="button"
                onClick={savePaths}
                disabled={savingPaths}
                className="rounded px-2 py-0.5 text-xs font-medium text-scratch-blue hover:text-scratch-purple disabled:opacity-50"
              >
                {savingPaths ? "..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingPaths(false);
                  setSelectedPathIds(project.paths.map((p) => p.id));
                }}
                className="rounded px-2 py-0.5 text-xs text-zinc-400 hover:text-zinc-600"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
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
            <button
              type="button"
              onClick={() => setEditingPaths(true)}
              className="ml-1 rounded px-1.5 py-0.5 text-[11px] text-zinc-400 hover:bg-zinc-100 hover:text-scratch-blue dark:hover:bg-zinc-800"
            >
              Edit
            </button>
          </div>
        )}
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
