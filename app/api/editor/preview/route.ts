import { NextResponse } from "next/server";
import { parseStepMarkdown } from "@/lib/markdown";
import { renderMarkdown } from "@/lib/render-markdown";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { markdown } = body;

    if (!markdown && markdown !== "") {
      return NextResponse.json({ error: "markdown is required" }, { status: 400 });
    }

    const segments = parseStepMarkdown(markdown);
    let html = "";

    for (const segment of segments) {
      if (segment.type === "markdown") {
        html += renderMarkdown(segment.content);
      }
    }

    return NextResponse.json({ html });
  } catch {
    return NextResponse.json({ error: "Failed to render markdown" }, { status: 500 });
  }
}
