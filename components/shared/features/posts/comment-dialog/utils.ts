import { Post } from "@/types/features/posts";
import { Comment } from "@/types/features/posts/comments";
import React from "react";
import { MappedComment, MentionableMember, ReactionType } from "./types";

// ─── Post author helpers ──────────────────────────────────────────────────────

export function getAuthorName(author: Post["author"]): string {
  return `${author.firstName} ${author.lastName}`.trim();
}

export function getAuthorAvatar(author: Post["author"]): string {
  return author.profileImage?.url ?? "";
}

// ─── Mention helpers ──────────────────────────────────────────────────────────

/** Extract @username tokens from raw text → unique lowercase usernames */
export function parseRawMentions(text: string): string[] {
  const matches = text.match(/@(\w+)/g) ?? [];
  return [...new Set(matches.map((m) => m.slice(1).toLowerCase()))];
}

/** Resolve @usernames in text → user _ids using the members list */
export function resolveMentionIds(
  text: string,
  members: MentionableMember[],
): string[] {
  return parseRawMentions(text)
    .map(
      (username) =>
        members.find((m) => m.username.toLowerCase() === username)?._id,
    )
    .filter((id): id is string => Boolean(id));
}

// ─── Comment mapper ───────────────────────────────────────────────────────────

/** Map API Comment shape → flat MappedComment for rendering */
export function mapComment(c: Comment, loggedInUserId?: string): MappedComment {
  // Support both shapes the API may return:
  //   1. A top-level `userReaction` field (server resolves it for the logged-in user)
  //   2. A populated `reactions[]` array that we search by loggedInUserId
  const raw = c as unknown as { userReaction?: ReactionType | null };

  const userReaction: ReactionType | null =
    raw.userReaction !== undefined
      ? (raw.userReaction ?? null)
      : loggedInUserId
        ? (c.reactions?.find((r) => r.user._id === loggedInUserId)?.type ??
          null)
        : null;

  return {
    _id: c._id,
    author: {
      name: `${c.author.firstName} ${c.author.lastName}`.trim(),
      avatar: c.author.profileImage?.url ?? "",
    },
    content: c.content,
    likes: c.reactionCount,
    userReaction,
    createdAt: new Date(c.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    images: (c.images ?? []).map((img) => img.url),
    replies: (c.replies ?? []).map((reply) =>
      mapComment(reply, loggedInUserId),
    ),
    _raw: c,
  };
}

// ─── Content renderer ─────────────────────────────────────────────────────────

/** Split text on @mentions → returns mixed string / JSX array */
export function renderCommentContent(
  text: string,
): (string | React.ReactElement)[] {
  return text
    .split(/(@\w+)/g)
    .map((part: string, i: number) =>
      part.startsWith("@")
        ? React.createElement(
            "span",
            { key: i, className: "text-[#1877f2] font-semibold" },
            part,
          )
        : part,
    );
}

// ─── Textarea auto-resize ─────────────────────────────────────────────────────

export function autoResizeTextarea(
  el: HTMLTextAreaElement,
  maxHeight = 120,
): void {
  el.style.height = "auto";
  el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
}
