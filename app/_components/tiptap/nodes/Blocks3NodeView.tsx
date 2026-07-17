"use client";

import { useEffect, useRef, useState } from "react";
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";

let stylesAppended = false;

export default function Blocks3NodeView({ node, updateAttributes }: NodeViewProps) {
  const code = node.attrs.code ?? "";
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState(false);
  const prevCode = useRef(code);

  useEffect(() => {
    if (code === prevCode.current) return;
    prevCode.current = code;

    if (!code.trim()) return;

    let cancelled = false;

    async function render() {
      try {
        const sbModule = await import("scratchblocks");
        const sb = sbModule.default;

        if (!stylesAppended && typeof sb.appendStyles === "function") {
          sb.appendStyles();
          stylesAppended = true;
        }

        if (cancelled) return;

        const doc = sb.parse(code, { languages: ["en"] });
        const svgEl = sb.render(doc, { style: "scratch3" });
        setSvg(svgEl.outerHTML);
        setError(false);
      } catch (err) {
        console.error("Blocks3 render error:", err);
        if (!cancelled) setError(true);
      }
    }

    render();
    return () => { cancelled = true; };
  }, [code]);

  return (
    <NodeViewWrapper>
      <div className="blocks3-editor-block my-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
            Scratch Blocks
          </span>
          <button
            type="button"
            onClick={() => {
              const newCode = prompt("Edit Scratch blocks code:", code);
              if (newCode !== null) {
                updateAttributes({ code: newCode });
              }
            }}
            className="rounded px-2 py-0.5 text-xs text-zinc-500 hover:bg-zinc-200 hover:text-zinc-700 dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
          >
            Edit
          </button>
        </div>
        {error ? (
          <pre className="overflow-x-auto rounded bg-zinc-100 p-3 font-mono text-xs text-red-500 dark:bg-zinc-800">
            {code}
          </pre>
        ) : svg ? (
          <div className="overflow-x-auto" dangerouslySetInnerHTML={{ __html: svg }} />
        ) : (
          <pre className="overflow-x-auto rounded bg-zinc-100 p-3 font-mono text-xs text-zinc-600 dark:bg-zinc-800">
            {code || "Empty blocks3 block"}
          </pre>
        )}
      </div>
    </NodeViewWrapper>
  );
}
