import { getFileText } from "./minio";
import type { ContentSegment } from "./types";

export {
  parseStepMarkdown,
  splitBlocks3Content,
  parseQuiz,
  parseQuizIntro,
} from "./markdown-parser";

export async function getStepContent(
  projectId: string,
  stepIndex: number
): Promise<ContentSegment[]> {
  const { getStepPath } = await import("./projects");
  const minioKey = await getStepPath(projectId, stepIndex);
  const raw = await getFileText(minioKey);
  if (!raw) return [];
  const { parseStepMarkdown } = await import("./markdown-parser");
  return parseStepMarkdown(raw);
}
