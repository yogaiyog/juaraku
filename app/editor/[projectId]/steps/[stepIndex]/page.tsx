"use client";

import { useEffect, useState, useRef, use, useCallback, useMemo, DragEvent } from "react";
import { useRouter } from "next/navigation";
import CodeMirror, { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { EditorView, keymap } from "@codemirror/view";
import EditorPreview from "@/app/_components/EditorPreview";
import EditorToolbar from "@/app/_components/EditorToolbar";
import ImageBrowser from "@/app/_components/ImageBrowser";

type PreviewSegment =
  | { type: "markdown"; html: string }
  | { type: "task"; html?: string; segments?: PreviewSegment[] }
  | { type: "no-print"; html: string }
  | { type: "print-only"; html: string }
  | { type: "blocks3"; code: string }
  | { type: "collapse"; title: string; html?: string; segments?: PreviewSegment[] }
  | { type: "save" };

export default function EditStepPage({
  params,
}: {
  params: Promise<{ projectId: string; stepIndex: string }>;
}) {
  const { projectId, stepIndex } = use(params);
  const stepNum = Number.parseInt(stepIndex, 10);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Content & Dirty tracking states
  const [content, setContent] = useState("");
  const [savedContent, setSavedContent] = useState("");
  const [totalSteps, setTotalSteps] = useState<number>(0);

  // Navigation confirmation modal states
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingNavigationUrl, setPendingNavigationUrl] = useState<string | null>(null);

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

  const isDirty = content !== savedContent;

  // Detect dark mode from document or media query
  useEffect(() => {
    const isDark =
      document.documentElement.classList.contains("dark") ||
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDarkMode(isDark);
  }, []);

  // Fetch Step Content
  useEffect(() => {
    fetch(`/api/editor/projects/${projectId}/steps/${stepNum}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((data) => {
        const text = data.content || "";
        setContent(text);
        setSavedContent(text);
        if (text) {
          fetchPreview(text);
        }
      })
      .catch(() => setError("Step not found"))
      .finally(() => setLoading(false));
  }, [projectId, stepNum]);

  // Fetch Total Steps Count
  useEffect(() => {
    fetch(`/api/editor/projects/${projectId}/steps`)
      .then((r) => r.json())
      .then((data) => {
        if (data.steps && Array.isArray(data.steps)) {
          setTotalSteps(data.steps.length);
        }
      })
      .catch(() => {});
  }, [projectId]);

  // Prevent accidental browser reload / tab close when dirty
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

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

  // Core Save function returning boolean success
  async function handleSave(): Promise<boolean> {
    setError(null);
    setSaving(true);

    try {
      const res = await fetch(
        `/api/editor/projects/${projectId}/steps/${stepNum}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        }
      );

      if (res.ok) {
        setSavedContent(content);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        setSaving(false);
        return true;
      } else {
        const data = await res.json();
        setError(data.error || "Failed to save");
        setSaving(false);
        return false;
      }
    } catch {
      setError("Failed to save step");
      setSaving(false);
      return false;
    }
  }

  // Navigation with Unsaved Check
  function handleNavigate(url: string) {
    if (isDirty) {
      setPendingNavigationUrl(url);
      setShowUnsavedModal(true);
    } else {
      router.push(url);
    }
  }

  async function handleSaveAndNavigate() {
    const ok = await handleSave();
    if (ok && pendingNavigationUrl) {
      setShowUnsavedModal(false);
      router.push(pendingNavigationUrl);
    }
  }

  function handleDiscardAndNavigate() {
    setShowUnsavedModal(false);
    if (pendingNavigationUrl) {
      router.push(pendingNavigationUrl);
    }
  }

  function handleCancelNavigate() {
    setShowUnsavedModal(false);
    setPendingNavigationUrl(null);
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
        <button
          onClick={() => handleNavigate(`/editor/${projectId}`)}
          className="mt-4 text-sm font-medium text-scratch-blue hover:text-scratch-purple cursor-pointer"
        >
          &larr; Back to Project
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <button
            type="button"
            onClick={() => handleNavigate(`/editor/${projectId}`)}
            className="mb-2 inline-block text-xs font-semibold text-scratch-blue hover:text-scratch-purple cursor-pointer transition-colors"
          >
            &larr; Back to Project
          </button>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
            <span>Edit Step {stepNum}</span>
            <span className="rounded bg-scratch-blue/10 px-2 py-0.5 text-xs font-semibold text-scratch-blue">
              CodeMirror Pro Editor
            </span>
            {isDirty && (
              <span className="flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 animate-in fade-in">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                Belum Disimpan
              </span>
            )}
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
            onClick={() => handleSave()}
            disabled={saving}
            className={`rounded-lg px-5 py-2 text-sm font-semibold text-white transition-all shadow-xs cursor-pointer ${
              isDirty
                ? "bg-scratch-blue hover:bg-blue-600 ring-2 ring-scratch-blue/30"
                : "bg-scratch-blue/90 hover:bg-scratch-blue"
            } disabled:opacity-50`}
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

      {/* Step Navigation Bar */}
      <div className="mt-8 flex items-center justify-between border-t border-zinc-200 pt-5 dark:border-zinc-800">
        <div>
          {stepNum > 1 && (
            <button
              type="button"
              onClick={() => handleNavigate(`/editor/${projectId}/steps/${stepNum - 1}`)}
              className="flex items-center gap-1.5 rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
            >
              &larr; Previous Step ({stepNum - 1})
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {totalSteps > 0 && stepNum >= totalSteps ? (
            <button
              type="button"
              onClick={() => handleNavigate(`/editor/${projectId}`)}
              className="flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-5 py-2 text-sm font-bold text-emerald-800 transition-all hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 cursor-pointer shadow-xs"
            >
              <span>✓ Selesai Semua Langkah</span>
              <span className="text-xs font-normal opacity-80">(Kembali ke Proyek)</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleNavigate(`/editor/${projectId}/steps/${stepNum + 1}`)}
              className="flex items-center gap-1.5 rounded-xl bg-zinc-900 px-5 py-2 text-sm font-bold text-white transition-all hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white cursor-pointer shadow-xs"
            >
              <span>Next Step ({stepNum + 1})</span>
              <span>&rarr;</span>
            </button>
          )}
        </div>
      </div>

      {/* Image Browser Modal */}
      <ImageBrowser
        isOpen={imageBrowserOpen}
        onClose={() => setImageBrowserOpen(false)}
        projectId={projectId}
        onInsertImage={(markdownSyntax) => handleInsertInline(markdownSyntax, "", "")}
      />

      {/* Unsaved Changes Confirmation Modal */}
      {showUnsavedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-3.5 mb-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-2xl text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                ⚠️
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Perubahan Belum Disimpan
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Langkah {stepNum} memiliki editan yang belum tersimpan.
                </p>
              </div>
            </div>

            <p className="text-sm text-zinc-600 dark:text-zinc-300 mb-6 leading-relaxed">
              Apakah Anda ingin menyimpan langkah ini terlebih dahulu sebelum berpindah halaman?
            </p>

            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={handleSaveAndNavigate}
                disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-scratch-blue py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-600 disabled:opacity-50 transition-colors cursor-pointer"
              >
                <span>💾</span> {saving ? "Menyimpan..." : "Simpan & Lanjutkan"}
              </button>

              <button
                type="button"
                onClick={handleDiscardAndNavigate}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-950/60 transition-colors cursor-pointer"
              >
                <span>🗑️</span> Lanjutkan Tanpa Menyimpan
              </button>

              <button
                type="button"
                onClick={handleCancelNavigate}
                className="flex w-full items-center justify-center rounded-xl border border-zinc-200 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Batal (Tetap di Sini)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
