"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Category, Path } from "@/lib/types";

export default function EditorLayout({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [paths, setPaths] = useState<Path[]>([]);

  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [categoryError, setCategoryError] = useState<string | null>(null);

  const [newPathName, setNewPathName] = useState("");
  const [newPathDescription, setNewPathDescription] = useState("");
  const [editingPath, setEditingPath] = useState<Path | null>(null);
  const [editPathName, setEditPathName] = useState("");
  const [editPathDescription, setEditPathDescription] = useState("");
  const [pathError, setPathError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/editor/categories").then((r) => {
        if (!r.ok) throw new Error(`Server error ${r.status}`);
        return r.json();
      }),
      fetch("/api/editor/paths").then((r) => {
        if (!r.ok) throw new Error(`Server error ${r.status}`);
        return r.json();
      }),
    ])
      .then(([categoriesData, pathsData]) => {
        if (Array.isArray(categoriesData)) setCategories(categoriesData);
        if (Array.isArray(pathsData)) setPaths(pathsData);
      })
      .catch(() => {});
  }, []);

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

  function openPathEdit(path: Path) {
    setEditingPath(path);
    setEditPathName(path.name);
    setEditPathDescription(path.description || "");
    window.dispatchEvent(new CustomEvent("edit-path", { detail: { pathId: path.id } }));
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      <aside className="hidden w-64 shrink-0 overflow-y-auto border-r border-zinc-200/80 bg-zinc-50/50 lg:block dark:border-zinc-800/80 dark:bg-zinc-950/50">
        <nav className="sticky top-14 space-y-6 p-4">
          {/* Navigation */}
          <div>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Editor
            </h2>
            <ul className="space-y-1">
              <li>
                <Link
                  href="/editor"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-scratch-blue dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-scratch-blue"
                >
                  Projects
                </Link>
              </li>
              <li>
                <Link
                  href="/editor/new"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-scratch-blue dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-scratch-blue"
                >
                  + New Project
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Categories ({categories.length})
            </h2>
            {categoryError && (
              <div className="mb-2 rounded border border-red-200 bg-red-50 px-2 py-1 text-[11px] text-red-600 dark:border-red-800 dark:bg-red-950/20 dark:text-red-400">
                {categoryError}
              </div>
            )}
            <form onSubmit={handleAddCategory} className="mb-2 flex gap-1">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="New category..."
                className="min-w-0 flex-1 rounded border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-900 placeholder-zinc-400 focus:border-scratch-blue focus:outline-none focus:ring-1 focus:ring-scratch-blue dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
              <button
                type="submit"
                className="shrink-0 rounded bg-scratch-blue px-2 py-1 text-xs font-medium text-white hover:bg-scratch-purple"
              >
                Add
              </button>
            </form>
            <ul className="max-h-48 space-y-0.5 overflow-y-auto">
              {categories.map((cat) => (
                <li
                  key={cat.id}
                  className="group flex items-center gap-1 rounded px-2 py-1 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
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
                        className="min-w-0 flex-1 rounded border border-zinc-300 bg-white px-1.5 py-0.5 text-xs text-zinc-900 focus:border-scratch-blue focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                      />
                      <button
                        type="button"
                        onClick={() => handleUpdateCategory(cat.id)}
                        className="shrink-0 text-[10px] font-medium text-scratch-blue hover:text-scratch-purple"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCategory(null);
                          setEditCategoryName("");
                        }}
                        className="shrink-0 text-[10px] text-zinc-400 hover:text-zinc-600"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="min-w-0 flex-1 truncate text-zinc-700 dark:text-zinc-300">
                        {cat.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCategory(cat);
                          setEditCategoryName(cat.name);
                        }}
                        className="shrink-0 rounded px-1 text-[10px] text-zinc-400 hover:text-scratch-blue opacity-0 group-hover:opacity-100"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                        className="shrink-0 rounded px-1 text-[10px] text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100"
                      >
                        Del
                      </button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Paths */}
          <div>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Paths ({paths.length})
            </h2>
            {pathError && (
              <div className="mb-2 rounded border border-red-200 bg-red-50 px-2 py-1 text-[11px] text-red-600 dark:border-red-800 dark:bg-red-950/20 dark:text-red-400">
                {pathError}
              </div>
            )}
            <form onSubmit={handleAddPath} className="mb-2 space-y-1">
              <div className="flex gap-1">
                <input
                  type="text"
                  value={newPathName}
                  onChange={(e) => setNewPathName(e.target.value)}
                  placeholder="New path..."
                  className="min-w-0 flex-1 rounded border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-900 placeholder-zinc-400 focus:border-scratch-blue focus:outline-none focus:ring-1 focus:ring-scratch-blue dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                />
                <button
                  type="submit"
                  className="shrink-0 rounded bg-scratch-blue px-2 py-1 text-xs font-medium text-white hover:bg-scratch-purple"
                >
                  Add
                </button>
              </div>
              <input
                type="text"
                value={newPathDescription}
                onChange={(e) => setNewPathDescription(e.target.value)}
                placeholder="Description (optional)..."
                className="w-full rounded border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-900 placeholder-zinc-400 focus:border-scratch-blue focus:outline-none focus:ring-1 focus:ring-scratch-blue dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </form>
            <ul className="max-h-48 space-y-0.5 overflow-y-auto">
              {paths.map((path) => (
                <li
                  key={path.id}
                  className="group flex items-center gap-1 rounded px-2 py-1 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
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
                        className="min-w-0 flex-1 rounded border border-zinc-300 bg-white px-1.5 py-0.5 text-xs text-zinc-900 focus:border-scratch-blue focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                      />
                      <button
                        type="button"
                        onClick={() => handleUpdatePath(path.id)}
                        className="shrink-0 text-[10px] font-medium text-scratch-blue hover:text-scratch-purple"
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
                        className="shrink-0 text-[10px] text-zinc-400 hover:text-zinc-600"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="min-w-0 flex-1 truncate text-zinc-700 dark:text-zinc-300">
                        {path.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => openPathEdit(path)}
                        className="shrink-0 rounded px-1 text-[10px] text-zinc-400 hover:text-scratch-blue opacity-0 group-hover:opacity-100"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePath(path.id, path.name)}
                        className="shrink-0 rounded px-1 text-[10px] text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100"
                      >
                        Del
                      </button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </aside>
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
