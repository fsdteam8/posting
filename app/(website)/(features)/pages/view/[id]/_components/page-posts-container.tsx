"use client";

import GroupPostCard from "@/components/shared/features/posts/post-card";
import { useGetPagePosts } from "@/hooks/features/pages/use-get-page-posts";
import { Loader2 } from "lucide-react";

interface Props {
  pageId: string;
  accessToken: string;
  loggedInUserId: string;
}

export function PagePostsContainer({
  pageId,
  accessToken,
  loggedInUserId,
}: Props) {
  const { data, isLoading, isError, error } = useGetPagePosts({
    pageId,
    accessToken,
    limit: 10,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
        <p className="text-sm text-red-500">
          {error?.message ?? "Failed to load posts."}
        </p>
      </div>
    );
  }

  const posts = data?.data ?? [];

  if (posts.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
        <p className="text-base font-semibold text-gray-900 mb-1">
          No posts yet
        </p>
        <p className="text-sm text-gray-500">
          When this page posts something, you&apos;ll see it here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <GroupPostCard
          key={post._id}
          post={post}
          accessToken={accessToken}
          loggedInUserId={loggedInUserId}
        />
      ))}
    </div>
  );
}
