"use client";

import { useDiscoverPages } from "@/hooks/features/pages/use-discover-pages";
import { useFollowPage } from "@/hooks/features/pages/use-follow-page";
import { useUnfollowPage } from "@/hooks/features/pages/use-unfollow-page";
import { Page } from "@/types/features/pages";
import { useQueryClient } from "@tanstack/react-query";
import { CompassIcon, RefreshCw, X } from "lucide-react";
import { useState } from "react";
import { PageCard } from "../page-card";

interface DiscoverViewProps {
  accessToken: string;
}

// Per-card wrapper so each card owns its own follow/unfollow mutation instance
function DiscoverPageCard({
  page,
  accessToken,
  onRemove,
}: {
  page: Page;
  accessToken: string;
  onRemove: (id: string) => void;
}) {
  const [isLiked, setIsLiked] = useState(
    page.currentUserMeta?.isLiked ?? false,
  );

  const { mutate: follow, isPending: isFollowing } = useFollowPage({
    accessToken,
    pageId: page._id,
  });

  const { mutate: unfollow, isPending: isUnfollowing } = useUnfollowPage({
    accessToken,
    pageId: page._id,
  });

  function handleLike() {
    if (isLiked) {
      setIsLiked(false); // optimistic
      unfollow(undefined, {
        onError: () => setIsLiked(true), // rollback on failure
      });
    } else {
      setIsLiked(true); // optimistic
      follow(undefined, {
        onError: () => setIsLiked(false), // rollback on failure
      });
    }
  }

  return (
    <PageCard
      id={page._id}
      name={page.name}
      category={page.category}
      followersCount={page.followersCount}
      coverImage={page.coverImage?.url || undefined}
      profileImage={page.profileImage?.url || undefined}
      mode="discover"
      isLiked={isLiked}
      isPending={isFollowing || isUnfollowing}
      onLike={handleLike}
      onRemove={onRemove}
    />
  );
}

export default function DiscoverView({ accessToken }: DiscoverViewProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useDiscoverPages({ accessToken });

  const pages: Page[] = (data?.data ?? []).filter((p) => !dismissed.has(p._id));

  function handleRefresh() {
    queryClient.invalidateQueries({ queryKey: ["discover-pages"] });
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">Discover Pages</h2>
      <h3 className="text-sm font-semibold text-gray-500 mb-5">
        Suggested for you
      </h3>

      {/* Error */}
      {isError && (
        <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          Failed to load pages. Please refresh.
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && pages.length === 0 && (
        <EmptyState onRefresh={handleRefresh} />
      )}

      {/* Grid */}
      {!isLoading && !isError && pages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {pages.map((page) => (
            <DiscoverPageCard
              key={page._id}
              page={page}
              accessToken={accessToken}
              onRemove={(id) => setDismissed((prev) => new Set([...prev, id]))}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface EmptyStateProps {
  onRefresh: () => void;
}

function EmptyState({ onRefresh }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="relative w-22 h-22 mb-6">
        <div className="w-22 h-22 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
          <CompassIcon size={36} className="text-gray-400" />
        </div>
        <div className="absolute bottom-0.5 right-0.5 w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center">
          <X size={13} className="text-gray-400" />
        </div>
      </div>

      <p className="text-base font-medium text-gray-900 mb-2">
        No pages to discover
      </p>
      <p className="text-sm text-gray-500 max-w-65 leading-relaxed mb-7">
        You have seen all available suggestions. Check back later for new pages.
      </p>

      <button
        onClick={() => onRefresh()}
        className="inline-flex items-center gap-2 px-5 py-2 text-sm rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <RefreshCw size={15} />
        Refresh suggestions
      </button>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Cover image */}
      <div className="h-35 bg-gray-200 animate-pulse" />

      <div className="p-3">
        {/* Avatar + text lines */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 bg-gray-200 animate-pulse rounded w-3/4" />
            <div className="h-2.5 bg-gray-200 animate-pulse rounded w-1/2" />
            <div className="h-2.5 bg-gray-200 animate-pulse rounded w-2/3" />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <div className="flex-1 h-7 bg-gray-200 animate-pulse rounded-lg" />
          <div className="flex-1 h-7 bg-gray-200 animate-pulse rounded-lg" />
        </div>
      </div>
    </div>
  );
}
