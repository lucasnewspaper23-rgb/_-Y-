"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import { useEffect, useRef } from "react";
import { editorExtensions } from "@/lib/editor-extensions";
import Ribbon from "./Ribbon";

export default function PageEditor({
  content,
  onChange,
}: {
  content: string;
  onChange: (html: string) => void;
}) {
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const editor = useEditor({
    extensions: editorExtensions,
    content,
    immediatelyRender: false,
    // The toolbar reads editor.isActive()/can() directly during render, so
    // it needs a re-render on every transaction to stay in sync.
    shouldRerenderOnTransaction: true,
    editorProps: {
      attributes: {
        class: "docmaker-page-content",
      },
    },
    onUpdate: ({ editor }) => {
      onChangeRef.current(editor.getHTML());
    },
  });

  const words = editor?.storage.characterCount.words() ?? 0;
  const characters = editor?.storage.characterCount.characters() ?? 0;

  return (
    <div className="docmaker-editor-shell flex h-full flex-1 flex-col overflow-hidden bg-surface-muted">
      <div className="print:hidden">
        <Ribbon editor={editor} />
      </div>
      <div className="docmaker-scroll-area flex-1 overflow-y-auto px-8 py-10">
        <div className="docmaker-page mx-auto bg-white">
          <EditorContent editor={editor} />
        </div>
      </div>
      <div className="flex items-center justify-end gap-3 border-t border-border-soft bg-white px-4 py-1.5 text-xs text-ink-400 print:hidden">
        <span>{words} words</span>
        <span className="text-border-strong">·</span>
        <span>{characters} characters</span>
      </div>
    </div>
  );
}
