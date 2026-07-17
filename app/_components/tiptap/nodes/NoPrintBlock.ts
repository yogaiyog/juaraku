import { Node } from "@tiptap/core";

export const NoPrintBlock = Node.create({
  name: "noPrintBlock",
  group: "block",
  content: "block*",

  parseHTML() {
    return [{ tag: 'div[data-type="noPrintBlock"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", { "data-type": "noPrintBlock", class: "no-print-block", ...HTMLAttributes }, 0];
  },
});
