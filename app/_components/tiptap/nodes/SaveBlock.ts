import { Node } from "@tiptap/core";

export const SaveBlock = Node.create({
  name: "saveBlock",
  group: "block",
  atom: true,

  parseHTML() {
    return [{ tag: 'div[data-type="saveBlock"]' }];
  },

  renderHTML() {
    return ["div", { "data-type": "saveBlock", class: "save-block" }];
  },
});
