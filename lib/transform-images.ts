export function transformImageSrcs(
  html: string,
  projectId: string
): string {
  return html.replace(
    /(<img[^>]*?src=")(images\/[^"]+)("[^>]*?>)/g,
    (_match, before, src, after) =>
      `${before}/api/assets/${projectId}/${src}${after}`
  );
}

export function transformScratchPreview(html: string): string {
  return html.replace(
    /<div class="scratch-preview">([\s\S]*?)<\/div>/g,
    (_match, inner: string) => {
      const withoutImg = inner.replace(/<img[^>]*?>/g, "");

      const withLargeIframe = withoutImg.replace(
        /(<iframe[^>]*?)width="([^"]*)"[^>]*?height="([^"]*)"([^>]*?)>/g,
        (_m, before, _w, _h, after) =>
          `${before}width="100%" height="500" style="max-width:720px;border-radius:12px"${after}>`
      );

      return `<div class="scratch-preview my-6 overflow-hidden rounded-xl border border-zinc-200 shadow-sm dark:border-zinc-700">${withLargeIframe}</div>`;
    }
  );
}

export function transformRelativeSrcs(
  html: string,
  projectId: string,
  prefix?: string
): string {
  const base = prefix ? `${prefix}/` : "";
  return html.replace(
    /(<img[^>]*?src=")((?!https?:\/\/|\/)[^"]+)("[^>]*?>)/g,
    (_match, before, src, after) =>
      `${before}/api/assets/${projectId}/${base}${src}${after}`
  );
}

function applyImageStyles(html: string): string {
  const marginStyle = "margin-top:10px;margin-bottom:20px";

  return html.replace(
    /<img([^>]*?)>/g,
    (_match, attrs) => {
      const titleMatch = attrs.match(/title="width:([^"]+)"/);
      if (titleMatch) {
        const width = titleMatch[1];
        const cleanedAttrs = attrs.replace(/\s*title="width:[^"]+"\s*/g, " ").trimEnd();
        if (cleanedAttrs.includes('style="')) {
          return `<img${cleanedAttrs.replace('style="', `style="${marginStyle};width:${width};height:auto;`)}>`;
        }
        return `<img style="${marginStyle};width:${width};height:auto"${cleanedAttrs}>`;
      }
      if (attrs.includes('style="')) {
        return `<img${attrs.replace('style="', `style="${marginStyle};`)}>`;
      }
      return `<img style="${marginStyle}"${attrs}>`;
    }
  );
}

export function applyTransforms(html: string, projectId: string): string {
  let result = transformImageSrcs(html, projectId);
  result = transformScratchPreview(result);
  result = applyImageStyles(result);
  return result;
}
