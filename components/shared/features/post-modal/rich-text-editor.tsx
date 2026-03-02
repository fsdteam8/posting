"use client";
import { cn } from "@/lib/utils";
import { Extension } from "@tiptap/core";
import CharacterCount from "@tiptap/extension-character-count";
import Placeholder from "@tiptap/extension-placeholder";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

const HashtagHighlight = Extension.create({
  name: "hashtagHighlight",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("hashtagHighlight"),
        props: {
          decorations(state) {
            const decorations: Decoration[] = [];
            const regex = /#[a-zA-Z\d_]+/g;

            state.doc.descendants((node, pos) => {
              if (!node.isText || !node.text) return;
              let match;
              while ((match = regex.exec(node.text)) !== null) {
                const start = pos + match.index;
                const end = start + match[0].length;
                decorations.push(
                  Decoration.inline(start, end, {
                    class:
                      "text-primary cursor-pointer hover:underline font-medium",
                  }),
                );
              }
            });

            return DecorationSet.create(state.doc, decorations);
          },
        },
      }),
    ];
  },
});

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
      Placeholder.configure({ placeholder: "What's on your mind?" }),
      CharacterCount.configure({ limit: MAX_CHARS }),
      HashtagHighlight,
    ],
    content: value,
    onUpdate({ editor }) {
      const html = editor.isEmpty ? "" : editor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        class:
          "focus:outline-none text-[15px] leading-relaxed text-fb-text prose prose-sm max-w-none overflow-y-visible",
      },
      handlePaste(_, event) {
        const html = event.clipboardData?.getData("text/html") ?? "";
        const text = event.clipboardData?.getData("text/plain") ?? "";

        if (!html.includes("hashtag#") && !text.includes("hashtag#")) {
          return false; // default paste behavior
        }

        event.preventDefault();

        const clean = (str: string) => str.replace(/hashtag#/gi, "#");
        const cleanedText = clean(text);

        // Insert as plain text to avoid LinkedIn's messy HTML classes
        editor?.commands.insertContent(cleanedText);

        return true;
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
