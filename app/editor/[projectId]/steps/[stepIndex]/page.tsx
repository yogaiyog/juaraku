"use client";

import { useEffect, useState, useRef, use, useCallback, useMemo, DragEvent } from "react";
import Link from "next/link";
import CodeMirror, { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { EditorView, keymap } from "@codemirror/view";
import EditorPreview from "@/app/_components/EditorPreview";
import EditorToolbar from "@/app/_components/EditorToolbar";
import ImageBrowser from "@/app/_components/ImageBrowser";

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
  const [showPreview, setShowPreview] = useState(true);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Image Browser & Drop states
  const [imageBrowserOpen, setImageBrowserOpen] = useState(false);
  const [dragOverEditor, setDragOverEditor] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const cmRef = useRef<ReactCodeMirrorRef>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Detect dark mode from document or media query
  useEffect(() => {
    const isDark =
      document.documentElement.classList.contains("dark") ||
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDarkMode(isDark);
  }, []);

  useEffect(() => {
    fetch(`/api/editor/projects/${projectId}/steps/${stepNum}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((data) => {
        setContent(data.content || "");
        if (data.content) {
          fetchPreview(data.content);
        }
      })
      .catch(() => setError("Step not found"))
      .finally(() => setLoading(false));
  }, [projectId, stepNum]);

  const fetchPreview = useCallback(
    async (md: string) => {
      if (!md.trim()) {
        setSegments([]);
        return;
      }

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
    }, 400);

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

  // Insertion handlers for CodeMirror
  const handleInsertInline = useCallback(
    (before: string, after: string = "", defaultText: string = "") => {
      const view = cmRef.current?.view;
      if (!view) {
        setContent((prev) => prev + before + defaultText + after);
        return;
      }

      const { from, to } = view.state.selection.main;
      const selectedText = view.state.sliceDoc(from, to) || defaultText;
      const replacement = before + selectedText + after;

      view.dispatch({
        changes: { from, to, insert: replacement },
        selection: {
          anchor: selectedText === defaultText ? from + before.length : from + replacement.length,
          head:
            selectedText === defaultText
              ? from + before.length + selectedText.length
              : from + replacement.length,
        },
      });
      view.focus();
    },
    []
  );

  const handleInsertBlock = useCallback((snippet: string) => {
    const view = cmRef.current?.view;
    if (!view) {
      setContent((prev) => prev + "\n\n" + snippet + "\n\n");
      return;
    }

    const { from, to } = view.state.selection.main;
    const doc = view.state.doc.toString();
    const beforeText = doc.substring(0, from);
    const needLeadingNewline = beforeText.length > 0 && !beforeText.endsWith("\n\n");
    const prefix = needLeadingNewline ? (beforeText.endsWith("\n") ? "\n" : "\n\n") : "";
    const toInsert = prefix + snippet + "\n\n";

    view.dispatch({
      changes: { from, to, insert: toInsert },
      selection: { anchor: from + prefix.length + snippet.length },
    });
    view.focus();
  }, []);

  // Drag and Drop image upload onto CodeMirror editor
  async function handleDrop(e: DragEvent<HTMLDivElement>) {
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith("image/")) return;

    e.preventDefault();
    setDragOverEditor(false);
    setUploadStatus(`Uploading ${file.name} to MinIO...`);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`/api/editor/projects/${projectId}/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Upload failed");

      const cleanName = data.fileName
        .replace(/\.[^/.]+$/, "")
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (c: string) => c.toUpperCase());

      const markdownImage = `![${cleanName}](${data.filePath}){:width="300px"}`;
      handleInsertInline(markdownImage, "", "");
      setUploadStatus(`✓ Image "${data.fileName}" uploaded & inserted!`);
      setTimeout(() => setUploadStatus(null), 3500);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setUploadStatus(`❌ ${msg}`);
      setTimeout(() => setUploadStatus(null), 4000);
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

  // CodeMirror Extensions & Shortcuts
  const editorExtensions = useMemo(() => {
    return [
      markdown(),
      EditorView.lineWrapping,
      keymap.of([
        {
          key: "Mod-s",
          run: () => {
            handleSave();
            return true;
          },
        },
        {
          key: "Mod-b",
          run: () => {
            handleInsertInline("**", "**", "bold text");
            return true;
          },
        },
        {
          key: "Mod-i",
          run: () => {
            handleInsertInline("*", "*", "italic text");
            return true;
          },
        },
      ]),
      EditorView.theme({
        "&": {
          fontSize: "14px",
          height: "auto",
        },
        ".cm-scroller": {
          overflow: "visible",
        },
        ".cm-content": {
          fontFamily:
            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          padding: "16px",
          lineHeight: "1.7",
        },
        ".cm-gutters": {
          backgroundColor: isDarkMode ? "#18181b" : "#f4f4f5",
          color: isDarkMode ? "#71717a" : "#a1a1aa",
          border: "none",
          borderRight: isDarkMode ? "1px solid #27272a" : "1px solid #e4e4e7",
        },
        ".cm-activeLineGutter": {
          backgroundColor: isDarkMode ? "#27272a" : "#e4e4e7",
        },
        ".cm-line": {
          padding: "0 4px",
        },
        "&.cm-focused": {
          outline: "none",
        },
      }),
    ];
  }, [isDarkMode, handleInsertInline]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-zinc-500">Loading step content...</p>
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
    <div className="w-full">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <Link
            href={`/editor/${projectId}`}
            className="mb-2 inline-block text-xs text-scratch-blue hover:text-scratch-purple"
          >
            &larr; Back to Project
          </Link>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span>Edit Step {stepNum}</span>
            <span className="rounded bg-scratch-blue/10 px-2 py-0.5 text-xs font-semibold text-scratch-blue">
              CodeMirror Pro Editor
            </span>
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
            {success ? "✓ Saved!" : saving ? "Saving..." : "Save (⌘+S)"}
          </button>
        </div>
      </div>

      {uploadStatus && (
        <div className="mb-3 rounded-lg border border-scratch-blue/30 bg-scratch-blue/10 px-4 py-2 text-xs font-medium text-scratch-blue transition-all">
          {uploadStatus}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-950/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Editor + Preview layout */}
      <div
        className={`grid gap-4 items-start ${
          showPreview ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
        }`}
      >
        {/* CodeMirror Editor Column */}
        <div className="flex flex-col">
          {/* Toolbar */}
          <EditorToolbar
            onInsertInline={handleInsertInline}
            onInsertBlock={handleInsertBlock}
            onOpenImageBrowser={() => setImageBrowserOpen(true)}
          />

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverEditor(true);
            }}
            onDragLeave={() => setDragOverEditor(false)}
            onDrop={handleDrop}
            className={`relative rounded-xl border bg-white shadow-xs transition-all dark:bg-zinc-900 overflow-hidden ${
              dragOverEditor
                ? "border-2 border-dashed border-scratch-blue ring-4 ring-scratch-blue/20"
                : "border-zinc-300 dark:border-zinc-700"
            }`}
          >
            <CodeMirror
              ref={cmRef}
              value={content}
              height="auto"
              theme={isDarkMode ? "dark" : "light"}
              extensions={editorExtensions}
              onChange={(value) => setContent(value)}
              basicSetup={{
                lineNumbers: true,
                highlightActiveLineGutter: true,
                highlightSpecialChars: true,
                history: true,
                foldGutter: true,
                drawSelection: true,
                dropCursor: true,
                allowMultipleSelections: true,
                indentOnInput: true,
                syntaxHighlighting: true,
                bracketMatching: true,
                closeBrackets: true,
                autocompletion: true,
                rectangularSelection: true,
                crosshairCursor: true,
                highlightActiveLine: true,
                highlightSelectionMatches: true,
                closeBracketsKeymap: true,
                defaultKeymap: true,
                searchKeymap: true,
                historyKeymap: true,
                foldKeymap: true,
                completionKeymap: true,
                lintKeymap: true,
              }}
            />

            {dragOverEditor && (
              <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-scratch-blue/10 backdrop-blur-xs">
                <div className="rounded-xl bg-white px-6 py-4 shadow-xl text-center border border-scratch-blue/40 dark:bg-zinc-800">
                  <span className="text-3xl mb-1 block">🖼️</span>
                  <p className="text-xs font-bold text-scratch-blue">
                    Drop image to upload to MinIO & insert
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Live Preview Column */}
        {showPreview && (
          <div className="flex flex-col">
            <div className="mb-2 flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Live Preview
                {previewLoading && (
                  <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-zinc-300 border-t-scratch-blue" />
                )}
              </label>
              <span className="text-xs text-zinc-400">Updates automatically</span>
            </div>

            <div className="rounded-xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800/80 dark:bg-zinc-950">
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

      {/* Image Browser Modal */}
      <ImageBrowser
        isOpen={imageBrowserOpen}
        onClose={() => setImageBrowserOpen(false)}
        projectId={projectId}
        onInsertImage={(markdownSyntax) => handleInsertInline(markdownSyntax, "", "")}
      />
    </div>
  );
}
