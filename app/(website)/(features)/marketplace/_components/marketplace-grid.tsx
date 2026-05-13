"use client";

import { MarketplaceListing } from "@/types/features/marketplace";
import { Loader2, Tag } from "lucide-react";
import { useEffect, useRef } from "react";
import { ListingCard } from "./listing-card";

type Props = {
  listings: MarketplaceListing[];
  isLoading?: boolean; // true on the very first fetch (no data yet)
  isFetchingNextPage?: boolean; // true while loading the next page
  hasNextPage?: boolean; // false when all pages are loaded
  onLoadMore?: () => void; // called when sentinel enters the viewport
  onListingClick?: (listing: MarketplaceListing) => void;
};

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-neutral-100 overflow-hidden">
      <div className="aspect-square bg-neutral-100 animate-pulse" />
      <div className="p-2.5 space-y-1.5">
        <div className="h-3.5 w-16 bg-neutral-100 rounded animate-pulse" />
        <div className="h-3 w-28 bg-neutral-100 rounded animate-pulse" />
        <div className="h-2.5 w-20 bg-neutral-100 rounded animate-pulse" />
      </div>
    </div>
  );
}

export function MarketplaceGrid({
  listings,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  onLoadMore,
  onListingClick,
}: Props) {
  // ── Infinite scroll sentinel ─────────────────────────────────────────────────
  // A zero-height div placed after the last card. When it enters the viewport,
  // IntersectionObserver fires and we call onLoadMore() to fetch the next page.
  // This is more performant than a scroll event listener.
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !onLoadMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Only trigger when sentinel is actually visible and there is more to load
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          onLoadMore();
        }
      },
      {
        // Start loading a little before the user hits the absolute bottom
        rootMargin: "100px",
      },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, onLoadMore]);

  // ── Initial loading skeleton ──────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5">
        {Array.from({ length: 20 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  // ── Empty state ───────────────────────────────────────────────────────────────
  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Tag className="w-10 h-10 text-neutral-200 mb-3" />
        <p className="text-[13px] font-medium text-neutral-500">
          No listings found
        </p>
        <p className="text-[12px] text-neutral-400 mt-1">
          Try adjusting your filters or check back later.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5">
        {listings.map((listing) => (
          <ListingCard
            key={listing._id}
            listing={listing}
            onClick={() => onListingClick?.(listing)}
          />
        ))}

        {/* Skeleton cards appended during next-page fetch to maintain grid layout */}
        {isFetchingNextPage &&
          Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={`next-${i}`} />
          ))}
      </div>

      {/* Sentinel div — IntersectionObserver watches this to trigger next page load.
          Rendered even when isFetchingNextPage so the observer stays mounted. */}
      <div ref={sentinelRef} className="h-1 w-full mt-4" aria-hidden />

      {/* End of results label — only shown when all pages are exhausted */}
      {!hasNextPage && listings.length > 0 && (
        <p className="text-center text-[11.5px] text-neutral-400 py-6">
          You have seen all listings
        </p>
      )}

      {/* Spinner shown below the grid while next page is in flight */}
      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />
        </div>
      )}
    </>
  );
}
