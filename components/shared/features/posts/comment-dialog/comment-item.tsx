"use client";

import { useCreateReply } from "@/hooks/features/groups/posts/comment/use-create-reply";
import { useDeleteComment } from "@/hooks/features/groups/posts/comment/use-delete-comment";
import { useDeleteReply } from "@/hooks/features/groups/posts/comment/use-delete-reply";
import { AnimatePresence, motion } from "framer-motion";
import { MoreHorizontal, Pencil, Send, Trash2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { CommentLikeButton } from "./comment-like-button";
import { MappedComment, MentionableMember } from "./types";
import { renderCommentContent, resolveMentionIds } from "./utils";

export interface CommentItemProps {
  comment: MappedComment;
  postId: string;
  accessToken: string;
  depth?: number;
  currentUserAvatar?: string;
  currentUserId?: string;
  isAdmin?: boolean;
  members?: MentionableMember[];
  onDelete?: (commentId: string) => void;
}

export function CommentItem({
  comment,
  postId,
  accessToken,
  depth = 0,
  currentUserAvatar,
  currentUserId,
  isAdmin = false,
  members = [],
  onDelete,
}: CommentItemProps) {
  const [showReplies, setShowReplies] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const menuRef = useRef<HTMLDivElement>(null);
  const replyInputRef = useRef<HTMLInputElement>(null);

  const isTopLevel = depth === 0;
  const avatarSize = isTopLevel ? 32 : 28;
  const firstName = comment.author.name.split(" ")[0];
  const canModify = isAdmin || currentUserId === comment.author._id;

  // ── Delete comment (top-level) ──────────────────────────────────────────
  const { mutate: deleteComment } = useDeleteComment({
    commentId: comment._id,
    postId,
    accessToken,
  });

  // ── Create reply ────────────────────────────────────────────────────────
  const { mutate: createReply, isPending: isReplyPending } = useCreateReply({
    postId,
    accessToken,
  });

  // ── Delete reply (depth > 0) ────────────────────────────────────────────
  const { mutate: deleteReply } = useDeleteReply({
    replyId: comment._id,
    postId,
    accessToken,
  });

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  // Auto-focus reply input when opened
  useEffect(() => {
    if (replyOpen) {
      setTimeout(() => replyInputRef.current?.focus(), 50);
    }
  }, [replyOpen]);

  function handleEditSave() {
    if (editText.trim()) {
      // TODO: wire up to your edit API
      setIsEditing(false);
    }
  }

  function handleDelete() {
    setMenuOpen(false);
    if (depth > 0) {
      // It's a reply
      deleteReply(undefined, {
        onSuccess: () => onDelete?.(comment._id),
      });
    } else {
      deleteComment(undefined, {
        onSuccess: () => onDelete?.(comment._id),
      });
    }
  }

  function handleReplySubmit() {
    const trimmed = replyText.trim();
    if (!trimmed || isReplyPending) return;

    const mentions = resolveMentionIds(trimmed, members);

    createReply(
      { content: trimmed, parentComment: comment._id, mentions },
      {
        onSuccess: () => {
          setReplyText("");
          setReplyOpen(false);
          setShowReplies(true); // reveal replies so user sees what they posted
        },
      },
    );
  }

  function handleReplyKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleReplySubmit();
    }
    if (e.key === "Escape") {
      setReplyOpen(false);
      setReplyText("");
    }
  }

  return (
    <div
      className="flex gap-2 mb-3"
      style={{ paddingLeft: depth > 0 ? 36 : 0 }}
    >
      {/* Avatar */}
      {comment.author.avatar ? (
        <Image
          src={comment.author.avatar}
          alt={comment.author.name}
          width={avatarSize}
          height={avatarSize}
          className="rounded-full shrink-0 object-cover"
          style={{
            width: avatarSize,
            height: avatarSize,
            minWidth: avatarSize,
          }}
        />
      ) : (
        <div
          className="rounded-full shrink-0 bg-[#e4e6eb] flex items-center justify-center text-[#65676b] font-semibold"
          style={{
            width: avatarSize,
            height: avatarSize,
            minWidth: avatarSize,
            fontSize: avatarSize * 0.4,
          }}
        >
          {comment.author.name.charAt(0).toUpperCase()}
        </div>
      )}

      <div className="flex-1 min-w-0">
        {/* Text bubble + three-dot menu */}
        <div className="flex items-start gap-1">
          {isEditing ? (
            /* ── Inline edit mode ── */
            <div className="flex-1 bg-[#f0f2f5] rounded-[18px] px-3 py-2">
              <div className="text-[13px] font-semibold text-[#050505] mb-1">
                {comment.author.name}
              </div>
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full border-none bg-transparent outline-none text-[14px] text-[#050505] leading-snug resize-none"
                rows={2}
                autoFocus
              />
              <div className="flex items-center justify-end gap-2 mt-1.5">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditText(comment.content);
                  }}
                  className="text-[12px] font-semibold text-[#65676b] bg-transparent border-none cursor-pointer px-2 py-1 rounded-lg hover:bg-[#e4e6eb]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSave}
                  disabled={!editText.trim()}
                  className="text-[12px] font-semibold text-white bg-[#1877f2] border-none cursor-pointer px-2 py-1 rounded-lg disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            /* ── Normal bubble ── */
            <div className="inline-block max-w-full bg-[#f0f2f5] rounded-[18px] px-3 py-2">
              <div className="text-[13px] font-semibold text-[#050505] mb-0.5">
                {comment.author.name}
              </div>
              <div className="text-[14px] text-[#050505] leading-snug wrap-break-word">
                {renderCommentContent(comment.content)}
              </div>
            </div>
          )}

          {/* Three-dot menu — only for admin or comment/reply owner */}
          {canModify && !isEditing && (
            <div className="relative mt-1" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-transparent hover:bg-[#e4e6eb] border-none cursor-pointer text-[#65676b] transition-colors"
              >
                <MoreHorizontal size={16} />
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -4 }}
                    transition={{ duration: 0.12 }}
                    className="absolute left-0 top-8 z-50 bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.15)] py-1 min-w-35"
                  >
                    {/* Edit only available on top-level comments for now */}
                    {isTopLevel && (
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          setIsEditing(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-[14px] text-[#050505] hover:bg-[#f0f2f5] bg-transparent border-none cursor-pointer text-left"
                      >
                        <Pencil size={15} className="text-[#65676b]" />
                        Edit
                      </button>
                    )}
                    <button
                      onClick={handleDelete}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-[14px] text-[#e41c2b] hover:bg-[#f0f2f5] bg-transparent border-none cursor-pointer text-left"
                    >
                      <Trash2 size={15} />
                      Delete
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Attached images */}
        {comment.images.length > 0 && (
          <div
            className={`mt-1.5 grid gap-1 ${
              comment.images.length === 1 ? "grid-cols-1" : "grid-cols-2"
            }`}
          >
            {comment.images.map((url, i) => (
              <div key={i} className="relative w-full aspect-video">
                <Image
                  src={url}
                  alt={`attachment ${i + 1}`}
                  fill
                  className="rounded-xl object-cover"
                />
              </div>
            ))}
          </div>
        )}

        {/* Actions row */}
        <div className="flex items-center gap-3 mt-1 pl-3">
          <CommentLikeButton
            commentId={comment._id}
            postId={postId}
            accessToken={accessToken}
            count={comment.likes}
            initialReaction={comment.userReaction}
          />
          {/* Reply button: only on top-level comments */}
          {isTopLevel && (
            <button
              onClick={() => setReplyOpen((v) => !v)}
              className="bg-transparent border-none cursor-pointer text-[12px] font-semibold text-[#65676b] p-0 hover:text-[#050505] transition-colors"
            >
              Reply
            </button>
          )}
          <span className="text-[11px] text-[#65676b]">
            {comment.createdAt}
          </span>
        </div>

        {/* ── Reply input (top-level only) ───────────────────────────────── */}
        <AnimatePresence>
          {replyOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <div className="flex gap-1.5 mt-1.5 pl-1">
                {currentUserAvatar ? (
                  <Image
                    src={currentUserAvatar}
                    alt="You"
                    width={28}
                    height={28}
                    className="rounded-full shrink-0 object-cover"
                    style={{ width: 28, height: 28, minWidth: 28 }}
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#e4e6eb] shrink-0 flex items-center justify-center text-[#65676b] font-semibold text-[11px]">
                    {currentUserId?.charAt(0)?.toUpperCase() ?? "?"}
                  </div>
                )}
                <div className="flex-1 bg-[#f0f2f5] rounded-[18px] flex items-center px-3 py-1.5 gap-2">
                  <input
                    ref={replyInputRef}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={handleReplyKeyDown}
                    placeholder={`Reply to ${firstName}…`}
                    disabled={isReplyPending}
                    className="flex-1 border-none bg-transparent outline-none text-[13px] text-[#050505] disabled:opacity-60"
                  />
                  <AnimatePresence>
                    {replyText.trim() && (
                      <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        onClick={handleReplySubmit}
                        disabled={isReplyPending}
                        className="bg-transparent border-none cursor-pointer text-[#1877f2] flex p-0 disabled:opacity-50 shrink-0"
                      >
                        {isReplyPending ? (
                          <span className="w-3.5 h-3.5 border-2 border-[#1877f2] border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Send size={15} />
                        )}
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <p className="text-[10px] text-[#65676b] pl-10 mt-0.5">
                Enter to reply · Esc to cancel
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── View / hide replies ─────────────────────────────────────────── */}
        {comment.replies.length > 0 && !showReplies && (
          <button
            onClick={() => setShowReplies(true)}
            className="bg-transparent border-none cursor-pointer text-[13px] font-semibold text-[#050505] flex items-center gap-1 mt-1 pl-1 hover:underline"
          >
            ↩ View {comment.replies.length}{" "}
            {comment.replies.length === 1 ? "reply" : "replies"}
          </button>
        )}

        <AnimatePresence>
          {showReplies && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply._id}
                  comment={reply}
                  postId={postId}
                  accessToken={accessToken}
                  depth={1}
                  currentUserAvatar={currentUserAvatar}
                  currentUserId={currentUserId}
                  isAdmin={isAdmin}
                  members={members}
                  onDelete={onDelete}
                />
              ))}
              <button
                onClick={() => setShowReplies(false)}
                className="bg-transparent border-none cursor-pointer text-[12px] font-semibold text-[#65676b] mt-0.5 pl-1 hover:text-[#050505] transition-colors"
              >
                Hide replies
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
