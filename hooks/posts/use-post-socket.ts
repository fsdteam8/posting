"use client";

import { getAppSocket } from "@/hooks/features/messenger/socket-singleton";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

interface PostReactionPayload {
  postId: string;
  groupId?: string;
  userId: string;
  reactionType: string;
  action: "added" | "removed" | "changed";
  reactionCount: number;
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

interface CommentReactionPayload {
  postId: string;
  groupId?: string;
  commentId: string;
  userId: string;
  reactionType: string;
  action: "added" | "removed" | "changed";
  reactionCount: number;
}

interface Params {
  userId: string | null | undefined;
  postId: string | null | undefined;
}

/**
 * Joins `post_<postId>` on the backend and listens for live reactions/comments.
 * On any matching event we invalidate the post detail + comments queries so
 * counts and lists refresh with the populated server data.
 *
 * Mount this in any view that displays a single post (detail page, modal, etc.).
 */
export function usePostSocket({ userId, postId }: Params) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!userId || !postId) return;
    const socket = getAppSocket(userId);

    function joinRoom() {
      socket.emit("joinPost", postId);
    }

    function invalidatePost(eventPostId: string) {
      if (eventPostId !== postId) return;
      qc.invalidateQueries({ queryKey: ["post", postId] });
      qc.invalidateQueries({ queryKey: ["post-comments", postId] });
    }

    function onPostReaction(payload: PostReactionPayload) {
      invalidatePost(payload.postId);
    }

    function onPostComment(payload: PostCommentPayload) {
      invalidatePost(payload.postId);
    }

    function onCommentReaction(payload: CommentReactionPayload) {
      invalidatePost(payload.postId);
    }

    if (socket.connected) {
      joinRoom();
    } else {
      socket.once("connect", joinRoom);
    }

    socket.on("post:reaction", onPostReaction);
    socket.on("post:comment", onPostComment);
    socket.on("comment:reaction", onCommentReaction);

    return () => {
      socket.off("post:reaction", onPostReaction);
      socket.off("post:comment", onPostComment);
      socket.off("comment:reaction", onCommentReaction);
      socket.off("connect", joinRoom);
      socket.emit("leavePost", postId);
    };
  }, [userId, postId, qc]);
}

interface GroupPostsParams {
  userId: string | null | undefined;
  groupId: string | null | undefined;
}

/**
 * Joins `group_<groupId>` and listens for reactions / comments on any post in
 * the group. Invalidates the group posts cache and pinned posts so feed cards
 * refresh as group members react and comment.
 */
export function useGroupPostsSocket({ userId, groupId }: GroupPostsParams) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!userId || !groupId) return;
    const socket = getAppSocket(userId);

    function joinRoom() {
      socket.emit("joinGroup", groupId);
    }

    function invalidateGroup(payload: { groupId?: string; postId?: string }) {
      if (payload.groupId !== groupId) return;
      qc.invalidateQueries({ queryKey: ["group-posts", groupId] });
      qc.invalidateQueries({ queryKey: ["pinned-posts-of-group"] });
      if (payload.postId) {
        qc.invalidateQueries({ queryKey: ["post", payload.postId] });
        qc.invalidateQueries({ queryKey: ["post-comments", payload.postId] });
      }
    }

    function onPostReaction(payload: PostReactionPayload) {
      invalidateGroup(payload);
    }
    function onPostComment(payload: PostCommentPayload) {
      invalidateGroup(payload);
    }
    function onCommentReaction(payload: CommentReactionPayload) {
      invalidateGroup(payload);
    }

    if (socket.connected) {
      joinRoom();
    } else {
      socket.once("connect", joinRoom);
    }

    socket.on("post:reaction", onPostReaction);
    socket.on("post:comment", onPostComment);
    socket.on("comment:reaction", onCommentReaction);

    return () => {
      socket.off("post:reaction", onPostReaction);
      socket.off("post:comment", onPostComment);
      socket.off("comment:reaction", onCommentReaction);
      socket.off("connect", joinRoom);
      socket.emit("leaveGroup", groupId);
    };
  }, [userId, groupId, qc]);
}
