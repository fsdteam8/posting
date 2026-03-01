"use client";
import { cn } from "@/lib/utils";
import CharacterCount from "@tiptap/extension-character-count";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export const MAX_CHARS = 5000;

const RichTextEditor = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "What's on your mind?",
      }),
      CharacterCount.configure({ limit: MAX_CHARS }),
    ],
    content: value,
    onUpdate({ editor }) {
      const html = editor.isEmpty ? "" : editor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        // No min-h — grows naturally with content
        class:
          "focus:outline-none text-[15px] leading-relaxed text-fb-text prose prose-sm max-w-none overflow-y-visible",
      },
    },
    immediatelyRender: false,
  });

  if (!editor) return null;

  return <EditorContent editor={editor} />;
};

export default RichTextEditor;

export const ToolbarBtn = ({
  onClick,
  isActive,
  children,
  title,
}: {
  onClick: () => void;
  isActive?: boolean;
  children: React.ReactNode;
  title: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={cn(
      "p-1.5 rounded-md transition-colors",
      isActive
        ? "bg-blue-100 text-blue-600"
        : "text-fb-text-secondary hover:bg-gray-100",
    )}
  >
    {children}
  </button>
);
