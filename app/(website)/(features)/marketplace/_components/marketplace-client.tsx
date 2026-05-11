"use client";

/**
 * MarketplaceClient — CLIENT COMPONENT
 *
 * This is the interactive shell for the marketplace feature. It receives
 * server-fetched data as props (meta, accessToken) and owns all client-side
 * state: active category, search query, open dialogs, view mode, etc.
 *
 * Component tree (simplified):
 *
 *  page.tsx (Server)
 *    └── MarketplaceClient (Client) ← you are here
 *          ├── MarketplaceSidebar
 *          ├── MarketplaceGrid
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
import { useGetMarketplaceMeta } from "@/hooks/features/marketplace/api/use-get-marketplace-meta";
import { cn } from "@/lib/utils";
import type {
  ListingStatus,
  MarketplaceListing,
  MarketplaceMeta,
} from "@/types/features/marketplace";
import {
  ArrowLeft,
  Menu,
  Plus,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useRouter } from "nextjs-toploader/app";
import { useState } from "react";
import { EditListingDialog } from "./edit-listing-dialog";
import { MarketplaceGrid } from "./marketplace-grid";
import { MarketplaceSidebar } from "./marketplace-sidebar";
import { MyListingsPanel } from "./my-listings-panel";

// ─── Mock browse listings ─────────────────────────────────────────────────────
//
// TODO: Replace this with a real useQuery hook once the browse/listings endpoint
// is available. The endpoint will likely be GET /marketplace/listings with
// query params: ?category=&page=&limit=&sort=
//
// Expected shape matches MarketplaceListing[] from @/types/marketplace

const MOCK_LISTINGS: MarketplaceListing[] = Array.from({ length: 24 }).map(
  (_, i) =>
    ({
      _id: `listing-${i}`,
      seller: "seller-1",
      title: [
        "Black T-Shirt",
        "iPhone 14 Pro",
        "Vintage Lamp",
        "Oak Desk",
        "Road Bike",
      ][i % 5],
      description: "Great condition item.",
      listingType: "item",
      category: [
        "Apparel",
        "Electronics",
        "Home Goods",
        "Home Goods",
        "Sporting Goods",
      ][i % 5],
      subcategory: "",
      condition: (["new", "like_new", "good", "fair", "used"] as const)[i % 5],
      price: [12, 799, 45, 240, 320][i % 5],
      currency: "USD",
      isNegotiable: true,
      quantity: 1,
      photos: [],
      deliveryOptions: ["local_pickup"],
      shippingEligible: false,
      listingStatus: "available",
      visibility: "public",
      hideFromFriends: false,
      location: {
        address: "",
        city: "Los Angeles",
        state: "CA",
        country: "USA",
        postalCode: "",
      },
      locationGeo: { type: "Point", coordinates: [-118.2437, 34.0522] },
      tags: [],
      attributes: {},
      saves: [],
      hiddenBy: [],
      viewsCount: 0,
      savesCount: 0,
      offersCount: 0,
      reportCount: 0,
      reports: [],
      soldTo: null,
      soldAt: null,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }) as MarketplaceListing,
);

// ─── Props ────────────────────────────────────────────────────────────────────

type Props = {
  /** Marketplace metadata fetched server-side (categories, conditions, etc.).
   *  null if the server fetch failed — UI degrades gracefully. */
  meta: MarketplaceMeta | null;

  /** JWT access token read from HTTP-only cookie on the server.
   *  Passed here so mutation hooks can attach it to API requests. */
  accessToken: string;

  /** Pre-selected category from the URL query param (?category=Electronics).
   *  Allows bookmarkable / shareable filtered URLs. */
  initialCategory: string | null;
};

// ─── Component ────────────────────────────────────────────────────────────────

export function MarketplaceClient({
  meta,
  accessToken,
  initialCategory,
}: Props) {
  // ── View state ──────────────────────────────────────────────────────────────
  // "browse"      → main grid of listings
  // "my-listings" → the current user's own listings with edit/delete
  const [view, setView] = useState<"browse" | "my-listings">("browse");

  // ── Filter state ────────────────────────────────────────────────────────────
  // Initialised from the URL query param passed down from the server component
  const [activeCategory, setActiveCategory] = useState<string | null>(
    initialCategory,
  );
  const [activeStatus, setActiveStatus] = useState<ListingStatus | null>(null);
  const [search, setSearch] = useState("");

  // ── Dialog state ────────────────────────────────────────────────────────────
  // editListing holds the full listing object while the edit dialog is open;
  // null means the dialog is closed.
  const [editListing, setEditListing] = useState<MarketplaceListing | null>(
    null,
  );

  // ── Mobile sidebar ──────────────────────────────────────────────────────────
  // The sidebar is a fixed drawer on mobile, static column on md+
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const router = useRouter();

  const { data } = useGetMarketplaceMeta();

  // ── Derived listing list ─────────────────────────────────────────────────────
  // TODO: replace with server-driven pagination once the browse endpoint exists.
  // For now we client-filter the mock data.
  const filteredListings = MOCK_LISTINGS.filter((l) => {
    if (activeCategory && l.category !== activeCategory) return false;
    if (search && !l.title.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  // ── Handlers ─────────────────────────────────────────────────────────────────

  function handleCategoryChange(cat: string | null) {
    setActiveCategory(cat);
    setView("browse");
    setMobileSidebarOpen(false);
  }

  function handleCreateClick() {
    setMobileSidebarOpen(false);
    router.push("/marketplace/create");
  }

  function handleMyListingsClick() {
    setView("my-listings");
    setMobileSidebarOpen(false);
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-full min-h-screen bg-white">
      {/* ── Mobile sidebar backdrop ─────────────────────────────────────────── */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      {/* On mobile: fixed full-height drawer that slides in from the left.
          On md+:   static flex column (no position tricks needed).           */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-60 bg-white border-r border-neutral-100 flex flex-col transition-transform duration-200",
          "md:static md:translate-x-0 md:w-auto md:z-auto md:border-0 md:bg-transparent",
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Mobile drawer header — hidden on desktop */}
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
            activeCategory={activeCategory}
            onCategoryChange={handleCategoryChange}
            activeStatus={activeStatus}
            onStatusChange={setActiveStatus}
            onCreateClick={handleCreateClick}
            onMyListingsClick={handleMyListingsClick}
          />
        </div>
      </div>

      {/* ── Main content ────────────────────────────────────────────────────── */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* ── Sticky top bar ──────────────────────────────────────────────── */}
        <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-neutral-100 px-4 py-2.5">
          <div className="flex items-center gap-2">
            {/* Hamburger — mobile only */}
            <button
              className="md:hidden p-1.5 rounded-md hover:bg-neutral-100"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <Menu className="w-4 h-4 text-neutral-600" />
            </button>

            {/* Back button — only visible in "my-listings" view */}
            {view === "my-listings" && (
              <button
                onClick={() => setView("browse")}
                className="p-1.5 rounded-md hover:bg-neutral-100 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 text-neutral-600" />
              </button>
            )}

            {/* Search input — browse view only */}
            {view === "browse" && (
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search marketplace..."
                  className="h-8 pl-8 text-[12.5px] bg-neutral-50 border-neutral-200"
                />
              </div>
            )}

            {/* Browse view toolbar: active filter pill + sort + create CTA */}
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

                {/* Sort dropdown — wire onChange to your listings query when ready */}
                <Select defaultValue="newest">
                  <SelectTrigger className="h-8 w-27.5 text-[12px] bg-neutral-50 border-neutral-200">
                    <SlidersHorizontal className="w-3 h-3 mr-1" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest" className="text-[12px]">
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

                {/* Create listing — hidden on mobile (FAB handles it there) */}
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

            {/* My listings view title */}
            {view === "my-listings" && (
              <h1 className="text-[13px] font-semibold text-neutral-800 ml-1">
                Your listings
              </h1>
            )}
          </div>
        </div>

        {/* ── Content area ────────────────────────────────────────────────── */}
        <div className="flex-1 px-4 py-4">
          {/* Browse view */}
          {view === "browse" && (
            <>
              {/* Horizontal scrollable category strip
                  meta is guaranteed non-null here because we slice defensively with ?? [] */}
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
                  {(data?.data?.categories ?? []).slice(0, 10).map((cat) => (
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

              {/* Grid section header */}
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[13px] font-semibold text-neutral-800">
                  {activeCategory ?? "Today's picks"}
                </h2>
                <button className="text-[11.5px] text-blue-600 hover:text-blue-700 font-medium">
                  See all
                </button>
              </div>

              {/* Listing grid
                  TODO: pass isLoading={true} while the real query is in flight */}
              <MarketplaceGrid
                listings={filteredListings}
                onListingClick={(l) => {
                  // TODO: navigate to /marketplace/listings/[id] or open a detail sheet
                  console.log("Open listing:", l._id);
                }}
              />
            </>
          )}

          {/* My listings view */}
          {view === "my-listings" && (
            <MyListingsPanel
              accessToken={accessToken}
              onEdit={(listing) => setEditListing(listing)}
            />
          )}
        </div>

        {/* ── Mobile FAB ──────────────────────────────────────────────────── */}
        {/* Only shown on small screens — replaces the header "Create listing" button */}
        <button
          onClick={handleCreateClick}
          className="fixed bottom-5 right-5 sm:hidden flex items-center gap-2 px-4 py-2.5 rounded-full bg-blue-600 text-white text-[12.5px] font-semibold shadow-lg hover:bg-blue-700 transition-colors z-30"
        >
          <Plus className="w-4 h-4" />
          Sell
        </button>
      </main>

      {/* ── Create listing dialog (3-step wizard) ───────────────────────────── */}
      {/* <CreateListingDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        meta={meta ?? undefined}
        accessToken={accessToken}
      /> */}

      {/* ── Edit listing dialog ──────────────────────────────────────────────── */}
      {/* Controlled by editListing state — null = closed, object = open */}
      <EditListingDialog
        open={!!editListing}
        onOpenChange={(v) => {
          if (!v) setEditListing(null);
        }}
        listing={editListing}
        meta={meta ?? undefined}
        accessToken={accessToken}
      />
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Maps a category name to a representative emoji for the category strip. */
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
