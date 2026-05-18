"use client";

import { useGetLikedPages } from "@/hooks/features/pages/use-get-liked-pages";
import { Page } from "@/types/features/pages";
import { useState } from "react";
import { PageCard } from "../../_components/page-card";

interface LikedViewProps {
  accessToken: string;
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
      <div className="h-35 bg-gray-200" />
      <div className="p-3 space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 bg-gray-200 rounded w-3/4" />
            <div className="h-2.5 bg-gray-200 rounded w-1/2" />
            <div className="h-2.5 bg-gray-200 rounded w-2/3" />
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          <div className="flex-1 h-7 bg-gray-200 rounded-lg" />
          <div className="flex-1 h-7 bg-gray-200 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#9ca3af"
          strokeWidth="1.5"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </div>
      <p className="text-base font-semibold text-gray-700">
        No liked pages yet
      </p>
      <p className="text-sm text-gray-400 mt-1">
        Pages you like will appear here
      </p>
    </div>
  );
}

export function LikedView({ accessToken }: LikedViewProps) {
  const [optimisticRemoved, setOptimisticRemoved] = useState<Set<string>>(
    new Set(),
  );

  const { data, isLoading, isError } = useGetLikedPages({ accessToken });

  const pages: Page[] = (data?.data ?? []).filter(
    (p) => !optimisticRemoved.has(p._id),
  );

  function handleRemove(id: string) {
    // Optimistic remove — the hook will invalidate cache on success
    setOptimisticRemoved((prev) => new Set([...prev, id]));
    // Wire to: useUnfollowPage({ accessToken, pageId: id }).mutate()
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">Discover Pages</h2>
      <h3 className="text-sm font-semibold text-gray-500 mb-5">
        Pages you liked
      </h3>

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
          Failed to load liked pages. Please refresh.
        </div>
      )}

      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {!isLoading && !isError && pages.length === 0 && <EmptyState />}

      {!isLoading && pages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {pages.map((page) => (
            <PageCard
              key={page._id}
              id={page._id}
              name={page.name}
              category={page.category}
              followersCount={page.followersCount}
              coverImage={page.coverImage?.url || undefined}
              profileImage={page.profileImage?.url || undefined}
              mode="liked"
              onRemove={handleRemove}
            />
          ))}
        </div>
      )}
    </div>
  );
}
