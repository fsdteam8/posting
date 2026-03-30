"use client";

import GroupPostCard from "@/components/shared/features/posts/post-card";
import { useGetFeedPosts } from "@/hooks/features/feed/use-get-feed-posts";
import { Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";

interface Props {
  accessToken: string;
  loggedinUser: string;
}

const FeedPostContainer = ({ accessToken, loggedinUser }: Props) => {
  const sentinelRef = useRef<HTMLDivElement>(null);

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetFeedPosts({ accessToken });

  // ── Infinite scroll via IntersectionObserver ──────────────────────────────
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // ── Flatten pages into a single post list ─────────────────────────────────
  const posts = data?.pages.flatMap((page) => page.data) ?? [];

  // ── Loading state (first load) ────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────
  if (isError) {
    return (
      <div className="flex flex-col items-center py-16 gap-2">
        <p className="text-[14px] text-fb-text-secondary">
          {error?.message ?? "Failed to load posts."}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="text-[13px] font-semibold text-primary hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  // ── Empty state ───────────────────────────────────────────────────────────
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 gap-1 text-center">
        <p className="text-[15px] font-semibold text-fb-text-primary">
          No posts yet
        </p>
        <p className="text-[13px] text-fb-text-secondary">
          Follow people or join groups to see posts here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <GroupPostCard
          key={post._id}
          post={post}
          accessToken={accessToken}
          loggedInUserId={loggedinUser}
          groupId={post.group?._id ?? ""}
        />
      ))}

      {/* Sentinel — triggers next page fetch when visible */}
      <div ref={sentinelRef} className="h-4" />

      {/* Loading more indicator */}
      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      )}

      {/* End of feed */}
      {!hasNextPage && posts.length > 0 && (
        <p className="text-center text-[13px] text-fb-text-secondary py-4">
          You&apos;re all caught up!
        </p>
      )}
    </div>
  );
};

export default FeedPostContainer;
