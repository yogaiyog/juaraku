"use client";

import { useState, useRef, useEffect } from "react";
import Blocks3LibModal from "./Blocks3LibModal";

type BlockCategory = {
  name: string;
  className: string;
  colorBg: string;
  example: string;
};

const BLOCK_CATEGORIES: BlockCategory[] = [
  { name: "Events", className: "block3events", colorBg: "bg-[#ffbf00]", example: "when green flag clicked" },
  { name: "Motion", className: "block3motion", colorBg: "bg-[#4c97ff]", example: "move (10) steps" },
  { name: "Looks", className: "block3looks", colorBg: "bg-[#9a66ff]", example: "say [Hello!] for (2) secs" },
  { name: "Sound", className: "block3sound", colorBg: "bg-[#cf63cf]", example: "start sound [pop v]" },
  { name: "Control", className: "block3control", colorBg: "bg-[#ffab19]", example: "repeat (10)" },
  { name: "Sensing", className: "block3sensing", colorBg: "bg-[#40bfcf]", example: "touching [mouse-pointer v]?" },
  { name: "Operators", className: "block3operators", colorBg: "bg-[#0fbd8c]", example: "pick random (1) to (10)" },
  { name: "Variables", className: "block3variables", colorBg: "bg-[#ff6680]", example: "change [score v] by (1)" },
  { name: "Lists", className: "block3lists", colorBg: "bg-[#ff6680]", example: "add [thing] to [list v]" },
  { name: "My Blocks", className: "block3myblocks", colorBg: "bg-[#cf63cf]", example: "jump" },
];

type Props = {
  onInsertInline: (before: string, after?: string, defaultText?: string) => void;
  onInsertBlock: (snippet: string) => void;
  onOpenImageBrowser?: () => void;
};

export default function EditorToolbar({
  onInsertInline,
  onInsertBlock,
  onOpenImageBrowser,
}: Props) {
  const [badgeMenuOpen, setBadgeMenuOpen] = useState(false);
  const [blocksLibOpen, setBlocksLibOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close badge dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setBadgeMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleBadgeSelect(cat: BlockCategory) {
    onInsertInline("`", "`{:class=\"" + cat.className + "\"}", cat.example);
    setBadgeMenuOpen(false);
  }

  return (
    <div className="mb-2 flex flex-wrap items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-50 p-1.5 shadow-sm dark:border-zinc-700 dark:bg-zinc-800/80">
      {/* Markdown Basic formatting */}
      <div className="flex items-center gap-0.5 border-r border-zinc-200 pr-1.5 dark:border-zinc-700">
        <button
          type="button"
          onClick={() => onInsertInline("**", "**", "bold text")}
          className="rounded p-1.5 text-xs font-bold text-zinc-700 hover:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-zinc-700 transition-colors"
          title="Bold (⌘+B)"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => onInsertInline("*", "*", "italic text")}
          className="rounded p-1.5 text-xs italic text-zinc-700 hover:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-zinc-700 transition-colors"
          title="Italic (⌘+I)"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => onInsertInline("## ", "", "Heading 2")}
          className="rounded px-1.5 py-1 text-xs font-semibold text-zinc-700 hover:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-zinc-700 transition-colors"
          title="Heading 2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => onInsertInline("### ", "", "Heading 3")}
          className="rounded px-1.5 py-1 text-xs font-semibold text-zinc-700 hover:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-zinc-700 transition-colors"
          title="Heading 3"
        >
          H3
        </button>
        <button
          type="button"
          onClick={() => onInsertInline("+ ", "", "List item")}
          className="rounded px-1.5 py-1 text-xs text-zinc-700 hover:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-zinc-700 transition-colors"
          title="Bullet List"
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => onInsertInline("[", "](https://scratch.mit.edu)", "Link text")}
          className="rounded px-1.5 py-1 text-xs text-zinc-700 hover:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-zinc-700 transition-colors"
          title="Insert Link"
        >
          🔗 Link
        </button>
      </div>

      {/* Structured Juaraku Directives */}
      <div className="flex flex-wrap items-center gap-1 border-r border-zinc-200 pr-1.5 dark:border-zinc-700">
        <button
          type="button"
          onClick={() =>
            onInsertBlock("--- task ---\n\nWrite your instruction steps here...\n\n--- /task ---")
          }
          className="flex items-center gap-1 rounded bg-emerald-100/70 px-2 py-1 text-xs font-semibold text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:hover:bg-emerald-900/60 transition-colors"
          title="Insert interactive task card"
        >
          <span>📋</span> Task
        </button>

        <button
          type="button"
          onClick={() =>
            onInsertBlock(
              "--- collapse ---\n---\ntitle: I need a hint\n---\n\nAdd your hint or solution content here.\n\n--- /collapse ---"
            )
          }
          className="flex items-center gap-1 rounded bg-amber-100/70 px-2 py-1 text-xs font-semibold text-amber-800 hover:bg-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:hover:bg-amber-900/60 transition-colors"
          title="Insert collapsible hint / solution dropdown"
        >
          <span>💡</span> Hint
        </button>

        <button
          type="button"
          onClick={() => setBlocksLibOpen(true)}
          className="flex items-center gap-1.5 rounded-md bg-scratch-blue px-2.5 py-1 text-xs font-bold text-white shadow-xs hover:bg-blue-600 dark:bg-scratch-blue dark:hover:bg-blue-600 transition-colors"
          title="Buka Pustaka Blok Scratch 3.0 (Kumpulan Blok Lengkap)"
        >
          <span>🧩</span>
          <span>Blocks3 Lib</span>
        </button>

        <button
          type="button"
          onClick={() =>
            onInsertBlock("```blocks3\nwhen green flag clicked\nmove (10) steps\n```")
          }
          className="flex items-center gap-1 rounded bg-blue-100/70 px-2 py-1 text-xs font-semibold text-blue-800 hover:bg-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:hover:bg-blue-900/60 transition-colors"
          title="Insert visual Scratch 3.0 blocks code"
        >
          <span>✏️</span> Quick Block
        </button>

        <button
          type="button"
          onClick={() => onInsertBlock("--- save ---")}
          className="flex items-center gap-1 rounded bg-purple-100/70 px-2 py-1 text-xs font-semibold text-purple-800 hover:bg-purple-200 dark:bg-purple-900/40 dark:text-purple-300 dark:hover:bg-purple-900/60 transition-colors"
          title="Insert save checkpoint panel"
        >
          <span>💾</span> Save
        </button>
      </div>

      {/* Secondary Directives & Image */}
      <div className="flex items-center gap-1 border-r border-zinc-200 pr-1.5 dark:border-zinc-700">
        <button
          type="button"
          onClick={() =>
            onInsertBlock(
              "--- no-print ---\n\n<div class=\"scratch-preview\">\n  <iframe allowtransparency=\"true\" width=\"485\" height=\"402\" src=\"https://scratch.mit.edu/projects/embed/724160134/?autostart=false\" frameborder=\"0\"></iframe>\n</div>\n\n--- /no-print ---"
            )
          }
          className="rounded px-2 py-1 text-xs text-zinc-700 hover:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-zinc-700 transition-colors"
          title="Insert interactive Scratch preview iframe"
        >
          ▶️ Embed
        </button>

        <button
          type="button"
          onClick={() =>
            onInsertBlock(
              "--- print-only ---\n\n![Static preview](images/banner.png)\n\n--- /print-only ---"
            )
          }
          className="rounded px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-700 transition-colors"
          title="Content visible only when printed/PDF"
        >
          🖨️ Print Only
        </button>

        <button
          type="button"
          onClick={() => {
            if (onOpenImageBrowser) {
              onOpenImageBrowser();
            } else {
              onInsertInline("![Image description](images/example.png){:width=\"300px\"}");
            }
          }}
          className="flex items-center gap-1 rounded bg-zinc-200/80 px-2 py-1 text-xs font-semibold text-zinc-800 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600 transition-colors"
          title="Upload or browse project images"
        >
          🖼️ Image
        </button>
      </div>

      {/* Block Badge Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setBadgeMenuOpen(!badgeMenuOpen)}
          className="flex items-center gap-1.5 rounded border border-scratch-blue/30 bg-scratch-blue/10 px-2 py-1 text-xs font-semibold text-scratch-blue hover:bg-scratch-blue/20 transition-colors"
          title="Insert inline colored Scratch block badge"
        >
          <span>🏷️</span>
          <span>Block Badge</span>
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {badgeMenuOpen && (
          <div className="absolute left-0 top-full z-50 mt-1 w-64 rounded-lg border border-zinc-200 bg-white p-2 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
            <p className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Select Block Category
            </p>
            <div className="flex flex-col gap-1 max-h-72 overflow-y-auto">
              {BLOCK_CATEGORIES.map((cat) => (
                <button
                  key={cat.className}
                  type="button"
                  onClick={() => handleBadgeSelect(cat)}
                  className="flex items-center justify-between rounded px-2 py-1.5 text-left text-xs transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">{cat.name}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold text-white ${cat.colorBg}`}
                  >
                    {cat.name.toLowerCase()}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Blocks3 Library Modal */}
      <Blocks3LibModal
        isOpen={blocksLibOpen}
        onClose={() => setBlocksLibOpen(false)}
        onInsert={onInsertBlock}
      />
    </div>
  );
}
