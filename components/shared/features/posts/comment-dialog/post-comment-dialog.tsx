"use client";

import { useCreateComment } from "@/hooks/features/comments/use-create-comment";
import { useGetComments } from "@/hooks/features/groups/posts/comment/use-get-comments";
import { Post } from "@/types/features/posts";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { ImageIcon, Loader2, Send, Smile, X } from "lucide-react";
import Image from "next/image";
import React, {
  KeyboardEvent,
  MouseEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { PostActions } from "../group-post-action";
import { PostMedia } from "../post-media";
import { CommentItem } from "./comment-item";
import { ImagePreviewStrip } from "./image-preview-strip";
import { CURRENT_USER_AVATAR, MappedComment, MentionableMember } from "./types";
import {
  autoResizeTextarea,
  getAuthorAvatar,
  getAuthorName,
  mapComment,
  resolveMentionIds,
} from "./utils";

// ─── Props ────────────────────────────────────────────────────────────────────

export interface PostCommentDialogProps {
  post: Post;
  accessToken: string;
  loggedInUserId: string;
  groupId: string;
  members?: MentionableMember[];
  onClose?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PostCommentDialog({
  post,
  accessToken,
  loggedInUserId,
  groupId,
  members = [],
  onClose,
}: PostCommentDialogProps) {
  const [commentText, setCommentText] = useState("");
  const [attachedImages, setAttachedImages] = useState<File[]>([]);
  const [expanded, setExpanded] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const CHAR_LIMIT = 350;
  const isLong = post.content && post.content.length > CHAR_LIMIT;
  const displayContent =
    !expanded && isLong ? post.content.slice(0, CHAR_LIMIT) : post.content;
  const authorName = getAuthorName(post.author);
  const authorAvatar = getAuthorAvatar(post.author);

  // ── Fetch comments ────────────────────────────────────────────────────────

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetComments({ postId: post._id, accessToken });

  const queryClient = useQueryClient();

  const allComments: MappedComment[] = (data?.pages ?? [])
    .flatMap((page) => page.data)
    .map((c) => mapComment(c, loggedInUserId));

  // ── Infinite scroll ───────────────────────────────────────────────────────

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage)
          fetchNextPage();
      },
      { threshold: 0.1 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // ── Escape key + body scroll lock ────────────────────────────────────────

  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // ── Image attachment ──────────────────────────────────────────────────────

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setAttachedImages((prev) => [...prev, ...files].slice(0, 4));
    e.target.value = "";
  };

  const removeImage = (index: number) =>
    setAttachedImages((prev) => prev.filter((_, i) => i !== index));

  // ── Submit ────────────────────────────────────────────────────────────────

  const { mutate: createComment, isPending } = useCreateComment({
    postId: post._id,
    accessToken,
  });

  const canSubmit =
    (commentText.trim().length > 0 || attachedImages.length > 0) && !isPending;

  const submitComment = () => {
    if (!canSubmit) return;

    const trimmed = commentText.trim();
    const mentions = resolveMentionIds(trimmed, members);

    createComment(
      { content: trimmed, mentions, images: attachedImages },
      {
        onSuccess: (response) => {
          if (response?.data) {
            // Inject the real server comment directly into the first page of the cache
            queryClient.setQueryData(
              ["post-comments", post._id],
              (
                old:
                  | {
                      pages: { data: unknown[]; pagination: unknown }[];
                      pageParams: unknown[];
                    }
                  | undefined,
              ) => {
                if (!old) return old;
                return {
                  ...old,
                  pages: old.pages.map((page, index) =>
                    index === 0
                      ? { ...page, data: [response.data, ...page.data] }
                      : page,
                  ),
                };
              },
            );
          }

          setCommentText("");
          setAttachedImages([]);
          if (inputRef.current) inputRef.current.style.height = "auto";
          setTimeout(() => {
            scrollRef.current?.scrollTo({
              top: scrollRef.current.scrollHeight,
              behavior: "smooth",
            });
          }, 50);
        },
      },
    );
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitComment();
    }
  };

  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCommentText(e.target.value);
    autoResizeTextarea(e.target);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-9999 bg-black/80 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
        className="bg-card rounded-xl w-full max-w-170 flex flex-col overflow-hidden shadow-2xl"
        style={{ height: "min(90vh, 760px)" }}
      >
        {/* ── Header ── */}
        <div className="shrink-0 flex items-center justify-center relative px-4 py-3.5 border-b border-fb-divider">
          <span className="text-[17px] font-bold text-fb-text-primary">
            {authorName}&apos;s Post
          </span>
          <button
            onClick={onClose}
            className="absolute right-3 w-9 h-9 rounded-full bg-[#e4e6eb] flex items-center justify-center text-[#050505] border-none cursor-pointer hover:bg-[#d8dadf] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── Scrollable area ── */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          {/* Post author row */}
          <div className="flex gap-2.5 px-4 pt-4 mb-2">
            {authorAvatar ? (
              <Image
                src={authorAvatar}
                alt={authorName}
                width={40}
                height={40}
                className="rounded-full shrink-0 object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#e4e6eb] shrink-0 flex items-center justify-center text-[#65676b] font-semibold text-[16px]">
                {authorName.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div className="text-[14px] font-bold text-fb-text-primary">
                {authorName}
              </div>
              <div className="text-[12px] text-fb-text-secondary">
                {post.group?.name ? `${post.group.name} · ` : ""}
                {new Date(post.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </div>
            </div>
          </div>

          {/* Post content */}
          {post.content && (
            <div className="px-4 pb-2">
              <div
                className="text-[15px] text-fb-text-primary leading-relaxed
                  prose prose-sm max-w-none prose-p:my-1
                  prose-strong:text-fb-text-primary
                  prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                  prose-ul:my-1 prose-li:my-0.5 prose-ol:my-1"
                dangerouslySetInnerHTML={{
                  __html:
                    !expanded && isLong
                      ? `${displayContent}...<button class="text-[14px] font-semibold text-fb-text-primary cursor-pointer hover:underline" id="dialog-see-more-btn">See more</button>`
                      : post.content,
                }}
                onClick={(e) => {
                  if ((e.target as HTMLElement).id === "dialog-see-more-btn")
                    setExpanded(true);
                }}
              />
              {expanded && (
                <button
                  onClick={() => setExpanded(false)}
                  className="text-[14px] font-semibold text-fb-text-primary hover:underline"
                >
                  See less
                </button>
              )}
            </div>
          )}

          {/* Media */}
          <PostMedia post={post} />

          {/* Post actions (reactions, counts, share) */}
          <PostActions
            post={post}
            accessToken={accessToken}
            loggedInUserId={loggedInUserId}
            groupId={groupId}
            onCommentClick={() => inputRef.current?.focus()}
          />

          {/* ── Comments list ── */}
          <div className="px-4 pb-4 pt-2">
            {isLoading && (
              <div className="flex justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-fb-text-secondary" />
              </div>
            )}

            {isError && (
              <p className="text-center text-[14px] text-red-500 py-6">
                Failed to load comments.
              </p>
            )}

            {!isLoading && !isError && allComments.length === 0 && (
              <p className="text-center text-[14px] text-fb-text-secondary py-6">
                No comments yet. Be the first!
              </p>
            )}

            {allComments.map((comment) => (
              <CommentItem
                key={comment._id}
                comment={comment}
                postId={post._id}
                accessToken={accessToken}
                currentUserAvatar={CURRENT_USER_AVATAR}
              />
            ))}

            {/* Infinite scroll sentinel */}
            <div ref={sentinelRef} className="h-1" />

            {isFetchingNextPage && (
              <div className="flex justify-center py-3">
                <Loader2 className="w-4 h-4 animate-spin text-fb-text-secondary" />
              </div>
            )}

            {!hasNextPage && allComments.length > 0 && !isLoading && (
              <p className="text-center text-[11px] text-fb-text-secondary pt-2">
                All comments loaded
              </p>
            )}
          </div>
        </div>

        {/* ── Fixed comment input ── */}
        <div className="shrink-0 border-t border-fb-divider bg-card">
          <ImagePreviewStrip files={attachedImages} onRemove={removeImage} />

          <div className="flex gap-2 items-end px-3 py-2.5">
            {CURRENT_USER_AVATAR ? (
              <Image
                src={CURRENT_USER_AVATAR}
                alt="You"
                width={36}
                height={36}
                className="rounded-full shrink-0 object-cover"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#e4e6eb] shrink-0" />
            )}

            <div className="flex-1 bg-[#f0f2f5] rounded-4xl flex items-end px-3 py-2 gap-2">
              <textarea
                ref={inputRef}
                value={commentText}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                placeholder="Write a comment… Use @username to mention"
                rows={1}
                disabled={isPending}
                className="flex-1 border-none bg-transparent outline-none text-[14px] text-[#050505] resize-none overflow-hidden leading-snug p-0 font-[inherit] disabled:opacity-60"
                style={{ maxHeight: 120 }}
              />

              <div className="flex gap-1.5 items-center shrink-0 pb-0.5">
                <button
                  type="button"
                  className="bg-transparent border-none cursor-pointer text-[#65676b] flex p-0 hover:text-[#1877f2] transition-colors"
                >
                  <Smile size={18} />
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={attachedImages.length >= 4 || isPending}
                  className="bg-transparent border-none cursor-pointer text-[#65676b] flex p-0 hover:text-[#1877f2] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  title={
                    attachedImages.length >= 4 ? "Max 4 images" : "Attach image"
                  }
                >
                  <ImageIcon size={18} />
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageSelect}
                />

                <AnimatePresence>
                  {canSubmit && (
                    <motion.button
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      onClick={submitComment}
                      disabled={isPending}
                      className="bg-transparent border-none cursor-pointer text-[#1877f2] flex p-0 disabled:opacity-50"
                    >
                      {isPending ? (
                        <span className="w-4.5 h-4.5 border-2 border-[#1877f2] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send size={18} />
                      )}
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-fb-text-secondary pb-2 pl-14">
            Enter to post · Shift+Enter for new line · @username to mention
          </p>
        </div>
      </motion.div>
    </div>
  );
}
