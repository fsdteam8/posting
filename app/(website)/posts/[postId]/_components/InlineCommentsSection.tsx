"use client";

import {
  CommentItem,
  ImagePreviewStrip,
  mapComment,
  resolveMentionIds,
  type MappedComment,
} from "@/components/shared/features/posts/comment-dialog";
import { useCreateComment } from "@/hooks/features/comments/use-create-comment";
import { useGetComments } from "@/hooks/features/groups/posts/comment/use-get-comments";
import { useProfile } from "@/hooks/profile/use-profile";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { ImageIcon, Loader2, Send, Smile } from "lucide-react";
import Image from "next/image";
import {
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";

interface Props {
  postId: string;
  accessToken: string;
  loggedInUserId: string;
  initialCommentCount: number;
}

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "top", label: "Most relevant" },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];

export function InlineCommentsSection({
  postId,
  accessToken,
  loggedInUserId,
  initialCommentCount,
}: Props) {
  const queryClient = useQueryClient();
  const { data: profile } = useProfile(accessToken);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const [commentText, setCommentText] = useState("");
  const [attachedImages, setAttachedImages] = useState<File[]>([]);
  const [sort, setSort] = useState<SortValue>("newest");

  const currentUserAvatar = profile?.profileImage?.url ?? "";

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetComments({ postId, accessToken });

  const flat: MappedComment[] = (data?.pages ?? [])
    .flatMap((page) => page.data)
    .map((c) => mapComment(c, loggedInUserId));

  const sorted =
    sort === "top"
      ? [...flat].sort((a, b) => b.likes - a.likes)
      : flat;

  const totalComments = data?.pages[0]?.pagination?.total ?? initialCommentCount;

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

  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setAttachedImages((prev) => [...prev, ...files].slice(0, 4));
    e.target.value = "";
  };

  const removeImage = (index: number) =>
    setAttachedImages((prev) => prev.filter((_, i) => i !== index));

  const handleTextareaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setCommentText(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  const { mutate: createComment, isPending } = useCreateComment({
    postId,
    accessToken,
  });

  const canSubmit =
    (commentText.trim().length > 0 || attachedImages.length > 0) && !isPending;

  const submitComment = () => {
    if (!canSubmit) return;
    const trimmed = commentText.trim();
    const mentions = resolveMentionIds(trimmed, []);

    createComment(
      { content: trimmed, mentions, images: attachedImages },
      {
        onSuccess: (response) => {
          if (response?.data) {
            queryClient.setQueryData(
              ["post-comments", postId],
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

  return (
    <section className="bg-card rounded-lg shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-fb-divider">
        <h2 className="text-[15px] font-semibold text-fb-text-primary">
          Comments
          {totalComments > 0 && (
            <span className="ml-1 text-fb-text-secondary font-normal">
              ({totalComments.toLocaleString()})
            </span>
          )}
        </h2>

        <div className="flex items-center gap-1">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSort(opt.value)}
              className={`text-[12px] font-semibold px-2.5 py-1 rounded-full transition-colors ${
                sort === opt.value
                  ? "bg-primary/10 text-primary"
                  : "text-fb-text-secondary hover:bg-fb-hover"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Composer */}
      <div className="px-4 pt-3 pb-2">
        <ImagePreviewStrip files={attachedImages} onRemove={removeImage} />
        <div className="flex gap-2 items-end">
          {currentUserAvatar ? (
            <Image
              src={currentUserAvatar}
              alt="You"
              width={36}
              height={36}
              className="rounded-full shrink-0 object-cover w-9 h-9"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-[#e4e6eb] shrink-0" />
          )}

          <div className="flex-1 bg-[#f0f2f5] dark:bg-zinc-800 rounded-4xl flex items-end px-3 py-2 gap-2">
            <textarea
              ref={inputRef}
              value={commentText}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Write a comment… Use @username to mention"
              rows={1}
              disabled={isPending}
              className="flex-1 border-none bg-transparent outline-none text-[14px] text-fb-text-primary resize-none overflow-hidden leading-snug p-0 font-[inherit] disabled:opacity-60"
              style={{ maxHeight: 120 }}
            />

            <div className="flex gap-1.5 items-center shrink-0 pb-0.5">
              <button
                type="button"
                className="bg-transparent border-none cursor-pointer text-fb-text-secondary flex p-0 hover:text-primary transition-colors"
                aria-label="Emoji"
              >
                <Smile size={18} />
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={attachedImages.length >= 4 || isPending}
                className="bg-transparent border-none cursor-pointer text-fb-text-secondary flex p-0 hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
                    className="bg-transparent border-none cursor-pointer text-primary flex p-0 disabled:opacity-50"
                    aria-label="Send"
                  >
                    {isPending ? (
                      <span className="w-4.5 h-4.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send size={18} />
                    )}
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
        <p className="text-[11px] text-fb-text-secondary pt-1.5 pl-11">
          Enter to post · Shift+Enter for new line
        </p>
      </div>

      {/* Comments list */}
      <div className="px-4 pb-4 pt-1">
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

        {!isLoading && !isError && sorted.length === 0 && (
          <p className="text-center text-[14px] text-fb-text-secondary py-8">
            No comments yet. Be the first!
          </p>
        )}

        {sorted.map((comment) => (
          <CommentItem
            key={comment._id}
            comment={comment}
            postId={postId}
            accessToken={accessToken}
            currentUserAvatar={currentUserAvatar}
            currentUserId={loggedInUserId}
            isAdmin={false}
            members={[]}
          />
        ))}

        <div ref={sentinelRef} className="h-1" />

        {isFetchingNextPage && (
          <div className="flex justify-center py-3">
            <Loader2 className="w-4 h-4 animate-spin text-fb-text-secondary" />
          </div>
        )}

        {!hasNextPage && sorted.length > 0 && !isLoading && (
          <p className="text-center text-[11px] text-fb-text-secondary pt-2">
            All comments loaded
          </p>
        )}
      </div>
    </section>
  );
}
