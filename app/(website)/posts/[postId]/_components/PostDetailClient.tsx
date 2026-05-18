"use client";

import GroupPostCard from "@/components/shared/features/posts/post-card";
import { useGetPostById } from "@/hooks/posts/use-get-post-by-id";
import { Loader2 } from "lucide-react";
import { PostAuthorCard } from "./PostAuthorCard";
import { PostCommentsSection } from "./PostCommentsSection";

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

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  // ── Error / not found ─────────────────────────────────────────────────────
  if (isError || !data?.data) {
    return (
      <div className="flex flex-col items-center py-24 gap-3 text-center">
        <p className="text-[16px] font-semibold text-fb-text-primary">
          Post not found
        </p>
        <p className="text-[13px] text-fb-text-secondary">
          {error?.message ??
            "This post may have been deleted or is unavailable."}
        </p>
      </div>
    );
  }

  const post = data.data;

  return (
    <div className="py-4 space-y-3">
      {/* Author stat card — sits above the post */}
      <PostAuthorCard post={post} />

      {/* Reuse the exact same PostCard from the feed — consistent UX */}
      <GroupPostCard
        post={post}
        accessToken={accessToken}
        loggedInUserId={loggedInUserId}
        groupId={post.group?._id ?? ""}
      />

      {/* Comments section */}
      <PostCommentsSection comments={post.comments ?? []} />
    </div>
  );
}
