"use client";

/**
 * MarketplaceClient — CLIENT COMPONENT  (Browse page only)
 *
 * This is now the content layer for /marketplace (the browse grid).
 * Layout chrome (sidebar, top bar, mobile FAB) has moved to:
 *
 *   layout.tsx                          ← persistent shell
 *   _components/marketplace-shell.tsx  ← sidebar + top bar
 *   _components/marketplace-layout-context.tsx ← shared state
 *
 * This component only owns:
 *   - local search text state (lifted to the shell via context or props)
 *   - sort state
 *   - the listing grid and category strip
 *
 * Component tree (simplified):
 *
 *  layout.tsx (Server)
 *    └── MarketplaceLayoutProvider (Client context)
 *          └── MarketplaceShell (Client — sidebar + top bar)
 *                └── page.tsx (Server)
 *                      └── MarketplaceClient (Client) ← you are here
 *                            ├── Category strip
 *                            ├── MarketplaceGrid
 *                            └── EditListingDialog
 */

import { useGetMarketplaceMeta } from "@/hooks/features/marketplace/api/use-get-marketplace-meta";
import { cn } from "@/lib/utils";
import type {
  MarketplaceListing,
  MarketplaceMeta,
} from "@/types/features/marketplace";
import { useState } from "react";
import { EditListingDialog } from "./edit-listing-dialog";
import { MarketplaceGrid } from "./marketplace-grid";
import { useMarketplaceLayout } from "./marketplace-layout-context";

// ─── Mock browse listings ─────────────────────────────────────────────────────
//
// TODO: Replace with a real useQuery hook once GET /marketplace/listings is ready.
// Query params: ?category=&page=&limit=&sort=

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

  /** JWT access token for mutation hooks. */
  accessToken: string;
};

// ─── Component ────────────────────────────────────────────────────────────────

export function MarketplaceClient({ meta, accessToken }: Props) {
  // ── Consume layout-level state ────────────────────────────────────────────
  // activeCategory lives in the layout context so the sidebar stays in sync
  // even when this component remounts.
  const { activeCategory, setActiveCategory } = useMarketplaceLayout();

  // ── Local state ───────────────────────────────────────────────────────────
  const [search] = useState("");
  const [editListing, setEditListing] = useState<MarketplaceListing | null>(
    null,
  );

  const { data } = useGetMarketplaceMeta();

  // ── Derived listing list ──────────────────────────────────────────────────
  // TODO: replace with server-driven pagination once the browse endpoint exists.
  const filteredListings = MOCK_LISTINGS.filter((l) => {
    if (activeCategory && l.category !== activeCategory) return false;
    if (search && !l.title.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Horizontal category strip ───────────────────────────────────── */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[12px] font-semibold text-neutral-700 uppercase tracking-wide">
            Trending categories
          </h2>
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
              <span className="max-w-16 text-center leading-tight">{cat}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Grid section header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[13px] font-semibold text-neutral-800">
          {activeCategory ?? "Today's picks"}
        </h2>
        <button className="text-[11.5px] text-blue-600 hover:text-blue-700 font-medium">
          See all
        </button>
      </div>

      {/* ── Listing grid ────────────────────────────────────────────────── */}
      {/* TODO: pass isLoading={true} while the real query is in flight */}
      <MarketplaceGrid
        listings={filteredListings}
        onListingClick={(l) => {
          // TODO: navigate to /marketplace/listings/[id] or open a detail sheet
          console.log("Open listing:", l._id);
        }}
      />

      {/* ── Edit listing dialog ─────────────────────────────────────────── */}
      <EditListingDialog
        open={!!editListing}
        onOpenChange={(v) => {
          if (!v) setEditListing(null);
        }}
        listing={editListing}
        meta={meta ?? undefined}
        accessToken={accessToken}
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
