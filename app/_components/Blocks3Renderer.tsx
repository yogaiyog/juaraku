"use client";

import { useEffect, useState } from "react";

type Props = {
  code: string;
};

let stylesAppended = false;
let sbModule: Awaited<ReturnType<typeof importScratchblocks>> | null = null;

async function importScratchblocks() {
  return import("scratchblocks");
}

export default function Blocks3Renderer({ code }: Props) {
  const [svgHtml, setSvgHtml] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    async function render() {
      try {
        if (!sbModule) {
          sbModule = await importScratchblocks();
        }

        const sb = sbModule.default;

        if (!stylesAppended && typeof sb.appendStyles === "function") {
          sb.appendStyles();
          stylesAppended = true;
        }

        if (cancelled) return;

        const doc = sb.parse(code, { languages: ["en"] });
        const svg = sb.render(doc, { style: "scratch3" });
        setSvgHtml(svg.outerHTML);
      } catch (err) {
        console.error("Failed to render Scratch blocks:", err);
        setSvgHtml(
          `<pre class="text-red-500 text-sm">Error rendering blocks</pre>`
        );
      }
    }

    render();
    return () => { cancelled = true; };
  }, [code]);

  return (
    <div
      className="my-4 overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: svgHtml }}
    />
  );
}
