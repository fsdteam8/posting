"use client";

/**
 * MarketplaceSidebar
 *
 * Static nav column on md+, content of the mobile drawer on smaller screens.
 *
 * Active state
 * ────────────
 * The `activeNavItem` prop drives which nav button is highlighted.
 * It is always derived from `usePathname()` in MarketplaceShell —
 * never from local component state — so it stays in sync with the URL
 * even on browser back/forward navigation.
 *
 *   activeNavItem === "browse"      → Browse All highlighted
 *   activeNavItem === "my-listings" → Your Listings highlighted
 *   activeNavItem === "create"      → Create New Listing highlighted
 */

import { useGetMarketplaceMeta } from "@/hooks/features/marketplace/api/use-get-marketplace-meta";
import { cn } from "@/lib/utils";
import type { ListingStatus } from "@/types/features/marketplace";
import { Grid2X2, List, PlusCircle, Store, Tag } from "lucide-react";
import { usePathname } from "next/navigation";
import type { MarketplaceNavItem } from "./marketplace-shell";

// ─── Props ────────────────────────────────────────────────────────────────────

interface MarketplaceSidebarProps {
  // ── Route-aware active nav ──────────────────────────────────────────────────
  /** Which top-level nav item is currently active. Derived from usePathname(). */
  activeNavItem: MarketplaceNavItem;

  // ── Category filter ─────────────────────────────────────────────────────────
  activeCategory: string | null;
  onCategoryChange: (cat: string | null) => void;

  // ── Nav callbacks ───────────────────────────────────────────────────────────
  onBrowseClick: () => void;
  onCreateClick: () => void;
  onMyListingsClick: () => void;

  // ── Status filter (kept for API compatibility, used on my-listings page) ───
  activeStatus?: ListingStatus | null;
  onStatusChange?: (status: ListingStatus | null) => void;
}

// ─── Sidebar nav item helper ──────────────────────────────────────────────────

interface NavButtonProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

function NavButton({ icon, label, active, onClick }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12.5px] font-medium transition-colors text-left",
        active
          ? "bg-blue-50 text-blue-700"
          : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-800",
      )}
    >
      <span
        className={cn(
          "w-4 h-4 shrink-0",
          active ? "text-blue-600" : "text-neutral-400",
        )}
      >
        {icon}
      </span>
      {label}
    </button>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MarketplaceSidebar({
  activeNavItem,
  activeCategory,
  onCategoryChange,
  onBrowseClick,
  onCreateClick,
  onMyListingsClick,
}: MarketplaceSidebarProps) {
  const { data } = useGetMarketplaceMeta();
  const categories: string[] = data?.data?.categories ?? [];
  const pathname = usePathname();

  return (
    <div className="w-52 py-3 px-2 flex flex-col gap-4">
      {/* ── Top nav ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-0.5">
        <p className="px-3 mb-1 text-[10.5px] font-semibold text-neutral-400 uppercase tracking-wider">
          Marketplace
        </p>

        <NavButton
          icon={<Grid2X2 className="w-4 h-4" />}
          label="Browse All"
          // Active only on the exact /marketplace route
          active={activeNavItem === "browse"}
          onClick={onBrowseClick}
        />

        <NavButton
          icon={<List className="w-4 h-4" />}
          label="Your Listings"
          // Active only on /marketplace/my-listing
          active={activeNavItem === "my-listings"}
          onClick={onMyListingsClick}
        />

        <NavButton
          icon={<PlusCircle className="w-4 h-4" />}
          label="Create New Listing"
          // Active only on /marketplace/create
          active={activeNavItem === "create"}
          onClick={onCreateClick}
        />
      </div>

      {/* ── Category filter (only relevant on the browse route) ──────────── */}
      {categories.length > 0 && pathname === "/marketplace" && (
        <div className="flex flex-col gap-0.5">
          <p className="px-3 mb-1 text-[10.5px] font-semibold text-neutral-400 uppercase tracking-wider">
            Categories
          </p>

          {/* "All" clears the category filter */}
          <button
            onClick={() => onCategoryChange(null)}
            className={cn(
              "w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[12px] transition-colors text-left",
              activeCategory === null
                ? "bg-blue-50 text-blue-700 font-medium"
                : "text-neutral-600 hover:bg-neutral-100",
            )}
          >
            <Store className="w-3.5 h-3.5 shrink-0" />
            All categories
          </button>

          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[12px] transition-colors text-left",
                activeCategory === cat
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-neutral-600 hover:bg-neutral-100",
              )}
            >
              <Tag className="w-3.5 h-3.5 shrink-0 opacity-60" />
              <span className="truncate">{cat}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
