"use client";

import { motion } from "framer-motion";
import { Send } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { CommentLikeButton } from "./comment-like-button";
import { MappedComment } from "./types";
import { renderCommentContent } from "./utils";

export interface CommentItemProps {
  comment: MappedComment;
  postId: string;
  accessToken: string;
  depth?: number;
  currentUserAvatar?: string;
}

export function CommentItem({
  comment,
  postId,
  accessToken,
  depth = 0,
  currentUserAvatar,
}: CommentItemProps) {
  const [showReplies, setShowReplies] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");

  const isTopLevel = depth === 0;
  const avatarSize = isTopLevel ? 32 : 28;
  const firstName = comment.author.name.split(" ")[0];

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
        {/* Text bubble */}
        <div className="inline-block max-w-full bg-[#f0f2f5] rounded-[18px] px-3 py-2">
          <div className="text-[13px] font-semibold text-[#050505] mb-0.5">
            {comment.author.name}
          </div>
          <div className="text-[14px] text-[#050505] leading-snug wrap-break-word">
            {renderCommentContent(comment.content)}
          </div>
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
          {isTopLevel && (
            <button
              onClick={() => setReplyOpen((v) => !v)}
              className="bg-transparent border-none cursor-pointer text-[12px] font-semibold text-[#65676b] p-0"
            >
              Reply
            </button>
          )}
          <span className="text-[11px] text-[#65676b]">
            {comment.createdAt}
          </span>
        </div>

        {/* Reply input */}
        {replyOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="flex gap-1.5 mt-1.5 pl-1"
          >
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
              <div className="w-7 h-7 rounded-full bg-[#e4e6eb] shrink-0" />
            )}
            <div className="flex-1 bg-[#f0f2f5] rounded-[18px] flex items-center px-3 py-1.5 gap-2">
              <input
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Reply to ${firstName}…`}
                className="flex-1 border-none bg-transparent outline-none text-[13px] text-[#050505]"
                autoFocus
              />
              {replyText.trim() && (
                <button
                  onClick={() => {
                    setReplyText("");
                    setReplyOpen(false);
                  }}
                  className="bg-transparent border-none cursor-pointer text-[#1877f2] flex p-0"
                >
                  <Send size={15} />
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* View / hide replies */}
        {comment.replies.length > 0 && !showReplies && (
          <button
            onClick={() => setShowReplies(true)}
            className="bg-transparent border-none cursor-pointer text-[13px] font-semibold text-[#050505] flex items-center gap-1 mt-1 pl-1"
          >
            ↩ View {comment.replies.length}{" "}
            {comment.replies.length === 1 ? "reply" : "replies"}
          </button>
        )}
        {showReplies &&
          comment.replies.map((reply) => (
            <CommentItem
              key={reply._id}
              comment={reply}
              postId={postId}
              accessToken={accessToken}
              depth={1}
              currentUserAvatar={currentUserAvatar}
            />
          ))}
        {showReplies && (
          <button
            onClick={() => setShowReplies(false)}
            className="bg-transparent border-none cursor-pointer text-[12px] font-semibold text-[#65676b] mt-0.5 pl-1"
          >
            Hide replies
          </button>
        )}
      </div>
    </div>
  );
}
