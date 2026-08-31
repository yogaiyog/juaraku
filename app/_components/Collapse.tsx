"use client";

import { useState } from "react";
import ScratchContent from "./ScratchContent";

type Props = {
  title: string;
  html?: string;
  children?: React.ReactNode;
};

const proseCompact =
  "prose prose-zinc max-w-none dark:prose-invert " +
  "prose-img:my-4 " +
  "prose-a:text-scratch-blue " +
  "prose-h2:text-xl prose-h2:font-extrabold prose-h2:mt-6 prose-h2:mb-3";

export default function Collapse({ title, html, children }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="my-6 overflow-hidden rounded-xl border border-zinc-200 shadow-sm dark:border-zinc-700">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
      >
        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          {title}
        </h3>
        <svg
          className={`h-5 w-5 shrink-0 text-zinc-400 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {open && (
        <div className="border-t border-zinc-200 px-5 py-4 dark:border-zinc-700">
          {children ? children : html ? <ScratchContent className={proseCompact} html={html} /> : null}
        </div>
      )}
    </div>
  );
}
