"use client";

import { useEffect, useState, use, useCallback } from "react";
import Link from "next/link";

export default function EditStepPage({
  params,
}: {
  params: Promise<{ projectId: string; stepIndex: string }>;
}) {
  const { projectId, stepIndex } = use(params);
  const stepNum = Number.parseInt(stepIndex, 10);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [content, setContent] = useState("");
  const [preview, setPreview] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetch(`/api/editor/projects/${projectId}/steps/${stepNum}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((data) => setContent(data.content))
      .catch(() => setError("Step not found"))
      .finally(() => setLoading(false));
  }, [projectId, stepNum]);

  const updatePreview = useCallback(async (md: string) => {
    if (!md.trim()) {
      setPreview("<p class='text-zinc-400 italic'>Empty content</p>");
      return;
    }
    try {
      const res = await fetch("/api/editor/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markdown: md }),
      });
      const data = await res.json();
      setPreview(data.html || "<p class='text-red-400'>Preview error</p>");
    } catch {
      setPreview("<p class='text-red-400'>Preview failed</p>");
    }
  }, []);

  function togglePreview() {
    if (!showPreview) {
      updatePreview(content);
    }
    setShowPreview((p) => !p);
  }

  async function handleSave() {
    setError(null);
    setSaving(true);

    const res = await fetch(
      `/api/editor/projects/${projectId}/steps/${stepNum}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      }
    );

    if (res.ok) {
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

  if (error && !content) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-red-500">{error}</p>
        <Link
          href={`/editor/${projectId}`}
          className="mt-4 text-sm font-medium text-scratch-blue hover:text-scratch-purple"
        >
          &larr; Back to Project
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link
            href={`/editor/${projectId}`}
            className="mb-2 inline-block text-xs text-scratch-blue hover:text-scratch-purple"
          >
            &larr; Back to Project
          </Link>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Edit Step {stepNum}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={togglePreview}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              showPreview
                ? "bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
            }`}
          >
            {showPreview ? "Hide Preview" : "Show Preview"}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-scratch-blue px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-scratch-purple disabled:opacity-50"
          >
            {success ? "Saved!" : saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-950/20 dark:text-red-400">
          {error}
        </div>
      )}

      <div
        className={`grid gap-4 ${
          showPreview ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
        }`}
      >
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Markdown Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={30}
            className="block w-full resize-y rounded-lg border border-zinc-300 bg-white px-4 py-3 font-mono text-sm text-zinc-900 leading-relaxed focus:border-scratch-blue focus:outline-none focus:ring-1 focus:ring-scratch-blue dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            placeholder="Write your step content in markdown..."
          />
        </div>

        {showPreview && (
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Preview
            </label>
            <div className="prose prose-sm max-w-none rounded-lg border border-zinc-200/80 bg-white p-6 dark:border-zinc-800/80 dark:bg-zinc-950 dark:prose-invert h-[calc(30*1.625rem+1.5rem)] overflow-y-auto">
              <div dangerouslySetInnerHTML={{ __html: preview }} />
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center gap-3">
        {stepNum > 1 && (
          <Link
            href={`/editor/${projectId}/steps/${stepNum - 1}`}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-900"
          >
            &larr; Previous Step
          </Link>
        )}
        <Link
          href={`/editor/${projectId}/steps/${stepNum + 1}`}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-900"
        >
          Next Step &rarr;
        </Link>
      </div>
    </div>
  );
}
