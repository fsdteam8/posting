"use client";

import { GroupPost } from "@/types/features/posts";
import { MessageCircle, Share2, ThumbsUp } from "lucide-react";

interface PostActionsProps {
  post: GroupPost;
  onCommentClick?: () => void;
}

export const PostActions = ({ post, onCommentClick }: PostActionsProps) => {
  const { reactionCount, commentCount, shareCount } = post;

  return (
    <>
      {/* Counts row */}
      {(reactionCount > 0 || commentCount > 0 || shareCount > 0) && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-fb-divider">
          {reactionCount > 0 && (
            <div className="flex items-center gap-1">
              <span className="w-w-4.5 h-w-4.5 rounded-full bg-fb-blue flex items-center justify-center">
                <ThumbsUp className="w-2.5 h-2.5 text-white fill-white" />
              </span>
              <span className="text-[14px] text-fb-text-secondary hover:underline cursor-pointer">
                {reactionCount.toLocaleString()}
              </span>
            </div>
          )}
          <div className="flex items-center gap-3 ml-auto">
            {commentCount > 0 && (
              <button
                onClick={onCommentClick}
                className="text-[14px] text-fb-text-secondary hover:underline"
              >
                {commentCount.toLocaleString()} comments
              </button>
            )}
            {shareCount > 0 && (
              <span className="text-[14px] text-fb-text-secondary hover:underline cursor-pointer">
                {shareCount.toLocaleString()} shares
              </span>
            )}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center border-b border-fb-divider mx-4">
        <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-md hover:bg-fb-hover transition-colors">
          <ThumbsUp className="w-5 h-5 text-fb-text-secondary" />
          <span className="text-[15px] font-semibold text-fb-text-secondary">
            Like
          </span>
        </button>
        <button
          onClick={onCommentClick}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-md hover:bg-fb-hover transition-colors"
        >
          <MessageCircle className="w-5 h-5 text-fb-text-secondary" />
          <span className="text-[15px] font-semibold text-fb-text-secondary">
            Comment
          </span>
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-md hover:bg-fb-hover transition-colors">
          <Share2 className="w-5 h-5 text-fb-text-secondary" />
          <span className="text-[15px] font-semibold text-fb-text-secondary">
            Share
          </span>
        </button>
      </div>
    </>
  );
};
