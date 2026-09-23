"use client";

import { type Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  ListChecks,
  Quote,
  Minus,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  Undo2,
  Redo2,
  Eraser,
  RemoveFormatting,
  ChevronDown,
  Check,
} from "lucide-react";
import { useCallback, useState } from "react";

const FONT_FAMILIES = [
  { label: "Default", value: "" },
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Times New Roman", value: "'Times New Roman', serif" },
  { label: "Courier New", value: "'Courier New', monospace" },
  { label: "Verdana", value: "Verdana, sans-serif" },
  { label: "Comic Sans MS", value: "'Comic Sans MS', cursive" },
];

const FONT_SIZES = ["10px", "12px", "14px", "16px", "18px", "20px", "24px", "28px", "32px", "40px"];

const TEXT_COLORS = ["#17151f", "#e03131", "#e8590c", "#2f9e44", "#1971c2", "#6d5ce8", "#c2255c", "#495057"];

const HIGHLIGHT_COLORS = ["#fff3bf", "#d3f9d8", "#ffe3e3", "#d0ebff", "#eebefa", "#ffec99"];

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors disabled:pointer-events-none disabled:opacity-30 ${
        active ? "bg-accent-100 text-accent-700" : "text-ink-600 hover:bg-ink-900/[0.06] hover:text-ink-900"
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="mx-1.5 h-6 w-px self-center bg-border-soft" />;
}

function ToolbarSelect({
  title,
  value,
  onChange,
  className = "",
  children,
}: {
  title: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <select
        title={title}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`h-8 appearance-none rounded-lg border border-border-strong bg-white pl-2.5 pr-6 text-sm text-ink-700 outline-none transition-colors hover:border-accent-300 focus:border-accent-400 focus:ring-2 focus:ring-accent-100 ${className}`}
      >
        {children}
      </select>
      <ChevronDown size={13} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-ink-400" />
    </div>
  );
}

function ColorPopover({
  colors,
  activeColor,
  onPick,
  onReset,
  resetLabel,
}: {
  colors: string[];
  activeColor?: string;
  onPick: (color: string) => void;
  onReset: () => void;
  resetLabel: string;
}) {
  return (
    <div className="absolute z-20 mt-2 w-44 rounded-xl border border-border-soft bg-white p-3 shadow-xl shadow-ink-900/10">
      <div className="grid grid-cols-4 gap-2">
        {colors.map((c) => (
          <button
            key={c}
            type="button"
            title={c}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onPick(c)}
            className="relative flex h-7 w-7 items-center justify-center rounded-full ring-1 ring-inset ring-black/10 transition-transform hover:scale-110"
            style={{ background: c }}
          >
            {activeColor?.toLowerCase() === c.toLowerCase() && (
              <Check size={14} className="text-white drop-shadow-[0_0_1px_rgba(0,0,0,0.6)]" />
            )}
          </button>
        ))}
      </div>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={onReset}
        className="mt-3 w-full rounded-md py-1 text-left text-xs font-medium text-accent-600 transition-colors hover:bg-accent-50 hover:px-2"
      >
        {resetLabel}
      </button>
    </div>
  );
}

export default function Ribbon({ editor }: { editor: Editor | null }) {
  const [showTextColor, setShowTextColor] = useState(false);
  const [showHighlight, setShowHighlight] = useState(false);

  const setLink = useCallback(() => {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Enter URL", previous ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("Image URL");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  }, [editor]);

  if (!editor) return null;

  const currentColor = editor.getAttributes("textStyle").color as string | undefined;
  const currentHighlight = editor.getAttributes("highlight").color as string | undefined;

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-border-soft bg-white px-3 py-2">
      <ToolbarButton title="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
        <Undo2 size={16} />
      </ToolbarButton>
      <ToolbarButton title="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
        <Redo2 size={16} />
      </ToolbarButton>

      <Divider />

      <ToolbarSelect
        title="Paragraph style"
        value={
          editor.isActive("heading", { level: 1 })
            ? "1"
            : editor.isActive("heading", { level: 2 })
              ? "2"
              : editor.isActive("heading", { level: 3 })
                ? "3"
                : editor.isActive("heading", { level: 4 })
                  ? "4"
                  : "0"
        }
        onChange={(v) => {
          if (v === "0") editor.chain().focus().setParagraph().run();
          else editor.chain().focus().toggleHeading({ level: Number(v) as 1 | 2 | 3 | 4 }).run();
        }}
      >
        <option value="0">Normal text</option>
        <option value="1">Heading 1</option>
        <option value="2">Heading 2</option>
        <option value="3">Heading 3</option>
        <option value="4">Heading 4</option>
      </ToolbarSelect>

      <ToolbarSelect
        title="Font family"
        className="w-32"
        value={(editor.getAttributes("textStyle").fontFamily as string) ?? ""}
        onChange={(v) => {
          if (v) editor.chain().focus().setFontFamily(v).run();
          else editor.chain().focus().unsetFontFamily().run();
        }}
      >
        {FONT_FAMILIES.map((f) => (
          <option key={f.label} value={f.value}>
            {f.label}
          </option>
        ))}
      </ToolbarSelect>

      <ToolbarSelect
        title="Font size"
        className="w-[4.5rem]"
        value={(editor.getAttributes("textStyle").fontSize as string) ?? ""}
        onChange={(v) => {
          if (v) editor.chain().focus().setFontSize(v).run();
          else editor.chain().focus().unsetFontSize().run();
        }}
      >
        <option value="">Size</option>
        {FONT_SIZES.map((s) => (
          <option key={s} value={s}>
            {s.replace("px", "")}
          </option>
        ))}
      </ToolbarSelect>

      <Divider />

      <ToolbarButton title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
        <Bold size={16} />
      </ToolbarButton>
      <ToolbarButton title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <Italic size={16} />
      </ToolbarButton>
      <ToolbarButton
        title="Underline"
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <Underline size={16} />
      </ToolbarButton>
      <ToolbarButton
        title="Strikethrough"
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough size={16} />
      </ToolbarButton>
      <ToolbarButton title="Inline code" active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()}>
        <Code size={16} />
      </ToolbarButton>

      <Divider />

      <div className="relative">
        <ToolbarButton
          title="Text color"
          active={showTextColor}
          onClick={() => {
            setShowHighlight(false);
            setShowTextColor((s) => !s);
          }}
        >
          <span className="relative inline-flex h-4 w-4 items-center justify-center font-serif text-sm font-bold">
            A
            <span className="absolute -bottom-1 left-0 right-0 h-1 rounded-full" style={{ background: currentColor || "#17151f" }} />
          </span>
        </ToolbarButton>
        {showTextColor && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowTextColor(false)} />
            <ColorPopover
              colors={TEXT_COLORS}
              activeColor={currentColor}
              onPick={(c) => {
                editor.chain().focus().setColor(c).run();
                setShowTextColor(false);
              }}
              onReset={() => {
                editor.chain().focus().unsetColor().run();
                setShowTextColor(false);
              }}
              resetLabel="Reset color"
            />
          </>
        )}
      </div>

      <div className="relative">
        <ToolbarButton
          title="Highlight"
          active={editor.isActive("highlight") || showHighlight}
          onClick={() => {
            setShowTextColor(false);
            setShowHighlight((s) => !s);
          }}
        >
          <Highlighter size={16} />
        </ToolbarButton>
        {showHighlight && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowHighlight(false)} />
            <ColorPopover
              colors={HIGHLIGHT_COLORS}
              activeColor={currentHighlight}
              onPick={(c) => {
                editor.chain().focus().toggleHighlight({ color: c }).run();
                setShowHighlight(false);
              }}
              onReset={() => {
                editor.chain().focus().unsetHighlight().run();
                setShowHighlight(false);
              }}
              resetLabel="Remove highlight"
            />
          </>
        )}
      </div>

      <Divider />

      <ToolbarButton
        title="Align left"
        active={editor.isActive({ textAlign: "left" })}
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
      >
        <AlignLeft size={16} />
      </ToolbarButton>
      <ToolbarButton
        title="Align center"
        active={editor.isActive({ textAlign: "center" })}
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
      >
        <AlignCenter size={16} />
      </ToolbarButton>
      <ToolbarButton
        title="Align right"
        active={editor.isActive({ textAlign: "right" })}
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
      >
        <AlignRight size={16} />
      </ToolbarButton>
      <ToolbarButton
        title="Justify"
        active={editor.isActive({ textAlign: "justify" })}
        onClick={() => editor.chain().focus().setTextAlign("justify").run()}
      >
        <AlignJustify size={16} />
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        title="Bullet list"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List size={16} />
      </ToolbarButton>
      <ToolbarButton
        title="Numbered list"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered size={16} />
      </ToolbarButton>
      <ToolbarButton
        title="Checklist"
        active={editor.isActive("taskList")}
        onClick={() => editor.chain().focus().toggleTaskList().run()}
      >
        <ListChecks size={16} />
      </ToolbarButton>
      <ToolbarButton
        title="Blockquote"
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote size={16} />
      </ToolbarButton>
      <ToolbarButton title="Horizontal rule" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        <Minus size={16} />
      </ToolbarButton>

      <Divider />

      <ToolbarButton title="Insert link" active={editor.isActive("link")} onClick={setLink}>
        <LinkIcon size={16} />
      </ToolbarButton>
      <ToolbarButton title="Insert image" onClick={addImage}>
        <ImageIcon size={16} />
      </ToolbarButton>
      <ToolbarButton
        title="Insert table"
        onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
      >
        <TableIcon size={16} />
      </ToolbarButton>

      <Divider />

      <ToolbarButton title="Clear formatting" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}>
        <RemoveFormatting size={16} />
      </ToolbarButton>
      <ToolbarButton title="Clear all content" onClick={() => editor.chain().focus().clearContent().run()}>
        <Eraser size={16} />
      </ToolbarButton>
    </div>
  );
}
