"use client";

import { PostComment } from "@/hooks/posts/use-get-post-by-id";
import { formatDistanceToNow } from "date-fns";
import { MessageCircle } from "lucide-react";
import Image from "next/image";

interface PostCommentsSectionProps {
  comments: PostComment[];
}

// ─── Single comment row ───────────────────────────────────────────────────────

function CommentRow({ comment }: { comment: PostComment }) {
  const author = comment.author;
  const fullName = `${author.firstName} ${author.lastName}`.trim();
  const avatarUrl = author.profileImage?.url;
  const isReply = !!comment.parentComment;

  return (
    <div className={`flex gap-2.5 ${isReply ? "ml-10 mt-2" : ""}`}>
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 shrink-0 mt-0.5">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={fullName}
            width={32}
            height={32}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 text-[11px] font-semibold">
            {author.firstName?.[0]}
            {author.lastName?.[0]}
          </div>
        )}
      </div>

      {/* Bubble */}
      <div className="flex-1">
        <div className="inline-block bg-[#F0F2F5] dark:bg-zinc-800 rounded-2xl px-3 py-2 max-w-[90%]">
          <p className="text-[13px] font-semibold text-fb-text-primary">
            {fullName}
          </p>
          <p className="text-[14px] text-fb-text-primary leading-snug">
            {comment.content}
          </p>
        </div>

        {/* Meta — time + reply count */}
        <div className="flex items-center gap-3 mt-1 px-1">
          <span className="text-[11px] text-fb-text-secondary">
            {formatDistanceToNow(new Date(comment.createdAt), {
              addSuffix: true,
            })}
          </span>
          {comment.repliesCount > 0 && (
            <span className="text-[11px] font-semibold text-fb-text-secondary">
              {comment.repliesCount}{" "}
              {comment.repliesCount === 1 ? "reply" : "replies"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main section ─────────────────────────────────────────────────────────────

export function PostCommentsSection({ comments }: PostCommentsSectionProps) {
  // Separate top-level and reply comments
  const topLevel = comments.filter((c) => !c.parentComment);
  const replies = comments.filter((c) => !!c.parentComment);

  if (comments.length === 0) {
    return (
      <div className="bg-card rounded-lg shadow-sm p-6 flex flex-col items-center gap-2 text-center">
        <MessageCircle className="w-8 h-8 text-gray-300" />
        <p className="text-[14px] text-fb-text-secondary">
          No comments yet. Be the first to comment!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg shadow-sm">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 border-b border-fb-divider">
        <h2 className="text-[15px] font-semibold text-fb-text-primary">
          Comments ({comments.length})
        </h2>
      </div>

      {/* Comment list — top-level first, then nested replies below their parent */}
      <div className="px-4 py-3 space-y-3">
        {topLevel.map((comment) => {
          // Find replies belonging to this top-level comment
          const commentReplies = replies.filter(
            (r) => r.parentComment === comment._id,
          );

          return (
            <div key={comment._id}>
              <CommentRow comment={comment} />

              {/* Nested replies */}
              {commentReplies.map((reply) => (
                <CommentRow key={reply._id} comment={reply} />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
