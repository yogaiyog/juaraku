"use client";

import { useEffect, useState, useRef, use, useCallback } from "react";
import Link from "next/link";
import EditorPreview from "@/app/_components/EditorPreview";

type PreviewSegment =
  | { type: "markdown"; html: string }
  | { type: "task"; html: string }
  | { type: "no-print"; html: string }
  | { type: "print-only"; html: string }
  | { type: "blocks3"; code: string }
  | { type: "collapse"; title: string; html: string }
  | { type: "save" };

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
  const [segments, setSegments] = useState<PreviewSegment[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

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

  const fetchPreview = useCallback(
    async (md: string) => {
      if (!md.trim()) {
        setSegments([]);
        return;
      }

      // Cancel previous in-flight request
      if (abortRef.current) {
        abortRef.current.abort();
      }
      const controller = new AbortController();
      abortRef.current = controller;

      setPreviewLoading(true);
      try {
        const res = await fetch("/api/editor/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ markdown: md, projectId }),
          signal: controller.signal,
        });
        const data = await res.json();
        setSegments(data.segments || []);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setSegments([]);
      } finally {
        setPreviewLoading(false);
      }
    },
    [projectId]
  );

  // Live preview with debounce
  useEffect(() => {
    if (!showPreview) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchPreview(content);
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [content, showPreview, fetchPreview]);

  function togglePreview() {
    const next = !showPreview;
    setShowPreview(next);
    if (next) {
      fetchPreview(content);
    }
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

  // Ctrl+S / Cmd+S keyboard shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, projectId, stepNum]);

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
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
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
                ? "bg-scratch-blue text-white"
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
            {success ? "✓ Saved!" : saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-950/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Editor + Preview */}
      <div
        className={`grid gap-4 ${
          showPreview ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
        }`}
      >
        {/* Textarea */}
        <div className="flex flex-col">
          <label className="mb-2 block text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Markdown Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={35}
            className="block w-full flex-1 resize-y rounded-lg border border-zinc-300 bg-white px-4 py-3 font-mono text-sm text-zinc-900 leading-relaxed focus:border-scratch-blue focus:outline-none focus:ring-1 focus:ring-scratch-blue dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            placeholder="Write your step content in markdown..."
            spellCheck={false}
          />
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="flex flex-col">
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Preview
              {previewLoading && (
                <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-zinc-300 border-t-scratch-blue" />
              )}
            </label>
            <div className="flex-1 overflow-y-auto rounded-lg border border-zinc-200/80 bg-white p-6 dark:border-zinc-800/80 dark:bg-zinc-950"
              style={{ maxHeight: "calc(35 * 1.625rem + 1.5rem)" }}
            >
              <EditorPreview segments={segments} projectId={projectId} />
            </div>
          </div>
        )}
      </div>

      {/* Step Navigation */}
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
