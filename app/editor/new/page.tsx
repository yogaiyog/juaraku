"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewProjectPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    projectId: "",
    title: "",
    description: "",
    hero_image: "images/banner.png",
    listed: true,
    copyedit: false,
    last_tested: new Date().toISOString().slice(0, 10),
    stepTitles: [""],
  });

  function updateField(field: string, value: string | boolean | string[]) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function updateStepTitle(index: number, value: string) {
    const titles = [...form.stepTitles];
    titles[index] = value;
    setForm((f) => ({ ...f, stepTitles: titles }));
  }

  function addStep() {
    setForm((f) => ({ ...f, stepTitles: [...f.stepTitles, ""] }));
  }

  function removeStep(index: number) {
    if (form.stepTitles.length <= 1) return;
    setForm((f) => ({
      ...f,
      stepTitles: f.stepTitles.filter((_, i) => i !== index),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const validSteps = form.stepTitles.filter((t) => t.trim() !== "");
    if (validSteps.length === 0) {
      setError("At least one step with a title is required");
      return;
    }

    setSaving(true);

    const res = await fetch("/api/editor/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: form.projectId,
        meta: {
          title: form.title,
          description: form.description,
          hero_image: form.hero_image,
          listed: form.listed,
          copyedit: form.copyedit,
          last_tested: form.last_tested,
          steps: validSteps.map((t) => ({ title: t })),
        },
      }),
    });

    if (res.ok) {
      router.push("/editor");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Failed to create project");
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        Create New Project
      </h1>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-950/20 dark:text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-zinc-200/80 p-6 dark:border-zinc-800/80">
          <h2 className="mb-4 text-sm font-semibold text-zinc-600 dark:text-zinc-400">
            Project Info
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Project ID (slug) *
              </label>
              <input
                type="text"
                value={form.projectId}
                onChange={(e) => updateField("projectId", e.target.value)}
                placeholder="my-project"
                required
                pattern="[a-z0-9-]+"
                className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-scratch-blue focus:outline-none focus:ring-1 focus:ring-scratch-blue dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Title *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder="My Project"
                required
                className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-scratch-blue focus:outline-none focus:ring-1 focus:ring-scratch-blue dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                rows={3}
                className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-scratch-blue focus:outline-none focus:ring-1 focus:ring-scratch-blue dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Hero Image
              </label>
              <input
                type="text"
                value={form.hero_image}
                onChange={(e) => updateField("hero_image", e.target.value)}
                className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-scratch-blue focus:outline-none focus:ring-1 focus:ring-scratch-blue dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Last Tested
              </label>
              <input
                type="date"
                value={form.last_tested}
                onChange={(e) => updateField("last_tested", e.target.value)}
                className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-scratch-blue focus:outline-none focus:ring-1 focus:ring-scratch-blue dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                <input
                  type="checkbox"
                  checked={form.listed}
                  onChange={(e) => updateField("listed", e.target.checked)}
                  className="rounded border-zinc-300 text-scratch-blue focus:ring-scratch-blue"
                />
                Listed
              </label>
              <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                <input
                  type="checkbox"
                  checked={form.copyedit}
                  onChange={(e) => updateField("copyedit", e.target.checked)}
                  className="rounded border-zinc-300 text-scratch-blue focus:ring-scratch-blue"
                />
                Copyedit
              </label>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200/80 p-6 dark:border-zinc-800/80">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
              Steps
            </h2>
            <button
              type="button"
              onClick={addStep}
              className="text-xs font-medium text-scratch-blue hover:text-scratch-purple"
            >
              + Add Step
            </button>
          </div>
          <div className="space-y-3">
            {form.stepTitles.map((title, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="mt-2 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-scratch-blue text-[10px] font-bold text-white">
                  {i + 1}
                </span>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => updateStepTitle(i, e.target.value)}
                  placeholder={`Step ${i + 1} title`}
                  className="block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-scratch-blue focus:outline-none focus:ring-1 focus:ring-scratch-blue dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                />
                {form.stepTitles.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeStep(i)}
                    className="mt-2 shrink-0 text-xs text-red-500 hover:text-red-600"
                  >
                    &times;
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-scratch-blue px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-scratch-purple disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create Project"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg px-6 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
