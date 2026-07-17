import { Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import Blocks3NodeView from "./Blocks3NodeView";

export const Blocks3Block = Node.create({
  name: "blocks3Block",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      code: { default: "" },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="blocks3Block"]',
        getAttrs: (el) => ({
          code: (el as HTMLElement).getAttribute("data-code") ?? "",
        }),
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", { "data-type": "blocks3Block", "data-code": HTMLAttributes.code, class: "blocks3-block" }];
  },

  addNodeView() {
    return ReactNodeViewRenderer(Blocks3NodeView);
  },
});
