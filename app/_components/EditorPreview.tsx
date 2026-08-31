"use client";

import TaskBlock from "./TaskBlock";
import Blocks3Renderer from "./Blocks3Renderer";
import ScratchContent from "./ScratchContent";
import Collapse from "./Collapse";
import SavePanel from "./SavePanel";
import { applyTransforms } from "@/lib/transform-images";

type PreviewSegment =
  | { type: "markdown"; html: string }
  | { type: "task"; html?: string; segments?: PreviewSegment[] }
  | { type: "no-print"; html: string }
  | { type: "print-only"; html: string }
  | { type: "blocks3"; code: string }
  | { type: "collapse"; title: string; html?: string; segments?: PreviewSegment[] }
  | { type: "save" };

type Props = {
  segments: PreviewSegment[];
  projectId: string;
};

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

function transformHtml(html: string, projectId: string): string {
  return applyTransforms(html, projectId);
}

function renderSegmentItem(seg: PreviewSegment, i: number, projectId: string) {
  switch (seg.type) {
    case "markdown":
      return (
        <ScratchContent
          key={i}
          className={proseClasses}
          html={transformHtml(seg.html, projectId)}
        />
      );
    case "task":
      return (
        <TaskBlock key={i}>
          {seg.segments && seg.segments.length > 0 ? (
            <div className="space-y-4">
              {seg.segments.map((sub, j) => renderSegmentItem(sub, j, projectId))}
            </div>
          ) : (
            <ScratchContent
              className={proseCompact}
              html={transformHtml(seg.html || "", projectId)}
            />
          )}
        </TaskBlock>
      );
    case "no-print":
      return (
        <ScratchContent
          key={i}
          className={proseClasses}
          html={transformHtml(seg.html, projectId)}
        />
      );
    case "print-only":
      return (
        <div
          key={i}
          className="my-4 rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-4 dark:border-zinc-600 dark:bg-zinc-900/30"
        >
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-400">
            🖨️ Print only
          </p>
          <ScratchContent
            className={proseCompact}
            html={transformHtml(seg.html, projectId)}
          />
        </div>
      );
    case "blocks3":
      return <Blocks3Renderer key={i} code={seg.code} />;
    case "collapse":
      return (
        <Collapse
          key={i}
          title={seg.title}
          html={seg.html ? transformHtml(seg.html, projectId) : undefined}
        >
          {seg.segments && seg.segments.length > 0 ? (
            <div className="space-y-4">
              {seg.segments.map((sub, j) => renderSegmentItem(sub, j, projectId))}
            </div>
          ) : null}
        </Collapse>
      );
    case "save":
      return <SavePanel key={i} />;
    default:
      return null;
  }
}

export default function EditorPreview({ segments, projectId }: Props) {
  if (segments.length === 0) {
    return (
      <p className="text-zinc-400 italic text-sm">
        Start typing to see a preview...
      </p>
    );
  }

  return (
    <div>
      {segments.map((seg, i) => renderSegmentItem(seg, i, projectId))}
    </div>
  );
}
