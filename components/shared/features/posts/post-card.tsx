"use client";

import { Post } from "@/types/features/posts";
import { AnimatePresence } from "framer-motion";
import { useState } from "react";
import { PostCommentDialog } from "./comment-dialog/post-comment-dialog";
import { PostActions } from "./group-post-action";
import { PostHeader } from "./post-header";
import { PostMedia } from "./post-media";
import { SharedPostEmbed } from "./shared-post-embed";

interface PostCardProps {
  post: Post;
  accessToken: string;
  loggedInUserId: string;
  groupId?: string;
}

const CHAR_LIMIT = 350;

const GroupPostCard = ({
  post,
  accessToken,
  loggedInUserId,
  groupId = "",
}: PostCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);

  const isLong = post.content && post.content.length > CHAR_LIMIT;
  const displayContent =
    !expanded && isLong ? post.content.slice(0, CHAR_LIMIT) : post.content;

  return (
    <>
      <div className="bg-card rounded-lg shadow-sm overflow-hidden">
        <PostHeader
          post={post}
          accessToken={accessToken}
          groupId={groupId}
          loggedinUserId={loggedInUserId}
        />

        {post.content && (
          <div className="px-4 pb-1">
            <div
              className="text-[15px] text-fb-text-primary leading-relaxed
            prose prose-sm max-w-none
            prose-p:my-1
            prose-strong:text-fb-text-primary
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
            prose-ul:my-1 prose-li:my-0.5
            prose-ol:my-1"
              dangerouslySetInnerHTML={{
                __html:
                  !expanded && isLong
                    ? `${displayContent}...<button
                  class="text-[14px] font-semibold text-fb-text-primary cursor-pointer hover:underline"
                  id="see-more-btn"
                >See more</button>`
                    : post.content,
              }}
              onClick={(e) => {
                if ((e.target as HTMLElement).id === "see-more-btn") {
                  setExpanded(true);
                }
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

        {post.sharedPost && <SharedPostEmbed shared={post.sharedPost} />}

        <PostMedia post={post} />
        <PostActions
          post={post}
          accessToken={accessToken}
          loggedInUserId={loggedInUserId}
          groupId={groupId}
          onCommentClick={() => setCommentDialogOpen(true)}
        />
      </div>
      {/* Comment dialog — rendered outside the card so it overlays everything */}
      <AnimatePresence>
        {commentDialogOpen && (
          <PostCommentDialog
            post={post}
            accessToken={accessToken}
            loggedInUserId={loggedInUserId}
            groupId={groupId}
            onClose={() => setCommentDialogOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default GroupPostCard;
