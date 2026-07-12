"use client";

import { useEffect, useRef } from "react";

type Props = {
  code: string;
};

let stylesAppended = false;
let sbModule: Awaited<ReturnType<typeof importScratchblocks>> | null = null;

async function importScratchblocks() {
  return import("scratchblocks");
}

export default function Blocks3Renderer({ code }: Props) {
  const ref = useRef<HTMLDivElement>(null);

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

        if (cancelled || !ref.current) return;

        const doc = sb.parse(code, { languages: ["en"] });
        const svg = sb.render(doc, { style: "scratch3" });
        ref.current.innerHTML = "";
        ref.current.appendChild(svg);
      } catch (err) {
        console.error("Failed to render Scratch blocks:", err);
        if (ref.current) {
          ref.current.innerHTML = `<pre class="text-red-500 text-sm">Error rendering blocks</pre>`;
        }
      }
    }

    render();
    return () => { cancelled = true; };
  }, [code]);

  return <div ref={ref} className="my-4 overflow-x-auto" />;
}
