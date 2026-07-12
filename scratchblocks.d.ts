declare module "scratchblocks" {
  interface RenderOptions {
    style?: string;
    scale?: number;
    languages?: string[];
    inline?: boolean;
  }

  const scratchblocks: {
    parse(
      code: string,
      options?: { languages?: string[] }
    ): Record<string, unknown>;
    render(
      doc: Record<string, unknown>,
      options?: RenderOptions
    ): SVGElement;
    read(
      el: Element,
      options?: { inline?: boolean }
    ): string;
    replace(
      el: Element,
      svg: SVGElement,
      doc: Record<string, unknown>,
      options?: { inline?: boolean }
    ): void;
    renderMatching(
      selector: string | Element,
      options?: RenderOptions
    ): void;
    renderDoc(
      code: string,
      options?: Record<string, unknown>
    ): HTMLElement;
    appendStyles(): void;
    loadLanguages(languages: Record<string, unknown>): void;
  };
  export default scratchblocks;
}
