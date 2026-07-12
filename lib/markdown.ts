import fs from "node:fs";
import type { ContentSegment, QuizQuestion, QuizChoice } from "./types";

const BLOCK_TYPES = [
  { start: /^---\s*task\s*---\s*$/m, end: /^---\s*\/task\s*---\s*$/m, type: "task" as const },
  { start: /^---\s*print-only\s*---\s*$/m, end: /^---\s*\/print-only\s*---\s*$/m, type: "print-only" as const },
  { start: /^---\s*no-print\s*---\s*$/m, end: /^---\s*\/no-print\s*---\s*$/m, type: "no-print" as const },
];

export function splitBlocks3Content(content: string): ContentSegment[] {
  const segments: ContentSegment[] = [];
  const regex = /\n?```blocks3\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    const before = content.slice(lastIndex, match.index).trim();
    if (before) {
      segments.push({ type: "markdown", content: before });
    }
    segments.push({ type: "blocks3", code: match[1].trim() });
    lastIndex = regex.lastIndex;
  }

  const remaining = content.slice(lastIndex).trim();
  if (remaining) {
    segments.push({ type: "markdown", content: remaining });
  }

  return segments;
}

export function parseStepMarkdown(raw: string): ContentSegment[] {
  const segments: ContentSegment[] = [];
  const remaining = raw;
  let pos = 0;

  while (pos < remaining.length) {
    const slice = remaining.slice(pos);

    const blocks3Match = slice.match(/\n?```blocks3\n([\s\S]*?)```/);
    const blockStart = findEarliestBlockStart(slice);

    if (blocks3Match && (!blockStart || blocks3Match.index! < blockStart.index)) {
      const textBefore = slice.slice(0, blocks3Match.index).trim();
      if (textBefore) {
        segments.push({ type: "markdown", content: textBefore });
      }
      segments.push({ type: "blocks3", code: blocks3Match[1].trim() });
      pos += blocks3Match.index! + blocks3Match[0].length;
    } else if (blockStart) {
      const textBefore = slice.slice(0, blockStart.index).trim();
      if (textBefore) {
        segments.push({ type: "markdown", content: textBefore });
      }

      const endIndex = slice.indexOf(blockStart.endMatch, blockStart.pos + blockStart.startMatch.length);
      if (endIndex === -1) break;

      const content = slice.slice(
        blockStart.pos + blockStart.startMatch.length,
        endIndex
      ).trim();

      const subSegments = parseStepMarkdown(content);
      for (const sub of subSegments) {
        if (sub.type === "markdown") {
          segments.push({ type: blockStart.type, content: sub.content } as ContentSegment);
        } else {
          segments.push(sub);
        }
      }

      pos += endIndex + blockStart.endMatch.length;
    } else {
      const remainingText = slice.trim();
      if (remainingText) {
        segments.push({ type: "markdown", content: remainingText });
      }
      break;
    }
  }

  return segments;
}

function findEarliestBlockStart(slice: string): {
  type: ContentSegment["type"];
  startMatch: string;
  endMatch: string;
  index: number;
  pos: number;
} | null {
  let earliest: ReturnType<typeof findEarliestBlockStart> = null;

  for (const bt of BLOCK_TYPES) {
    const match = slice.match(bt.start);
    if (match && (!earliest || match.index! < earliest.index)) {
      const endMatch = slice.slice(match.index! + match[0].length).match(bt.end);
      if (endMatch) {
        earliest = {
          type: bt.type,
          startMatch: match[0],
          endMatch: endMatch[0],
          index: match.index!,
          pos: match.index!,
        };
      }
    }
  }

  return earliest;
}

export async function getStepContent(
  projectId: string,
  stepIndex: number
): Promise<ContentSegment[]> {
  const { getStepPath } = await import("./projects");
  const filePath = getStepPath(projectId, stepIndex);
  if (!fs.existsSync(filePath)) return [];
  const raw = fs.readFileSync(filePath, "utf-8");
  const cleaned = raw;
  return parseStepMarkdown(cleaned);
}

export function parseQuiz(raw: string): QuizQuestion[] {
  const questions: QuizQuestion[] = [];

  const questionBlocks = raw.match(
    /---\s*question\s*---\n([\s\S]*?)\n---\s*\/question\s*---/g
  );

  if (!questionBlocks) return questions;

  for (const block of questionBlocks) {
    const inner = block.replace(/---\s*question\s*---\n/, "").replace(/\n---\s*\/question\s*---/, "");

    const legendMatch = inner.match(/legend:\s*(.+)/);
    const legend = legendMatch ? legendMatch[1].trim() : "";

    const beforeChoices = inner.split(/---\s*choices\s*---/)[0] ?? "";
    const afterChoices = inner.split(/---\s*choices\s*---/)[1] ?? "";

    const text = beforeChoices
      .replace(/^---\n/, "")
      .replace(/legend:\s*.+\n?/, "")
      .trim();

    const imageMatch = text.match(/!\[.*?\]\((.+?)\)/);
    const questionText = text.replace(/!\[.*?\]\(.+?\)/, "").trim();
    const image = imageMatch ? imageMatch[1] : undefined;

    const choices = parseChoices(afterChoices.replace(/---\s*\/choices\s*---/, ""));

    questions.push({ legend, text: questionText, image, choices });
  }

  return questions;
}

function parseChoices(raw: string): QuizChoice[] {
  const choices: QuizChoice[] = [];
  const choiceBlocks = raw.split(/\n(?=- \([ x]\))/);

  for (const block of choiceBlocks) {
    const trimmed = block.trim();
    const match = trimmed.match(/^- \((.)\)\s+(.+)/);
    if (!match) continue;

    const correct = match[1] === "x";
    const label = match[2].trim();
    const feedbackMatch = trimmed.match(/---\s*feedback\s*---\n([\s\S]*?)\n---\s*\/feedback\s*---/);
    const feedback = feedbackMatch ? feedbackMatch[1].trim() : "";

    choices.push({ correct, label, feedback });
  }

  return choices;
}

export function parseQuizIntro(raw: string): string {
  const idx = raw.search(/---\s*question\s*---/);
  if (idx === -1) return raw.trim();
  return raw.slice(0, idx).trim();
}
