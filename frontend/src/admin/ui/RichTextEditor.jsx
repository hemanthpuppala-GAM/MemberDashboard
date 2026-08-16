import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, List, ListOrdered, Undo, Redo } from "lucide-react";

function ToolbarButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      aria-label={label}
      className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
        active ? "bg-[var(--a-accent-muted)] text-[var(--a-accent)]" : "text-[var(--a-text-muted)] hover:bg-[var(--a-bg-surface-2)] hover:text-[var(--a-text-primary)]"
      }`}
    >
      <Icon size={14} />
    </button>
  );
}

/** Minimal rich-text field backed by Tiptap — used for announcement/CMS body copy. */
export default function RichTextEditor({ value, onChange, placeholder = "Write something…" }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || "",
    editorProps: {
      attributes: { class: "a-prose min-h-[120px] text-[13.5px] leading-relaxed focus:outline-none", "data-placeholder": placeholder },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  if (!editor) return null;

  return (
    <div className="rounded-lg border border-[var(--a-border)] bg-[var(--a-bg-base)] focus-within:border-[var(--a-focus)] focus-within:ring-2 focus-within:ring-[var(--a-focus-muted)]">
      <div className="flex items-center gap-0.5 border-b border-[var(--a-border)] px-2 py-1.5">
        <ToolbarButton icon={Bold} label="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} />
        <ToolbarButton icon={Italic} label="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} />
        <ToolbarButton icon={List} label="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} />
        <ToolbarButton icon={ListOrdered} label="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} />
        <div className="mx-1 h-4 w-px bg-[var(--a-border)]" />
        <ToolbarButton icon={Undo} label="Undo" onClick={() => editor.chain().focus().undo().run()} />
        <ToolbarButton icon={Redo} label="Redo" onClick={() => editor.chain().focus().redo().run()} />
      </div>
      <div className="px-3.5 py-2.5">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
