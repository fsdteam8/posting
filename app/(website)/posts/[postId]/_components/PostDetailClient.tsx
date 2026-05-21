"use client";

import GroupPostCard from "@/components/shared/features/posts/post-card";
import { Button } from "@/components/ui/button";
import { useGetPostById } from "@/hooks/posts/use-get-post-by-id";
import { usePostSocket } from "@/hooks/posts/use-post-socket";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { InlineCommentsSection } from "./InlineCommentsSection";
import { PostDetailHeader } from "./PostDetailHeader";
import { PostDetailSidebar } from "./PostDetailSidebar";

interface PostDetailClientProps {
  postId: string;
  accessToken: string;
  loggedInUserId: string;
}

export function PostDetailClient({
  postId,
  accessToken,
  loggedInUserId,
}: PostDetailClientProps) {
  const { data, isLoading, isError, error } = useGetPostById({
    postId,
    accessToken,
  });

  usePostSocket({ userId: loggedInUserId, postId });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="flex flex-col items-center py-24 gap-3 text-center px-4">
        <p className="text-[18px] font-semibold text-fb-text-primary">
          Post not found
        </p>
        <p className="text-[13px] text-fb-text-secondary max-w-md">
          {error?.message ??
            "This post may have been deleted, made private, or never existed."}
        </p>
        <Button asChild variant="secondary" className="mt-2">
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    );
  }

  const post = data.data;
  const author = post.author;
  const authorName = `${author.firstName} ${author.lastName}`.trim();

  return (
    <div className="min-h-screen">
      <PostDetailHeader authorName={authorName} postId={postId} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 px-3 py-4">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-3 min-w-0">
          <GroupPostCard
            post={post}
            accessToken={accessToken}
            loggedInUserId={loggedInUserId}
            groupId={post.group?._id ?? ""}
          />

          <InlineCommentsSection
            postId={postId}
            accessToken={accessToken}
            loggedInUserId={loggedInUserId}
            initialCommentCount={post.commentCount ?? 0}
          />
        </div>

        {/* Right sidebar */}
        <div className="lg:col-span-1 lg:sticky lg:top-16 self-start">
          <PostDetailSidebar post={post} loggedInUserId={loggedInUserId} />
        </div>
      </div>
    </div>
  );
}
