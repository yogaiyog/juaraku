import type { ContentSegment } from "@/lib/types";
import { renderMarkdown } from "@/lib/render-markdown";
import { applyTransforms } from "@/lib/transform-images";
import TaskBlock from "./TaskBlock";
import Blocks3Renderer from "./Blocks3Renderer";
import ScratchContent from "./ScratchContent";
import Collapse from "./Collapse";
import SavePanel from "./SavePanel";

type Props = {
  segments: ContentSegment[];
  projectId: string;
};

function renderHtml(content: string, projectId: string): string {
  const html = renderMarkdown(content);
  return applyTransforms(html, projectId);
}

export default function StepRenderer({ segments, projectId }: Props) {
  const proseClasses =
    "prose prose-zinc max-w-none dark:prose-invert " +
    "prose-headings:text-zinc-900 prose-headings:dark:text-zinc-100 " +
    "prose-h1:text-2xl prose-h1:font-extrabold prose-h1:tracking-tight prose-h1:mt-8 prose-h1:mb-4 " +
    "prose-h2:text-xl prose-h2:font-bold prose-h2:mt-6 prose-h2:mb-3 " +
    "prose-h3:text-lg prose-h3:font-bold prose-h3:mt-5 prose-h3:mb-2 " +
    "prose-img:my-6 " +
    "prose-a:text-scratch-blue " +
    "prose-code:rounded prose-code:bg-zinc-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:font-normal prose-code:dark:bg-zinc-800";

  const proseCompact =
    "prose prose-zinc max-w-none dark:prose-invert " +
    "prose-img:my-4 " +
    "prose-a:text-scratch-blue " +
    "prose-h2:text-xl prose-h2:font-extrabold prose-h2:mt-6 prose-h2:mb-3";

  return (
    <div>
      {segments.map((seg, i) => {
        switch (seg.type) {
          case "markdown":
            return (
              <ScratchContent
                key={i}
                className={proseClasses}
                html={renderHtml(seg.content, projectId)}
              />
            );
          case "task":
            return (
              <TaskBlock key={i}>
                <ScratchContent
                  className={proseCompact}
                  html={renderHtml(seg.content, projectId)}
                />
              </TaskBlock>
            );
          case "print-only":
            return null;
          case "no-print":
            return (
              <ScratchContent
                key={i}
                className={proseClasses}
                html={renderHtml(seg.content, projectId)}
              />
            );
          case "blocks3":
            return <Blocks3Renderer key={i} code={seg.code} />;
          case "collapse":
            return (
              <Collapse
                key={i}
                title={seg.title}
                html={renderHtml(seg.content, projectId)}
              />
            );
          case "save":
            return <SavePanel key={i} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
