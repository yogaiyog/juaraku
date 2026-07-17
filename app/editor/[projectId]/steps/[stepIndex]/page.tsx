"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import TipTapEditor from "@/app/_components/tiptap/TipTapEditor";

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
  const [dirty, setDirty] = useState(false);

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

  async function handleSave() {
    setError(null);
    setSaving(true);

    const res = await fetch(
      `/api/editor/projects/${projectId}/steps/${stepNum}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      },
    );

    if (res.ok) {
      setSuccess(true);
      setDirty(false);
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
      <div className="mb-4 flex items-center justify-between">
        <div>
          <Link
            href={`/editor/${projectId}`}
            className="mb-1 inline-block text-xs text-scratch-blue hover:text-scratch-purple"
          >
            &larr; Back to Project
          </Link>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Edit Step {stepNum}
            {dirty && <span className="ml-2 text-xs text-amber-500">(unsaved)</span>}
          </h1>
        </div>
        <div className="flex items-center gap-2">
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

      <TipTapEditor
        content={content}
        onChange={(val) => {
          setContent(val);
          setDirty(true);
        }}
      />

      <div className="mt-4 flex items-center gap-3">
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
