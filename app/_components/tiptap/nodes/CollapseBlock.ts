import { Node } from "@tiptap/core";

export const CollapseBlock = Node.create({
  name: "collapseBlock",
  group: "block",
  content: "block*",

  addAttributes() {
    return {
      title: { default: "" },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="collapseBlock"]',
        getAttrs: (el) => ({
          title: (el as HTMLElement).getAttribute("data-title") ?? "",
        }),
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      {
        "data-type": "collapseBlock",
        "data-title": HTMLAttributes.title,
        class: "collapse-block",
      },
      0,
    ];
  },
});
