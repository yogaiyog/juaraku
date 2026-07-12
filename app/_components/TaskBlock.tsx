"use client";

import { useState } from "react";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function TaskBlock({ children }: Props) {
  const [checked, setChecked] = useState(false);

  return (
    <div
      className={`
        my-6 flex flex-row-reverse justify-between gap-3
        rounded-xl border shadow-sm overflow-hidden
        transition-all duration-200
        ${
          checked
            ? "border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900/30"
            : "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/20"
        }
      `}
    >
      <label className="flex items-start cursor-pointer select-none pt-4 px-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={() => setChecked(!checked)}
          className="peer sr-only"
        />
        <div
          className={`
            flex items-center justify-center
            w-7 h-7 rounded-md border-[2.5px]
            transition-all duration-200
            ${
              checked
                ? "bg-scratch-blue border-scratch-blue"
                : "border-zinc-300 dark:border-zinc-600"
            }
          `}
        >
          {checked && (
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </label>

      <div
        className={`
          flex-1 p-4 transition-opacity duration-200
          ${checked ? "opacity-50" : "opacity-100"}
        `}
      >
        {children}
      </div>
    </div>
  );
}
