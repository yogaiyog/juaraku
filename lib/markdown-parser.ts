import type { ContentSegment, QuizChoice, QuizQuestion } from "./types";

const BLOCK_TYPES = [
  { start: /^---\s*task\s*---\s*$/m, end: /^---\s*\/task\s*---\s*$/m, type: "task" as const },
  { start: /^---\s*print-only\s*---\s*$/m, end: /^---\s*\/print-only\s*---\s*$/m, type: "print-only" as const },
  { start: /^---\s*no-print\s*---\s*$/m, end: /^---\s*\/no-print\s*---\s*$/m, type: "no-print" as const },
  { start: /^---\s*collapse\s*---\s*$/m, end: /^---\s*\/collapse\s*---\s*$/m, type: "collapse" as const },
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

function extractCollapseContent(raw: string): { title: string; body: string } {
  const trimmed = raw.trim();
  const frontmatterMatch = trimmed.match(/^---\s*\ntitle:\s*(.+?)\s*\n---\s*\n/);
  if (frontmatterMatch) {
    const title = frontmatterMatch[1].trim();
    const body = trimmed.slice(frontmatterMatch[0].length).trim();
    return { title, body };
  }
  return { title: "", body: trimmed };
}

export function parseStepMarkdown(raw: string): ContentSegment[] {
  const segments: ContentSegment[] = [];
  const remaining = raw;
  let pos = 0;

  while (pos < remaining.length) {
    const slice = remaining.slice(pos);

    const blocks3Match = slice.match(/\n?```blocks3\n([\s\S]*?)```/);
    const blockStart = findEarliestBlockStart(slice);
    const saveMatch = slice.match(/^---\s*save\s*---\s*$/m);

    if (saveMatch && saveMatch.index !== undefined && (!blocks3Match || saveMatch.index < blocks3Match.index!) && (!blockStart || saveMatch.index < blockStart.index)) {
      const textBefore = slice.slice(0, saveMatch.index).trim();
      if (textBefore) {
        segments.push({ type: "markdown", content: textBefore });
      }
      segments.push({ type: "save" });
      pos += saveMatch.index + saveMatch[0].length;
    } else if (blocks3Match && (!blockStart || blocks3Match.index! < blockStart.index)) {
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

      if (blockStart.type === "collapse") {
        const { title, body } = extractCollapseContent(content);
        const subSegments = parseStepMarkdown(body);
        for (const sub of subSegments) {
          if (sub.type === "markdown") {
            segments.push({ type: "collapse", title, content: sub.content });
          } else {
            segments.push(sub);
          }
        }
      } else {
        const subSegments = parseStepMarkdown(content);
        for (const sub of subSegments) {
          if (sub.type === "markdown") {
            segments.push({ type: blockStart.type, content: sub.content } as ContentSegment);
          } else {
            segments.push(sub);
          }
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
    const textWithoutImage = text.replace(/!\[.*?\]\(.+?\)/, "").trim();
    const image = imageMatch ? imageMatch[1] : undefined;

    const blocks3Match = textWithoutImage.match(/```blocks3\n([\s\S]*?)```/);
    let questionText = textWithoutImage;
    let blocks3Code: string | undefined;

    if (blocks3Match) {
      blocks3Code = blocks3Match[1].trim();
      questionText = textWithoutImage.replace(/```blocks3\n[\s\S]*?```/, "").trim();
    }

    const choices = parseChoices(afterChoices.replace(/---\s*\/choices\s*---/, ""));

    questions.push({ legend, text: questionText, image, choices, blocks3Code });
  }

  return questions;
}

function parseChoices(raw: string): QuizChoice[] {
  const choices: QuizChoice[] = [];
  const choiceBlocks = raw.split(/\n(?=- \([ x]\))/);

  for (const block of choiceBlocks) {
    const trimmed = block.trim();
    const headerMatch = trimmed.match(/^- \((.)\)/);
    if (!headerMatch) continue;

    const correct = headerMatch[1] === "x";

    const feedbackMatch = trimmed.match(
      /\s*---\s*feedback\s*---\s*\n([\s\S]*?)\n\s*---\s*\/feedback\s*---/
    );

    let label: string;
    let feedback = "";

    if (feedbackMatch) {
      const feedbackStartIdx = feedbackMatch.index!;
      label = trimmed.slice(headerMatch[0].length, feedbackStartIdx).trim();
      feedback = feedbackMatch[1].trim();
    } else {
      label = trimmed.slice(headerMatch[0].length).trim();
    }

    const blocks3Match = label.match(/```blocks3\n([\s\S]*?)```/);
    let blocks3Code: string | undefined;

    if (blocks3Match) {
      blocks3Code = blocks3Match[1].trim();
      label = label.replace(/```blocks3\n[\s\S]*?```/, "").trim();
    }

    choices.push({ correct, label, feedback, blocks3Code });
  }

  return choices;
}

export function parseQuizIntro(raw: string): string {
  const idx = raw.search(/---\s*question\s*---/);
  if (idx === -1) return raw.trim();
  return raw.slice(0, idx).trim();
}
