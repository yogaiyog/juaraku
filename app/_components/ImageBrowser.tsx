"use client";

import { useState, useEffect, useRef, ChangeEvent, DragEvent } from "react";

export type ProjectAsset = {
  id: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  size: number | null;
  createdAt: string;
  url: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onInsertImage?: (markdownSyntax: string) => void;
  onSelectRawPath?: (filePath: string) => void;
  title?: string;
  selectButtonText?: string;
};

export default function ImageBrowser({
  isOpen,
  onClose,
  projectId,
  onInsertImage,
  onSelectRawPath,
  title,
  selectButtonText,
}: Props) {
  const [assets, setAssets] = useState<ProjectAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<ProjectAsset | null>(null);
  const [altText, setAltText] = useState("");
  const [widthOption, setWidthOption] = useState<string>("300px");
  const [customWidth, setCustomWidth] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchAssets();
    }
  }, [isOpen, projectId]);

  // Handle ESC key to close
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  async function fetchAssets() {
    setLoading(true);
    try {
      const res = await fetch(`/api/editor/projects/${projectId}/assets`);
      if (res.ok) {
        const data = await res.json();
        setAssets(data.assets || []);
      }
    } catch (err) {
      console.error("Failed to load project assets:", err);
    } finally {
      setLoading(false);
    }
  }

  async function uploadFile(file: File) {
    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`/api/editor/projects/${projectId}/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload");
      }

      await fetchAssets();

      // Auto-select uploaded asset
      const uploaded: ProjectAsset = {
        id: data.fileName,
        fileName: data.fileName,
        filePath: data.filePath,
        mimeType: data.mimeType,
        size: data.size,
        createdAt: new Date().toISOString(),
        url: data.url,
      };
      selectAsset(uploaded);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload error";
      setUploadError(message);
    } finally {
      setUploading(false);
    }
  }

  function handleFileInput(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (files && files[0]) {
      uploadFile(files[0]);
    }
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      uploadFile(files[0]);
    }
  }

  function selectAsset(asset: ProjectAsset) {
    setSelectedAsset(asset);
    // Create friendly default alt text from filename
    const cleanName = asset.fileName
      .replace(/\.[^/.]+$/, "")
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    setAltText(cleanName);
  }

  function generateMarkdown() {
    if (!selectedAsset) return "";
    const alt = altText.trim() || "image";
    const path = selectedAsset.filePath;
    const width = widthOption === "custom" ? customWidth.trim() : widthOption;

    if (width) {
      return `![${alt}](${path}){:width="${width}"}`;
    }
    return `![${alt}](${path})`;
  }

  function handleInsert() {
    if (!selectedAsset) return;
    if (onSelectRawPath) {
      onSelectRawPath(selectedAsset.filePath);
      onClose();
      return;
    }
    const markdown = generateMarkdown();
    if (markdown && onInsertImage) {
      onInsertImage(markdown);
      onClose();
    }
  }

  if (!isOpen) return null;

  const filteredAssets = assets.filter((a) =>
    a.fileName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="flex h-[85vh] w-full max-w-5xl flex-col rounded-2xl bg-white shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span>🖼️</span> {title || "Project Assets & Images"}
            </h2>
            <p className="text-xs text-zinc-500">
              Upload images to MinIO or select existing assets for project:{" "}
              <span className="font-semibold text-scratch-blue">{projectId}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="grid flex-1 grid-cols-1 md:grid-cols-3 overflow-hidden">
          {/* Left Column: Gallery & Upload (2 cols) */}
          <div className="flex flex-col border-r border-zinc-200 dark:border-zinc-800 md:col-span-2 overflow-hidden">
            {/* Top Toolbar: Search & Upload button */}
            <div className="flex items-center gap-3 border-b border-zinc-200 p-4 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search assets by filename..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:border-scratch-blue focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml"
                onChange={handleFileInput}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-1.5 rounded-lg bg-scratch-blue px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-scratch-purple transition-colors disabled:opacity-50"
              >
                <span>↑</span>
                <span>{uploading ? "Uploading..." : "Upload Image"}</span>
              </button>
            </div>

            {/* Dropzone & Upload Banner */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              className={`border-b transition-colors px-4 py-2 text-center text-xs ${
                isDragOver
                  ? "border-scratch-blue bg-scratch-blue/10 text-scratch-blue font-medium"
                  : "border-zinc-200 bg-zinc-50/50 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/30"
              }`}
            >
              {uploading ? (
                <span className="flex items-center justify-center gap-2 text-scratch-blue font-medium">
                  <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-zinc-300 border-t-scratch-blue" />
                  Uploading image to MinIO...
                </span>
              ) : isDragOver ? (
                "Drop image file here to upload"
              ) : (
                "Drag & drop any image here to instantly upload to MinIO"
              )}
            </div>

            {uploadError && (
              <div className="bg-red-50 px-4 py-2 text-xs text-red-600 dark:bg-red-950/30 dark:text-red-400 border-b border-red-200 dark:border-red-900">
                ⚠️ {uploadError}
              </div>
            )}

            {/* Images Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="flex h-48 items-center justify-center">
                  <p className="text-xs text-zinc-400">Loading assets...</p>
                </div>
              ) : filteredAssets.length === 0 ? (
                <div className="flex h-48 flex-col items-center justify-center text-center">
                  <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    No images found
                  </p>
                  <p className="mt-1 text-xs text-zinc-400">
                    {search ? "No assets match your search" : "Upload your first image to get started"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {filteredAssets.map((asset) => {
                    const isSelected = selectedAsset?.id === asset.id;
                    return (
                      <button
                        key={asset.id}
                        type="button"
                        onClick={() => selectAsset(asset)}
                        className={`group relative flex flex-col overflow-hidden rounded-xl border text-left transition-all ${
                          isSelected
                            ? "border-scratch-blue ring-2 ring-scratch-blue bg-scratch-blue/5 dark:bg-scratch-blue/10"
                            : "border-zinc-200 hover:border-zinc-300 bg-white hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
                        }`}
                      >
                        <div className="relative aspect-video w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={asset.url}
                            alt={asset.fileName}
                            className="h-full w-full object-contain p-1 group-hover:scale-105 transition-transform duration-200"
                            loading="lazy"
                          />
                        </div>
                        <div className="p-2">
                          <p
                            className="truncate text-[11px] font-medium text-zinc-800 dark:text-zinc-200"
                            title={asset.fileName}
                          >
                            {asset.fileName}
                          </p>
                          <p className="text-[10px] text-zinc-400">
                            {asset.size ? `${(asset.size / 1024).toFixed(0)} KB` : "Asset"}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Customizer & Preview (1 col) */}
          <div className="flex flex-col justify-between p-6 bg-zinc-50/50 dark:bg-zinc-900/30 overflow-y-auto">
            {selectedAsset ? (
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Image Configuration
                </h3>

                {/* Thumbnail Preview */}
                <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-950 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedAsset.url}
                    alt={altText}
                    className="max-h-full max-w-full object-contain p-2"
                  />
                </div>

                {/* Options if inserting markdown */}
                {!onSelectRawPath && (
                  <>
                    {/* Alt Text */}
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        Alt Text / Caption
                      </label>
                      <input
                        type="text"
                        value={altText}
                        onChange={(e) => setAltText(e.target.value)}
                        placeholder="Describe image..."
                        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-900 focus:border-scratch-blue focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                      />
                    </div>

                    {/* Width Picker */}
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        Image Display Width
                      </label>
                      <div className="grid grid-cols-3 gap-1.5 mb-2">
                        {[
                          { label: "250px", val: "250px" },
                          { label: "300px", val: "300px" },
                          { label: "400px", val: "400px" },
                          { label: "500px", val: "500px" },
                          { label: "100%", val: "100%" },
                          { label: "None", val: "" },
                        ].map((opt) => (
                          <button
                            key={opt.label}
                            type="button"
                            onClick={() => setWidthOption(opt.val)}
                            className={`rounded-md px-2 py-1 text-xs font-medium border transition-colors ${
                              widthOption === opt.val
                                ? "bg-scratch-blue text-white border-scratch-blue"
                                : "bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setWidthOption("custom")}
                          className={`text-xs font-medium px-2 py-1 rounded border ${
                            widthOption === "custom"
                              ? "bg-scratch-blue text-white border-scratch-blue"
                              : "bg-white text-zinc-700 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700"
                          }`}
                        >
                          Custom Width
                        </button>
                        {widthOption === "custom" && (
                          <input
                            type="text"
                            value={customWidth}
                            onChange={(e) => setCustomWidth(e.target.value)}
                            placeholder="e.g. 350px or 80%"
                            className="flex-1 rounded-lg border border-zinc-300 bg-white px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                          />
                        )}
                      </div>
                    </div>

                    {/* Generated Markdown Syntax Preview */}
                    <div>
                      <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                        Markdown Syntax
                      </label>
                      <div className="rounded-lg bg-zinc-900 p-2.5 font-mono text-[11px] text-zinc-200 overflow-x-auto break-all border border-zinc-800">
                        {generateMarkdown()}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <span className="text-3xl mb-2">👈</span>
                <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Select an image from the gallery or upload a new one to configure and insert.
                </p>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-zinc-300 px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInsert}
                disabled={!selectedAsset}
                className="rounded-lg bg-scratch-blue px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-scratch-purple transition-colors disabled:opacity-50"
              >
                {selectButtonText || (onSelectRawPath ? "Select Image" : "Insert into Step")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
