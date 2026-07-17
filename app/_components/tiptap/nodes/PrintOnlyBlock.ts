import { Node } from "@tiptap/core";

export const PrintOnlyBlock = Node.create({
  name: "printOnlyBlock",
  group: "block",
  content: "block*",

  parseHTML() {
    return [{ tag: 'div[data-type="printOnlyBlock"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", { "data-type": "printOnlyBlock", class: "print-only-block", ...HTMLAttributes }, 0];
  },
});
