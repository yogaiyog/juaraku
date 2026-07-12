import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkHtml from "remark-html";
import { block3Base, block3Styles } from "./block3-styles";

function preprocessAnnotations(content: string): string {
  return content.replace(/\[\[\[[^\]]*\]\]\]/g, "");
}

function preprocessTarget(content: string): string {
  return content.replace(/\{:target="[^"]*"\}/g, "");
}

function preprocessBlock3(content: string): string {
  return content.replace(
    /`([^`]+)`\{:class="block3(\w+)"\}/g,
    (_match, text, name) => {
      const styles = block3Styles[name] ?? "bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200";
      return `<span class="${block3Base} ${styles}">${text}</span>`;
    }
  );
}

function preprocessWidth(content: string): string {
  return content.replace(
    /!\[([^\]]*)\]\(([^)]+)\)\{:width="([^"]+)"\}/g,
    (_match, alt, src, width) =>
      `![${alt}](${src} "width:${width}")`
  );
}

export function renderMarkdown(content: string): string {
  let cleaned = preprocessAnnotations(content);
  cleaned = preprocessTarget(cleaned);
  cleaned = preprocessBlock3(cleaned);
  cleaned = preprocessWidth(cleaned);
  const html = String(
    unified().use(remarkParse).use(remarkHtml, { sanitize: false }).processSync(cleaned)
  );
  return html;
}
