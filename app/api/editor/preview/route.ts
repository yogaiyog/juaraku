import { NextResponse } from "next/server";
import { parseStepMarkdown } from "@/lib/markdown";
import { renderMarkdown } from "@/lib/render-markdown";

type PreviewSegment =
  | { type: "markdown"; html: string }
  | { type: "task"; html: string }
  | { type: "no-print"; html: string }
  | { type: "print-only"; html: string }
  | { type: "blocks3"; code: string }
  | { type: "collapse"; title: string; html: string }
  | { type: "save" };

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { markdown, projectId } = body;

    if (markdown === undefined) {
      return NextResponse.json({ error: "markdown is required" }, { status: 400 });
    }

    const segments = parseStepMarkdown(markdown);
    const previewSegments: PreviewSegment[] = [];

    for (const segment of segments) {
      switch (segment.type) {
        case "markdown":
          previewSegments.push({ type: "markdown", html: renderMarkdown(segment.content) });
          break;
        case "task":
          previewSegments.push({ type: "task", html: renderMarkdown(segment.content) });
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
          previewSegments.push({ type: "collapse", title: segment.title, html: renderMarkdown(segment.content) });
          break;
        case "save":
          previewSegments.push({ type: "save" });
          break;
      }
    }

    return NextResponse.json({ segments: previewSegments, projectId });
  } catch {
    return NextResponse.json({ error: "Failed to render markdown" }, { status: 500 });
  }
}
