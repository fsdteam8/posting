"use client";

import { getAppSocket } from "@/hooks/features/messenger/socket-singleton";
import type { FeedPostsResponse } from "@/types/features/feed";
import {
  InfiniteData,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect, useRef } from "react";

interface PostReactionPayload {
  postId: string;
  groupId?: string;
  userId: string;
  reactionType: string | null;
  action: "added" | "removed" | "changed";
  reactionCount: number;
  reactionSummary?: Record<string, number>;
}

interface PostCommentPayload {
  postId: string;
  groupId?: string;
  commentId: string;
  parentCommentId?: string | null;
  authorId: string;
  action: "created" | "updated" | "deleted";
  commentCount: number;
}

interface Params {
  userId: string | null | undefined;
  /** Post ids currently rendered in the feed. Join/leave is keyed off this. */
  postIds: string[];
}

/**
 * Mirrors the per-post `usePostSocket` for the home feed: joins a `post_<id>`
 * room for every post currently rendered and patches the `["feed-posts"]`
 * infinite cache when reactions / comments come in from anyone — including
 * other users — so counts stay in sync without a refresh.
 */
export function useFeedPostsSocket({ userId, postIds }: Params) {
  const qc = useQueryClient();
  const joinedRef = useRef<Set<string>>(new Set());

  // Stable string key so the effect doesn't churn on every render when the
  // underlying array reference changes but the contents don't.
  const idsKey = postIds.join(",");

  useEffect(() => {
    if (!userId) return;
    const socket = getAppSocket(userId);

    const next = new Set(postIds);
    const prev = joinedRef.current;

    // Join any newly visible post rooms.
    for (const id of next) {
      if (!prev.has(id)) {
        socket.emit("joinPost", id);
      }
    }
    // Leave rooms that scrolled out of the cache.
    for (const id of prev) {
      if (!next.has(id)) {
        socket.emit("leavePost", id);
      }
    }
    joinedRef.current = next;
  }, [userId, idsKey, postIds]);

  useEffect(() => {
    if (!userId) return;
    const socket = getAppSocket(userId);

    function patchFeed(
      postId: string,
      patch: (
        post: FeedPostsResponse["data"][number],
      ) => FeedPostsResponse["data"][number],
    ) {
      qc.setQueryData<InfiniteData<FeedPostsResponse>>(
        ["feed-posts"],
        (old) => {
          if (!old) return old;
          let changed = false;
          const nextPages = old.pages.map((page) => {
            const nextData = page.data.map((item) => {
              if (item._id !== postId) return item;
              changed = true;
              return patch(item);
            });
            return { ...page, data: nextData };
          });
          return changed ? { ...old, pages: nextPages } : old;
        },
      );
    }

    function onPostReaction(p: PostReactionPayload) {
      patchFeed(p.postId, (post) => ({
        ...post,
        reactionCount: p.reactionCount,
      }));
      // Reaction details (per-user list) come back populated through the
      // post detail endpoint — refresh it lazily so any modal showing
      // "who reacted" stays accurate.
      qc.invalidateQueries({ queryKey: ["post", p.postId] });
    }

    function onPostComment(p: PostCommentPayload) {
      patchFeed(p.postId, (post) => ({ ...post, commentCount: p.commentCount }));
    }

    socket.on("post:reaction", onPostReaction);
    socket.on("post:comment", onPostComment);

    return () => {
      socket.off("post:reaction", onPostReaction);
      socket.off("post:comment", onPostComment);
    };
  }, [userId, qc]);

  // Leave every room we joined when the consumer unmounts entirely.
  useEffect(() => {
    return () => {
      if (!userId) return;
      const socket = getAppSocket(userId);
      for (const id of joinedRef.current) {
        socket.emit("leavePost", id);
      }
      joinedRef.current = new Set();
    };
  }, [userId]);
}
