"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import ImageBrowser from "@/app/_components/ImageBrowser";
import type { ProjectMeta, StepEntry } from "@/lib/types";

export default function EditProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [imageBrowserOpen, setImageBrowserOpen] = useState(false);

  const [meta, setMeta] = useState<ProjectMeta | null>(null);

  useEffect(() => {
    fetch(`/api/editor/projects/${projectId}/meta`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((data) => setMeta(data))
      .catch(() => setError("Project not found"))
      .finally(() => setLoading(false));
  }, [projectId]);

  function updateField(field: keyof ProjectMeta, value: unknown) {
    setMeta((m) => (m ? { ...m, [field]: value } : m));
    setSuccess(false);
  }

  function updateStepField(index: number, field: keyof StepEntry, value: unknown) {
    setMeta((m) => {
      if (!m) return m;
      const steps = [...m.steps];
      steps[index] = { ...steps[index], [field]: value };
      return { ...m, steps };
    });
    setSuccess(false);
  }

  function addStep() {
    setMeta((m) => {
      if (!m) return m;
      return { ...m, steps: [...m.steps, { title: "" }] };
    });
    setSuccess(false);
  }

  function removeStep(index: number) {
    setMeta((m) => {
      if (!m) return m;
      if (m.steps.length <= 1) return m;
      return { ...m, steps: m.steps.filter((_, i) => i !== index) };
    });
    setSuccess(false);
  }

  async function handleSave() {
    if (!meta) return;
    setError(null);
    setSaving(true);

    const validSteps = meta.steps.filter((s) => s.title.trim() !== "");
    const updatedMeta = { ...meta, steps: validSteps };

    const res = await fetch(`/api/editor/projects/${projectId}/meta`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedMeta),
    });

    if (res.ok) {
      setMeta(updatedMeta);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      const data = await res.json();
      setError(data.error || "Failed to save");
    }

    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-zinc-500">Loading...</p>
      </div>
    );
  }

  if (error && !meta) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-red-500">{error}</p>
        <Link
          href="/editor"
          className="mt-4 text-sm font-medium text-scratch-blue hover:text-scratch-purple"
        >
          &larr; Back to Editor
        </Link>
      </div>
    );
  }

  if (!meta) return null;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link
            href="/editor"
            className="mb-2 inline-block text-xs text-scratch-blue hover:text-scratch-purple"
          >
            &larr; Back to Projects
          </Link>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Edit: {meta.title}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            ID: <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs dark:bg-zinc-800">{projectId}</code>
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-scratch-blue px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-scratch-purple disabled:opacity-50"
        >
          {success ? "Saved!" : saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-950/20 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="space-y-8">
        <section className="rounded-xl border border-zinc-200/80 p-6 dark:border-zinc-800/80">
          <h2 className="mb-4 text-sm font-semibold text-zinc-600 dark:text-zinc-400">
            Metadata
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Title
              </label>
              <input
                type="text"
                value={meta.title}
                onChange={(e) => updateField("title", e.target.value)}
                className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-scratch-blue focus:outline-none focus:ring-1 focus:ring-scratch-blue dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
            <div className="sm:col-span-2 rounded-xl border border-zinc-200 bg-zinc-50/50 p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div>
                  <label className="block text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <span>🖼️</span>
                    <span>Gambar Card Proyek & Banner Utama (Hero Image)</span>
                  </label>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Gambar ini adalah thumbnail utama yang tampil di <strong>kartu proyek halaman depan (<code>/</code>)</strong> dan <strong>banner atas modul proyek (<code>/[project]</code>)</strong>.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setImageBrowserOpen(true)}
                  className="flex items-center gap-1.5 rounded-lg bg-scratch-blue px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-blue-600 transition-colors cursor-pointer"
                >
                  <span>🖼️</span>
                  <span>Pilih dari Asset / Upload Baru</span>
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-start gap-4">
                {/* Hero / Card Thumbnail Live Preview */}
                <div className="relative aspect-video w-52 shrink-0 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 flex items-center justify-center shadow-xs">
                  {meta.hero_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`/api/assets/${projectId}/${meta.hero_image}`}
                      alt={meta.title}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' fill='none'%3E%3Crect width='100' height='100' fill='%23e4e4e7'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23a1a1aa' font-size='12'%3ENo Image%3C/text%3E%3C/svg%3E";
                      }}
                    />
                  ) : (
                    <span className="text-xs text-zinc-400">Belum ada gambar</span>
                  )}
                  <span className="absolute bottom-1.5 left-1.5 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-semibold text-white">
                    Preview Card
                  </span>
                </div>

                <div className="flex-1 w-full">
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Path Berkas Gambar:
                  </label>
                  <input
                    type="text"
                    value={meta.hero_image}
                    onChange={(e) => updateField("hero_image", e.target.value)}
                    placeholder="images/banner.png"
                    className="block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-mono text-zinc-900 focus:border-scratch-blue focus:outline-none focus:ring-1 focus:ring-scratch-blue dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  />
                  <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                    <span>💡 Tips: Klik tombol <strong>Pilih dari Asset / Upload Baru</strong> di atas untuk memilih gambar dari galeri proyek atau mengunggah foto baru dari komputer.</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Description
              </label>
              <textarea
                value={meta.description}
                onChange={(e) => updateField("description", e.target.value)}
                rows={3}
                className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-scratch-blue focus:outline-none focus:ring-1 focus:ring-scratch-blue dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Last Tested
              </label>
              <input
                type="date"
                value={meta.last_tested}
                onChange={(e) => updateField("last_tested", e.target.value)}
                className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-scratch-blue focus:outline-none focus:ring-1 focus:ring-scratch-blue dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
            <div className="flex items-end gap-6">
              <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                <input
                  type="checkbox"
                  checked={meta.listed}
                  onChange={(e) => updateField("listed", e.target.checked)}
                  className="rounded border-zinc-300 text-scratch-blue focus:ring-scratch-blue"
                />
                Listed
              </label>
              <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                <input
                  type="checkbox"
                  checked={meta.copyedit}
                  onChange={(e) => updateField("copyedit", e.target.checked)}
                  className="rounded border-zinc-300 text-scratch-blue focus:ring-scratch-blue"
                />
                Copyedit
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                PDF
              </label>
              <input
                type="text"
                value={meta.pdf ?? ""}
                onChange={(e) =>
                  updateField("pdf", e.target.value || undefined)
                }
                placeholder="resources/project.pdf"
                className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-scratch-blue focus:outline-none focus:ring-1 focus:ring-scratch-blue dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Meta Title
              </label>
              <input
                type="text"
                value={meta.meta_title ?? ""}
                onChange={(e) =>
                  updateField("meta_title", e.target.value || undefined)
                }
                className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-scratch-blue focus:outline-none focus:ring-1 focus:ring-scratch-blue dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Meta Description
              </label>
              <textarea
                value={meta.meta_description ?? ""}
                onChange={(e) =>
                  updateField("meta_description", e.target.value || undefined)
                }
                rows={2}
                className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-scratch-blue focus:outline-none focus:ring-1 focus:ring-scratch-blue dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-zinc-200/80 p-6 dark:border-zinc-800/80">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
              Steps ({meta.steps.length})
            </h2>
            <button
              type="button"
              onClick={addStep}
              className="text-xs font-medium text-scratch-blue hover:text-scratch-purple"
            >
              + Add Step
            </button>
          </div>
          <div className="space-y-2">
            {meta.steps.map((step, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-lg border border-zinc-100 p-3 dark:border-zinc-800"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-scratch-blue text-[11px] font-bold text-white">
                  {i + 1}
                </span>
                <input
                  type="text"
                  value={step.title}
                  onChange={(e) => updateStepField(i, "title", e.target.value)}
                  className="block w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-900 focus:border-scratch-blue focus:outline-none focus:ring-1 focus:ring-scratch-blue dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                />
                <Link
                  href={`/editor/${projectId}/steps/${i + 1}`}
                  className="shrink-0 rounded-md px-3 py-1.5 text-xs font-medium text-scratch-blue transition-colors hover:bg-scratch-blue/10"
                >
                  Edit Content
                </Link>
                {meta.steps.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeStep(i)}
                    className="shrink-0 rounded-md px-2 py-1 text-xs text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    &times;
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Image Browser Modal for Hero Image */}
      <ImageBrowser
        isOpen={imageBrowserOpen}
        onClose={() => setImageBrowserOpen(false)}
        projectId={projectId}
        onSelectRawPath={(filePath) => {
          updateField("hero_image", filePath);
          setImageBrowserOpen(false);
        }}
        title="Pilih Hero Image Proyek"
        selectButtonText="Gunakan sebagai Hero Image"
      />
    </div>
  );
}
