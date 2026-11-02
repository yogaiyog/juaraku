import { NextResponse } from "next/server";
import { requireEditor } from "@/lib/auth";
import { parseStepMarkdown } from "@/lib/markdown";
import { renderMarkdown } from "@/lib/render-markdown";
import type { ContentSegment } from "@/lib/types";

export type PreviewSegment =
  | { type: "markdown"; html: string }
  | { type: "task"; html?: string; segments?: PreviewSegment[] }
  | { type: "no-print"; html: string }
  | { type: "print-only"; html: string }
  | { type: "blocks3"; code: string }
  | { type: "collapse"; title: string; html?: string; segments?: PreviewSegment[] }
  | { type: "save" };

function transformToPreviewSegments(segments: ContentSegment[]): PreviewSegment[] {
  const previewSegments: PreviewSegment[] = [];

  for (const segment of segments) {
    switch (segment.type) {
      case "markdown":
        previewSegments.push({ type: "markdown", html: renderMarkdown(segment.content) });
        break;
      case "task":
        previewSegments.push({
          type: "task",
          html: segment.content ? renderMarkdown(segment.content) : "",
          segments: segment.segments ? transformToPreviewSegments(segment.segments) : undefined,
        });
        break;
      case "no-print":
        previewSegments.push({ type: "no-print", html: renderMarkdown(segment.content) });
        break;
      case "print-only":
        previewSegments.push({ type: "print-only", html: renderMarkdown(segment.content) });
        break;
      case "blocks3":
        previewSegments.push({ type: "blocks3", code: segment.code });
        break;
      case "collapse":
        previewSegments.push({
          type: "collapse",
          title: segment.title,
          html: segment.content ? renderMarkdown(segment.content) : "",
          segments: segment.segments ? transformToPreviewSegments(segment.segments) : undefined,
        });
        break;
      case "save":
        previewSegments.push({ type: "save" });
        break;
    }
  }

  return previewSegments;
}

export async function POST(req: Request) {
  const unauthorized = await requireEditor();
  if (unauthorized) return unauthorized;
  try {
    const body = await req.json();
    const { markdown, projectId } = body;

    if (markdown === undefined) {
      return NextResponse.json({ error: "markdown is required" }, { status: 400 });
    }

    const segments = parseStepMarkdown(markdown);
    const previewSegments = transformToPreviewSegments(segments);

    return NextResponse.json({ segments: previewSegments, projectId });
  } catch {
    return NextResponse.json({ error: "Failed to render markdown" }, { status: 500 });
  }
}
