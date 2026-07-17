"use client";

import { useState } from "react";
import type { Editor } from "@tiptap/core";

type Props = { editor: Editor };

export default function Toolbar({ editor }: Props) {
  const [showBlockMenu, setShowBlockMenu] = useState(false);
  const [showBlocks3Dialog, setShowBlocks3Dialog] = useState(false);
  const [blocks3Code, setBlocks3Code] = useState("");
  const [showCollapseDialog, setShowCollapseDialog] = useState(false);
  const [collapseTitle, setCollapseTitle] = useState("");
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  function insertBlocks3() {
    if (!blocks3Code.trim()) return;
    editor.chain().focus().insertContent({ type: "blocks3Block", attrs: { code: blocks3Code.trim() } }).run();
    setBlocks3Code("");
    setShowBlocks3Dialog(false);
  }

  function insertCollapse() {
    editor.chain().focus().insertContent({ type: "collapseBlock", attrs: { title: collapseTitle }, content: [{ type: "paragraph" }] }).run();
    setCollapseTitle("");
    setShowCollapseDialog(false);
  }

  function insertImage() {
    if (!imageUrl.trim()) return;
    editor.chain().focus().setImage({ src: imageUrl.trim() }).run();
    setImageUrl("");
    setShowImageDialog(false);
  }

  const btn = (label: string, active?: boolean, onClick?: () => void, title?: string) => (
    <button
      type="button"
      onClick={onClick}
      title={title ?? label}
      className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
        active
          ? "bg-zinc-200 text-zinc-900 dark:bg-zinc-600"
          : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-zinc-200 px-3 py-2 dark:border-zinc-700">
      <div className="flex items-center gap-1">
        {btn("B", editor.isActive("bold"), () => editor.chain().focus().toggleBold().run(), "Bold")}
        {btn("I", editor.isActive("italic"), () => editor.chain().focus().toggleItalic().run(), "Italic")}
        {btn("U", editor.isActive("underline"), () => editor.chain().focus().toggleUnderline().run(), "Underline")}
        {btn("S", editor.isActive("strike"), () => editor.chain().focus().toggleStrike().run(), "Strikethrough")}
        {btn("<>", editor.isActive("code"), () => editor.chain().focus().toggleCode().run(), "Code")}
      </div>

      <div className="mx-1 h-5 w-px bg-zinc-300 dark:bg-zinc-600" />

      <div className="flex items-center gap-1">
        {btn("H1", editor.isActive("heading", { level: 1 }), () => editor.chain().focus().toggleHeading({ level: 1 }).run())}
        {btn("H2", editor.isActive("heading", { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run())}
        {btn("H3", editor.isActive("heading", { level: 3 }), () => editor.chain().focus().toggleHeading({ level: 3 }).run())}
      </div>

      <div className="mx-1 h-5 w-px bg-zinc-300 dark:bg-zinc-600" />

      <div className="flex items-center gap-1">
        {btn("UL", editor.isActive("bulletList"), () => editor.chain().focus().toggleBulletList().run())}
        {btn("OL", editor.isActive("orderedList"), () => editor.chain().focus().toggleOrderedList().run())}
        {btn("⏎", editor.isActive("blockquote"), () => editor.chain().focus().toggleBlockquote().run(), "Blockquote")}
        {btn("—", editor.isActive("horizontalRule"), () => editor.chain().focus().setHorizontalRule().run(), "Horizontal Rule")}
      </div>

      <div className="mx-1 h-5 w-px bg-zinc-300 dark:bg-zinc-600" />

      <div className="flex items-center gap-1">
        {btn("🔗", !!editor.getAttributes("link").href, () => {
          const url = prompt("URL:", editor.getAttributes("link").href ?? "");
          if (url === null) return;
          if (!url) { editor.chain().focus().unsetLink().run(); return; }
          editor.chain().focus().setLink({ href: url }).run();
        }, "Link")}
        {btn("🖼", false, () => setShowImageDialog(true), "Image")}
        {btn("⊞", false, () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(), "Table")}
      </div>

      <div className="mx-1 h-5 w-px bg-zinc-300 dark:bg-zinc-600" />

      <div className="relative">
        <button
          type="button"
          onClick={() => setShowBlockMenu(!showBlockMenu)}
          className="rounded px-2 py-1 text-xs font-medium text-scratch-blue hover:bg-zinc-100 dark:hover:bg-zinc-700"
        >
          + Block
        </button>
        {showBlockMenu && (
          <div className="absolute left-0 top-full z-50 mt-1 w-44 rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
            {[
              { label: "Task", action: () => editor.chain().focus().insertContent({ type: "taskBlock", content: [{ type: "paragraph" }] }).run() },
              { label: "Collapse", action: () => setShowCollapseDialog(true) },
              { label: "Save", action: () => editor.chain().focus().insertContent({ type: "saveBlock" }).run() },
              { label: "Blocks3", action: () => setShowBlocks3Dialog(true) },
              { label: "Print Only", action: () => editor.chain().focus().insertContent({ type: "printOnlyBlock", content: [{ type: "paragraph" }] }).run() },
              { label: "No Print", action: () => editor.chain().focus().insertContent({ type: "noPrintBlock", content: [{ type: "paragraph" }] }).run() },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => { item.action(); setShowBlockMenu(false); }}
                className="block w-full px-3 py-1.5 text-left text-xs text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {showBlocks3Dialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowBlocks3Dialog(false)}>
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl dark:bg-zinc-800" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-3 text-sm font-semibold text-zinc-800 dark:text-zinc-200">Insert Scratch Blocks</h3>
            <textarea
              value={blocks3Code}
              onChange={(e) => setBlocks3Code(e.target.value)}
              rows={6}
              className="mb-3 w-full rounded-lg border border-zinc-300 bg-zinc-50 p-3 font-mono text-xs dark:border-zinc-600 dark:bg-zinc-900"
              placeholder="when green flag clicked&#10;say [Hello!] for (2) secs"
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowBlocks3Dialog(false)} className="rounded-lg px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700">Cancel</button>
              <button type="button" onClick={insertBlocks3} className="rounded-lg bg-scratch-blue px-3 py-1.5 text-xs font-medium text-white hover:bg-scratch-purple">Insert</button>
            </div>
          </div>
        </div>
      )}

      {showCollapseDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowCollapseDialog(false)}>
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl dark:bg-zinc-800" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-3 text-sm font-semibold text-zinc-800 dark:text-zinc-200">Insert Collapse</h3>
            <input
              value={collapseTitle}
              onChange={(e) => setCollapseTitle(e.target.value)}
              className="mb-3 w-full rounded-lg border border-zinc-300 bg-zinc-50 p-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
              placeholder="Collapse title..."
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowCollapseDialog(false)} className="rounded-lg px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700">Cancel</button>
              <button type="button" onClick={insertCollapse} className="rounded-lg bg-scratch-blue px-3 py-1.5 text-xs font-medium text-white hover:bg-scratch-purple">Insert</button>
            </div>
          </div>
        </div>
      )}

      {showImageDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowImageDialog(false)}>
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl dark:bg-zinc-800" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-3 text-sm font-semibold text-zinc-800 dark:text-zinc-200">Insert Image URL</h3>
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="mb-3 w-full rounded-lg border border-zinc-300 bg-zinc-50 p-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
              placeholder="https://example.com/image.png"
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowImageDialog(false)} className="rounded-lg px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700">Cancel</button>
              <button type="button" onClick={insertImage} className="rounded-lg bg-scratch-blue px-3 py-1.5 text-xs font-medium text-white hover:bg-scratch-purple">Insert</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
