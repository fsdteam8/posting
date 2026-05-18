"use client";

/**
 * SavedListingsContainer
 *
 * Renders the full saved listings section:
 *  - Section header with total count
 *  - Responsive grid (2 cols mobile → 3 tablet → 4 desktop)
 *  - IntersectionObserver-based infinite scroll
 *  - Skeleton loading state
 *  - Empty state when nothing is saved
 *  - Optimistic removal when a listing is unsaved
 *
 * Placed below MyListingContainer on the my-listing page.
 */

import { useGetSavedListings } from "@/hooks/features/notifications/api/useGetSavedListings";
import type { MarketplaceListing } from "@/types/features/marketplace";
import { Bookmark, BookmarkX, Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import SavedListingCard from "./save-listing-card";

// ─── Skeleton card ────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-neutral-100 overflow-hidden animate-pulse">
      <div className="aspect-square bg-neutral-100" />
      <div className="p-2.5 space-y-1.5">
        <div className="h-3.5 w-16 rounded bg-neutral-100" />
        <div className="h-3 w-28 rounded bg-neutral-100" />
        <div className="h-2.5 w-20 rounded bg-neutral-100" />
      </div>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

type Props = {
  accessToken: string;
};

// ─── Component ───────────────────────────────────────────────────────────────

export function SavedListingsContainer({ accessToken }: Props) {
  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useGetSavedListings({ accessToken, limit: 12 });

  // ── Optimistic removal ────────────────────────────────────────────────────
  // When the user unsaves a listing we remove it from the local list
  // immediately without waiting for a refetch. The query cache is also
  // invalidated by useSaveListing so the data stays in sync.
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());

  function handleUnsaved(listingId: string) {
    setRemovedIds((prev) => new Set(prev).add(listingId));
  }

  // Flatten all pages and filter out optimistically removed items
  const allListings: MarketplaceListing[] = (
    data?.pages.flatMap((p) => p.data) ?? []
  ).filter((l) => !removedIds.has(l._id));

  const totalCount = data?.pages[0]?.pagination.total ?? 0;
  // Adjust displayed total for optimistically removed items
  const displayCount = Math.max(0, totalCount - removedIds.size);

  // ── Infinite scroll sentinel ──────────────────────────────────────────────
  const sentinelRef = useRef<HTMLDivElement>(null);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) handleLoadMore();
      },
      { rootMargin: "120px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [handleLoadMore]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <section className="mt-8 pt-6 border-t border-neutral-100">
      {/* ── Section header ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 mb-4">
        <Bookmark className="w-4 h-4 text-blue-600" />
        <h2 className="text-[14px] font-semibold text-neutral-800">
          Saved listings
        </h2>
        {!isLoading && displayCount > 0 && (
          <span className="text-[12px] text-neutral-400 ml-auto">
            {displayCount} saved
          </span>
        )}
      </div>

      {/* ── Loading skeleton ───────────────────────────────────────────── */}
      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* ── Error state ────────────────────────────────────────────────── */}
      {isError && (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <p className="text-[13px] text-red-400">
            Failed to load saved listings.
          </p>
        </div>
      )}

      {/* ── Empty state ────────────────────────────────────────────────── */}
      {!isLoading && !isError && allListings.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center">
            <BookmarkX className="w-6 h-6 text-neutral-300" />
          </div>
          <div>
            <p className="text-[13px] font-medium text-neutral-600">
              No saved listings
            </p>
            <p className="text-[12px] text-neutral-400 mt-0.5">
              Tap the bookmark icon on any listing to save it here.
            </p>
          </div>
        </div>
      )}

      {/* ── Listings grid ──────────────────────────────────────────────── */}
      {!isLoading && allListings.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {allListings.map((listing) => (
              <SavedListingCard
                key={listing._id}
                listing={listing}
                accessToken={accessToken}
                onUnsaved={handleUnsaved}
              />
            ))}

            {/* Skeleton cards appended while next page loads */}
            {isFetchingNextPage &&
              Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={`next-${i}`} />
              ))}
          </div>

          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} className="h-1 w-full mt-4" aria-hidden />

          {/* End of list */}
          {!hasNextPage && allListings.length > 0 && (
            <p className="text-center text-[11.5px] text-neutral-400 py-6">
              You have seen all saved listings
            </p>
          )}

          {/* Spinner while loading next page */}
          {isFetchingNextPage && (
            <div className="flex justify-center py-4">
              <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />
            </div>
          )}
        </>
      )}
    </section>
  );
}
