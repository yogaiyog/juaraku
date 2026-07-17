import { Node } from "@tiptap/core";

export const TaskBlock = Node.create({
  name: "taskBlock",
  group: "block",
  content: "block*",

  parseHTML() {
    return [{ tag: 'div[data-type="taskBlock"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", { "data-type": "taskBlock", class: "task-block", ...HTMLAttributes }, 0];
  },
});
