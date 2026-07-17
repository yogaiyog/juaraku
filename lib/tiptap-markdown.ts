import type { JSONContent } from "@tiptap/react";
import type { ContentSegment } from "./types";
import { parseStepMarkdown } from "./markdown-parser";

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function renderMarkdownHtml(md: string): string {
  const htmlBlocks: string[] = [];
  let idx = 0;
  const stripped = md.replace(
    /(<[a-zA-Z\/][^>]*>)/g,
    (...args) => {
      const placeholder = `\x00HTML${idx}\x00`;
      htmlBlocks.push(args[0]);
      idx++;
      return placeholder;
    },
  );

  let result = stripped;

  result = result.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  result = result.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  result = result.replace(/^# (.+)$/gm, "<h1>$1</h1>");

  result = result.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  result = result.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  result = result.replace(/\*(.+?)\*/g, "<em>$1</em>");
  result = result.replace(/~~(.+?)~~/g, "<s>$1</s>");
  result = result.replace(/`(.+?)`/g, "<code>$1</code>");
  result = result.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  result = result.replace(/^- (.+)$/gm, "<li>$1</li>");
  result = result.replace(/^\d+\. (.+)$/gm, "<li>$1</li>");
  result = result.replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>");

  result = result.replace(/\n{2,}/g, "\x00P\x00");

  result = result.replace(/\x00HTML(\d+)\x00/g, (_m, num) => htmlBlocks[Number(num)] ?? "");

  const paragraphs = result.split("\x00P\x00").map((p) => p.trim()).filter(Boolean);
  const wrapped = paragraphs.map((p) => {
    const trimmed = p.trim();
    if (/^<(div|iframe|table|ul|ol|h[1-6]|blockquote|pre|p|form|hr)/i.test(trimmed)) {
      return trimmed;
    }
    return `<p>${trimmed}</p>`;
  });

  return wrapped.join("\n") || "<p></p>";
}

function segmentToHtml(seg: ContentSegment): string {
  switch (seg.type) {
    case "markdown":
      return renderMarkdownHtml(seg.content);
    case "task":
      return `<div data-type="taskBlock">${segmentsToHtml(seg.content)}</div>`;
    case "collapse":
      return `<div data-type="collapseBlock" data-title="${escapeHtml(seg.title)}">${segmentsToHtml(seg.content)}</div>`;
    case "save":
      return `<div data-type="saveBlock"></div>`;
    case "print-only":
      return `<div data-type="printOnlyBlock">${segmentsToHtml(seg.content)}</div>`;
    case "no-print":
      return `<div data-type="noPrintBlock">${segmentsToHtml(seg.content)}</div>`;
    case "blocks3":
      return `<div data-type="blocks3Block" data-code="${escapeHtml(seg.code)}"></div>`;
  }
}

function segmentsToHtml(content: string): string {
  const segments = parseStepMarkdown(content);
  return segments.map(segmentToHtml).join("\n");
}

export function markdownToTipTapHtml(md: string): string {
  const html = segmentsToHtml(md);
  return `<div>${html || "<p></p>"}</div>`;
}

export function serializeToMarkdown(json: JSONContent): string {
  return serializeNode(json);
}

function inlineText(nodes?: JSONContent[]): string {
  if (!nodes) return "";
  return nodes
    .map((n) => {
      if (n.type === "text") return n.text ?? "";
      if (n.type === "hardBreak") return "\n";
      return "";
    })
    .join("");
}

function serializeChildren(children?: JSONContent[]): string {
  if (!children) return "";
  const parts: string[] = [];
  for (const child of children) {
    parts.push(serializeNode(child));
  }
  return parts.join("\n\n");
}

function serializeNode(node: JSONContent): string {
  switch (node.type) {
    case "doc":
      return serializeChildren(node.content);
    case "paragraph":
      return inlineText(node.content);
    case "heading": {
      const level = node.attrs?.level ?? 1;
      return "#".repeat(level) + " " + inlineText(node.content);
    }
    case "bulletList":
      return (node.content ?? [])
        .map((li) => "- " + inlineText(li.content))
        .join("\n");
    case "orderedList":
      return (node.content ?? [])
        .map((li) => "1. " + inlineText(li.content))
        .join("\n");
    case "taskBlock":
      return "--- task ---\n" + serializeChildren(node.content) + "\n--- /task ---";
    case "collapseBlock":
      return (
        "--- collapse ---\ntitle: " +
        (node.attrs?.title ?? "") +
        "\n" +
        serializeChildren(node.content) +
        "\n--- /collapse ---"
      );
    case "saveBlock":
      return "--- save ---";
    case "printOnlyBlock":
      return "--- print-only ---\n" + serializeChildren(node.content) + "\n--- /print-only ---";
    case "noPrintBlock":
      return "--- no-print ---\n" + serializeChildren(node.content) + "\n--- /no-print ---";
    case "blocks3Block":
      return "```blocks3\n" + (node.attrs?.code ?? "") + "\n```";
    default:
      return "";
  }
}
