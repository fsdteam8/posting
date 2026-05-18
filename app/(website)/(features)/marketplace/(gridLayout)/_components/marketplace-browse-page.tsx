"use client";

/**
 * MarketplaceBrowsePage — CLIENT COMPONENT
 *
 * Renders ONLY the browse content: category strip, section header, and the
 * infinite-scroll listing grid. No sidebar, no shell, no dialogs wrapper —
 * those all live in layout.tsx via MarketplaceShell.
 *
 * State that is shared with the shell (search input, sort, active category)
 * is read from MarketplaceLayoutContext so the top bar controls in
 * MarketplaceShell drive this component's query automatically.
 *
 * Data flow:
 *   layout.tsx (Server)
 *     └── MarketplaceLayoutProvider  ← holds shared filter state
 *           └── MarketplaceShell     ← sidebar + top bar (search/sort live here)
 *                 └── page.tsx children
 *                       └── MarketplaceBrowsePage (← you are here)
 *                             └── MarketplaceGrid  ← infinite scroll sentinel
 */

import { useBrowseListings } from "@/hooks/features/marketplace/api/use-browse-listing";
import { useGetMarketplaceMeta } from "@/hooks/features/marketplace/api/use-get-marketplace-meta";
import { cn } from "@/lib/utils";
import type { MarketplaceListing, SortBy } from "@/types/features/marketplace";
import { useRouter } from "nextjs-toploader/app";
import { useCallback, useEffect, useState } from "react";
import { MarketplaceGrid } from "./marketplace-grid";
import { useMarketplaceLayout } from "./marketplace-layout-context";

// ─── Props ────────────────────────────────────────────────────────────────────

type Props = {
  /** JWT access token — passed down from the server page component. */
  accessToken: string;
};

// ─── Component ────────────────────────────────────────────────────────────────

export function MarketplaceBrowsePage({}: Props) {
  // ── Shared layout state ───────────────────────────────────────────────────
  // searchValue, sortValue, and activeCategory are owned by
  // MarketplaceLayoutContext so the top bar in MarketplaceShell can control
  // them while this component reacts to the changes.
  const { activeCategory, setActiveCategory, searchValue, sortValue } =
    useMarketplaceLayout();

  // ── Meta ──────────────────────────────────────────────────────────────────
  // Cached for 10 min — used to render the category strip.
  const { data: metaData } = useGetMarketplaceMeta();
  const meta = metaData?.data;

  // ── Debounced search ──────────────────────────────────────────────────────
  // searchValue in context updates on every keystroke (controlled by the
  // Input in MarketplaceShell). We debounce it here before hitting the API
  // to avoid a request on every keypress.
  const [debouncedSearch, setDebouncedSearch] = useState(searchValue);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchValue), 400);
    return () => clearTimeout(timer);
  }, [searchValue]);

  // ── Browse listings — infinite scroll ────────────────────────────────────
  // queryKey includes all three filter values. Changing any of them resets
  // to page 1 automatically — React Query treats the new key as a fresh query.
  const {
    data: browseData,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useBrowseListings({
    q: debouncedSearch || undefined,
    category: activeCategory || undefined,
    // Map the shell's sort string to the API's sortBy param.
    // Shell uses "newest" | "price_asc" | "price_desc" —
    // API expects "recent" | "price_asc" | "price_desc".
    sortBy: (sortValue === "newest" ? "recent" : sortValue) as SortBy,
    limit: 20,
  });

  const router = useRouter();

  // Flatten all fetched pages into one array for the grid
  const listings: MarketplaceListing[] =
    browseData?.pages.flatMap((page) => page.data) ?? [];

  // ── Load-more callback ────────────────────────────────────────────────────
  // Passed to MarketplaceGrid → IntersectionObserver sentinel calls this
  // when it enters the viewport. useCallback prevents the effect inside
  // MarketplaceGrid from re-running on every render.
  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Category strip ─────────────────────────────────────────────────── */}
      {/* Horizontally scrollable row of category pills at the top of the page.
          Clicking a pill sets activeCategory in context, which updates the
          query key and re-fetches from page 1.                                */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[12px] font-semibold text-neutral-700 uppercase tracking-wide">
            Trending categories
          </h2>
          <button
            onClick={() => setActiveCategory(null)}
            className="text-[11.5px] text-blue-600 hover:text-blue-700 font-medium"
          >
            See all
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {(meta?.categories ?? []).slice(0, 10).map((cat) => (
            <button
              key={cat}
              onClick={() =>
                setActiveCategory(activeCategory === cat ? null : cat)
              }
              className={cn(
                "shrink-0 flex flex-col items-center gap-1.5 px-3 py-2 rounded-xl border text-[11px] font-medium transition-all",
                activeCategory === cat
                  ? "border-blue-200 bg-blue-50 text-blue-700"
                  : "border-neutral-100 bg-white text-neutral-600 hover:border-neutral-200 hover:bg-neutral-50",
              )}
            >
              <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-base">
                {getCategoryEmoji(cat)}
              </div>
              <span className="max-w-16 text-center leading-tight">{cat}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Section title + total count ─────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[13px] font-semibold text-neutral-800">
          {debouncedSearch
            ? `Results for "${debouncedSearch}"`
            : activeCategory
              ? activeCategory
              : "Today's picks"}
        </h2>

        {/* Total pulled from first page — only shown once data has arrived */}
        {browseData?.pages[0]?.pagination.total !== undefined && (
          <span className="text-[11.5px] text-neutral-400">
            {browseData.pages[0].pagination.total.toLocaleString()} listings
          </span>
        )}
      </div>

      {/* ── Listing grid ────────────────────────────────────────────────────── */}
      <MarketplaceGrid
        listings={listings}
        isLoading={isLoading}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
        onLoadMore={handleLoadMore}
        onListingClick={(l) => {
          router.push(`/marketplace/listing/${l._id}`);
        }}
      />
    </>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCategoryEmoji(cat: string): string {
  const map: Record<string, string> = {
    Vehicles: "🚗",
    "Property Rentals": "🏠",
    Apparel: "👕",
    Classifieds: "📋",
    Electronics: "💻",
    Entertainment: "🎬",
    Family: "👨‍👩‍👧",
    "Free Stuff": "🎁",
    "Garden & Outdoor": "🌿",
    Hobbies: "🎨",
    "Home Goods": "🛋️",
    "Home Improvement Supplies": "🔧",
    "Home Sales": "🏡",
    "Musical Instruments": "🎸",
    "Office Supplies": "📎",
    "Pet Supplies": "🐾",
    "Sporting Goods": "⚽",
    "Toys & Games": "🧸",
    "Buy and sell groups": "🤝",
  };
  return map[cat] ?? "📦";
}
