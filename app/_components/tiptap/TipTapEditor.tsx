"use client";

import { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import Placeholder from "@tiptap/extension-placeholder";
import { TaskBlock } from "./nodes/TaskBlock";
import { CollapseBlock } from "./nodes/CollapseBlock";
import { SaveBlock } from "./nodes/SaveBlock";
import { PrintOnlyBlock } from "./nodes/PrintOnlyBlock";
import { NoPrintBlock } from "./nodes/NoPrintBlock";
import { Blocks3Block } from "./nodes/Blocks3Block";
import { markdownToTipTapHtml, serializeToMarkdown } from "@/lib/tiptap-markdown";
import Toolbar from "./Toolbar";

type Props = {
  content: string;
  onChange: (value: string) => void;
};

export default function TipTapEditor({ content, onChange }: Props) {
  const ready = useRef(false);

  const editor = useEditor({
    immediatelyRender: true,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        link: { openOnClick: false },
      }),
      ImageExtension,
      Table,
      TableRow,
      TableCell,
      TableHeader,
      Placeholder.configure({ placeholder: "Start writing..." }),
      TaskBlock,
      CollapseBlock,
      SaveBlock,
      PrintOnlyBlock,
      NoPrintBlock,
      Blocks3Block,
    ],
    onUpdate: ({ editor: ed }) => {
      const json = ed.getJSON();
      const md = serializeToMarkdown(json);
      onChange(md);
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-[400px] px-6 py-4 dark:prose-invert",
      },
    },
  });

  useEffect(() => {
    if (!editor || ready.current) return;
    const html = markdownToTipTapHtml(content);
    editor.commands.setContent(html);
    ready.current = true;
  }, [editor, content]);

  if (!editor) return null;

  return (
    <div className="tiptap-editor w-full rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
