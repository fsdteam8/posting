import { Mark, markInputRule, mergeAttributes } from "@tiptap/core";

export const HashtagExtension = Mark.create({
  name: "hashtag",

  parseHTML() {
    return [{ tag: "span[data-hashtag]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        "data-hashtag": "",
        class: "text-primary cursor-pointer hover:underline font-medium",
      }),
      0,
    ];
  },

  // Auto-apply when user types a hashtag followed by space
  addInputRules() {
    return [
      markInputRule({
        find: /(^|\s)(#[a-zA-Z\d_]+)(\s)$/,
        type: this.type,
      }),
    ];
  },
});
