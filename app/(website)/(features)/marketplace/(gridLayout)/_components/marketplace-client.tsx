"use client";

/**
 * MarketplaceClient — CLIENT COMPONENT
 *
 * Interactive shell for the marketplace feature. Owns all client-side state:
 * active category, search query, sort order, open dialogs, and view mode.
 *
 * Data flow:
 *  - accessToken    → from page.tsx (server-read from next-auth session)
 *  - meta           → useGetMarketplaceMeta()  (categories, conditions, etc.)
 *  - listings       → useBrowseListings()      (infinite scroll, paginated)
 *
 * Component tree:
 *
 *  page.tsx (Server)
 *    └── MarketplaceClient (Client) ← you are here
 *          ├── MarketplaceSidebar
 *          ├── MarketplaceGrid        (renders infinite scroll sentinel)
 *          ├── MyListingsPanel
 *          ├── CreateListingDialog
 *          └── EditListingDialog
 */

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBrowseListings } from "@/hooks/features/marketplace/api/use-browse-listing";
import { useGetMarketplaceMeta } from "@/hooks/features/marketplace/api/use-get-marketplace-meta";
import { cn } from "@/lib/utils";
import type {
  ListingStatus,
  MarketplaceListing,
  SortBy,
} from "@/types/features/marketplace";
import {
  ArrowLeft,
  Menu,
  Plus,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { EditListingDialog } from "./edit-listing-dialog";
import { MarketplaceGrid } from "./marketplace-grid";
import { MarketplaceSidebar } from "./marketplace-sidebar";
import { MyListingsPanel } from "./my-listings-panel";

// ─── Props ────────────────────────────────────────────────────────────────────

type Props = {
  /** JWT access token — read from next-auth session in page.tsx (server-side). */
  accessToken: string;
  /** Pre-selected category from URL ?category= query param. */
  initialCategory: string | null;
};

// ─── Component ────────────────────────────────────────────────────────────────

export function MarketplaceClient({ accessToken, initialCategory }: Props) {
  const router = useRouter();
  // ── Meta ─────────────────────────────────────────────────────────────────────
  // Cached for 10 minutes — used to populate Select dropdowns in dialogs
  // and to render the category strip.
  const { data: metaData } = useGetMarketplaceMeta();
  const meta = metaData?.data;

  // ── View ─────────────────────────────────────────────────────────────────────
  const [view, setView] = useState<"browse" | "my-listings">("browse");

  // ── Filter state ─────────────────────────────────────────────────────────────
  const [activeCategory, setActiveCategory] = useState<string | null>(
    initialCategory,
  );
  const [activeStatus, setActiveStatus] = useState<ListingStatus | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>("recent");

  // Raw search input value (updates on every keystroke)
  const [searchInput, setSearchInput] = useState("");
  // Debounced search query — only sent to the API after 400 ms of no typing.
  // Prevents hammering the endpoint on every keypress.
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // ── Browse listings (infinite scroll) ────────────────────────────────────────
  // queryKey includes all filter params — changing any of them resets to page 1
  // automatically because React Query treats the new key as a fresh query.
  const {
    data: browseData,
    isLoading: isListingsLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useBrowseListings({
    q: debouncedSearch || undefined,
    category: activeCategory || undefined,
    sortBy,
    limit: 20,
  });

  // Flatten all pages into a single array for the grid.
  // browseData.pages is an array of BrowseListingsPage — one per fetched page.
  const listings: MarketplaceListing[] =
    browseData?.pages.flatMap((page) => page.data) ?? [];

  // ── Load more handler ─────────────────────────────────────────────────────────
  // Passed to MarketplaceGrid → forwarded to the IntersectionObserver sentinel.
  // useCallback prevents the effect inside MarketplaceGrid from re-running on
  // every render when nothing actually changed.
  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // ── Dialog state ─────────────────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setCreateOpen] = useState(false);
  const [editListing, setEditListing] = useState<MarketplaceListing | null>(
    null,
  );

  // ── Mobile sidebar ────────────────────────────────────────────────────────────
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // ── Handlers ──────────────────────────────────────────────────────────────────

  function handleCategoryChange(cat: string | null) {
    setActiveCategory(cat);
    setView("browse");
    setMobileSidebarOpen(false);
  }

  function handleCreateClick() {
    setCreateOpen(true);
    setMobileSidebarOpen(false);
  }

  function handleMyListingsClick() {
    setView("my-listings");
    setMobileSidebarOpen(false);
  }

  function handleMessagesClick() {
    setMobileSidebarOpen(false);
    router.push("/marketplace/messages");
  }

  function handleBrowseClick() {
    setView("browse");
    setMobileSidebarOpen(false);
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-full min-h-screen bg-white">
      {/* ── Mobile sidebar backdrop ──────────────────────────────────────────── */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ──────────────────────────────────────────────────────────── */}
      {/* Mobile: fixed drawer sliding in from left. md+: static column.        */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-60 bg-white border-r border-neutral-100 flex flex-col transition-transform duration-200",
          "md:static md:translate-x-0 md:w-auto md:z-auto md:border-0 md:bg-transparent",
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 md:hidden">
          <span className="text-[13px] font-semibold text-neutral-800">
            Marketplace
          </span>
          <button onClick={() => setMobileSidebarOpen(false)}>
            <X className="w-4 h-4 text-neutral-500" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <MarketplaceSidebar
            activeNavItem={view}
            activeCategory={activeCategory}
            onCategoryChange={handleCategoryChange}
            activeStatus={activeStatus}
            onStatusChange={setActiveStatus}
            onBrowseClick={handleBrowseClick}
            onCreateClick={handleCreateClick}
            onMyListingsClick={handleMyListingsClick}
            onMessagesClick={handleMessagesClick}
          />
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────────────────────── */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* ── Sticky top bar ───────────────────────────────────────────────── */}
        <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-neutral-100 px-4 py-2.5">
          <div className="flex items-center gap-2">
            {/* Hamburger — mobile only */}
            <button
              className="md:hidden p-1.5 rounded-md hover:bg-neutral-100"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <Menu className="w-4 h-4 text-neutral-600" />
            </button>

            {/* Back — my-listings view only */}
            {view === "my-listings" && (
              <button
                onClick={() => setView("browse")}
                className="p-1.5 rounded-md hover:bg-neutral-100 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 text-neutral-600" />
              </button>
            )}

            {/* Search input — browse view only.
                Writes to searchInput; debouncedSearch drives the API query. */}
            {view === "browse" && (
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                <Input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search marketplace..."
                  className="h-8 pl-8 text-[12.5px] bg-neutral-50 border-neutral-200"
                />
                {/* Clear button — only shown when there is text */}
                {searchInput && (
                  <button
                    onClick={() => {
                      setSearchInput("");
                      setDebouncedSearch("");
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                  >
                    <X className="w-3 h-3 text-neutral-400 hover:text-neutral-600" />
                  </button>
                )}
              </div>
            )}

            {/* Browse toolbar: active category pill + sort + create CTA */}
            {view === "browse" && (
              <div className="flex items-center gap-1.5 ml-auto">
                {/* Active category pill — tap X to clear */}
                {activeCategory && (
                  <button
                    onClick={() => setActiveCategory(null)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[11.5px] font-medium border border-blue-100 hover:bg-blue-100 transition-colors"
                  >
                    {activeCategory}
                    <X className="w-3 h-3" />
                  </button>
                )}

                {/* Sort dropdown.
                    Changing this updates sortBy state → new queryKey → React Query
                    resets to page 1 and re-fetches automatically. */}
                <Select
                  value={sortBy}
                  onValueChange={(v) => setSortBy(v as SortBy)}
                >
                  <SelectTrigger className="h-8 w-27.5 text-[12px] bg-neutral-50 border-neutral-200">
                    <SlidersHorizontal className="w-3 h-3 mr-1 shrink-0" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent" className="text-[12px]">
                      Newest
                    </SelectItem>
                    <SelectItem value="price_asc" className="text-[12px]">
                      Price: Low
                    </SelectItem>
                    <SelectItem value="price_desc" className="text-[12px]">
                      Price: High
                    </SelectItem>
                  </SelectContent>
                </Select>

                {/* Create listing — hidden on mobile (FAB handles it) */}
                <Button
                  onClick={handleCreateClick}
                  size="sm"
                  className="h-8 text-[12px] gap-1.5 hidden sm:flex"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Create listing
                </Button>
              </div>
            )}

            {/* My listings title */}
            {view === "my-listings" && (
              <h1 className="text-[13px] font-semibold text-neutral-800 ml-1">
                Your listings
              </h1>
            )}
          </div>
        </div>

        {/* ── Content ──────────────────────────────────────────────────────── */}
        <div className="flex-1 px-4 py-4">
          {view === "browse" && (
            <>
              {/* Category strip — reads from meta fetched by useGetMarketplaceMeta */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-[12px] font-semibold text-neutral-700 uppercase tracking-wide">
                    Trending categories
                  </h2>
                  <button className="text-[11.5px] text-blue-600 hover:text-blue-700 font-medium">
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
                      <span className="max-w-16 text-center leading-tight">
                        {cat}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Section title — shows search query or active category or default */}
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[13px] font-semibold text-neutral-800">
                  {debouncedSearch
                    ? `Results for "${debouncedSearch}"`
                    : activeCategory
                      ? activeCategory
                      : "Today's picks"}
                </h2>
                {/* Total count — pulled from the first page's pagination */}
                {browseData?.pages[0]?.pagination.total !== undefined && (
                  <span className="text-[11.5px] text-neutral-400">
                    {browseData.pages[0].pagination.total.toLocaleString()}{" "}
                    listings
                  </span>
                )}
              </div>

              {/* Grid — passes all infinite scroll props down to the sentinel */}
              <MarketplaceGrid
                listings={listings}
                isLoading={isListingsLoading}
                isFetchingNextPage={isFetchingNextPage}
                hasNextPage={hasNextPage}
                onLoadMore={handleLoadMore}
                onListingClick={(l) => {
                  // TODO: navigate to /marketplace/listings/[id] or open detail sheet
                  console.log("Open listing:", l._id);
                }}
              />
            </>
          )}

          {view === "my-listings" && (
            <MyListingsPanel accessToken={accessToken} />
          )}
        </div>

        {/* ── Mobile FAB ───────────────────────────────────────────────────── */}
        <button
          onClick={handleCreateClick}
          className="fixed bottom-5 right-5 sm:hidden flex items-center gap-2 px-4 py-2.5 rounded-full bg-blue-600 text-white text-[12.5px] font-semibold shadow-lg hover:bg-blue-700 transition-colors z-30"
        >
          <Plus className="w-4 h-4" />
          Sell
        </button>
      </main>

      {/* ── Dialogs ──────────────────────────────────────────────────────────── */}
      {/* <CreateListingDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        meta={meta}
        accessToken={accessToken}
      /> */}

      <EditListingDialog
        open={!!editListing}
        onOpenChange={(v) => {
          if (!v) setEditListing(null);
        }}
        listing={editListing}
        meta={meta}
        accessToken={accessToken}
      />
    </div>
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
