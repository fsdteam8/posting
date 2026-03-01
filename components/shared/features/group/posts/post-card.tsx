"use client";

import { GroupPost } from "@/types/features/posts";
import { PostHeader } from "../../posts/post-header";
import { PostMedia } from "../../posts/post-media";
import { PostActions } from "./group-post-action";

interface PostCardProps {
  post: GroupPost;
}

const GroupPostCard = ({ post }: PostCardProps) => {
  return (
    <div className="bg-card rounded-lg shadow-sm overflow-hidden">
      {/* Header: avatar, name, feeling, timestamp, visibility, more */}
      <PostHeader post={post} />

      {/* Text content */}
      {post.content && (
        <div
          className="px-4 pb-3 text-[15px] text-fb-text-primary leading-relaxed
      prose prose-sm max-w-none
      prose-p:my-1
      prose-strong:text-fb-text-primary
      prose-a:text-primary prose-a:no-underline hover:prose-a:underline
      prose-ul:my-1 prose-li:my-0.5
      prose-ol:my-1"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      )}

      {/* Images / Video */}
      <PostMedia post={post} />

      {/* Like / Comment / Share + counts */}
      <PostActions post={post} />

      {/* Comment input — wire up when ready */}
      {post.allowComments && (
        <div className="px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-secondary shrink-0" />
            <div className="flex-1 bg-fb-bg-wash rounded-full px-4 py-2 text-[14px] text-fb-text-secondary cursor-text">
              Write a comment...
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupPostCard;
