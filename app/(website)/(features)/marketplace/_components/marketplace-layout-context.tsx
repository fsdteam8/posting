"use client";

/**
 * MarketplaceLayoutContext
 *
 * Shared client-side state that lives at the layout level so every
 * marketplace route (browse, create, my-listing, detail, …) can:
 *
 *  - read / set the active category filter
 *  - read / set the search input value      ← new
 *  - read / set the sort order              ← new
 *  - open / close the mobile sidebar drawer
 *
 * Usage
 * ─────
 *  const {
 *    activeCategory, setActiveCategory,
 *    searchValue, setSearchValue,
 *    sortValue, setSortValue,
 *  } = useMarketplaceLayout();
 */

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type MarketplaceSortValue = "newest" | "price_asc" | "price_desc";

interface MarketplaceLayoutState {
  /** Currently selected category filter — null means "all". */
  activeCategory: string | null;
  setActiveCategory: (cat: string | null) => void;

  /** Controlled value of the search Input in MarketplaceShell.
   *  The browse page debounces this before passing it to the API. */
  searchValue: string;
  setSearchValue: (value: string) => void;

  /** Current sort selection from the Sort dropdown in MarketplaceShell. */
  sortValue: MarketplaceSortValue;
  setSortValue: (value: MarketplaceSortValue) => void;

  /** Whether the mobile sidebar drawer is open. */
  mobileSidebarOpen: boolean;
  openMobileSidebar: () => void;
  closeMobileSidebar: () => void;
  toggleMobileSidebar: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const MarketplaceLayoutContext = createContext<MarketplaceLayoutState | null>(
  null,
);

// ─── Provider ─────────────────────────────────────────────────────────────────

interface MarketplaceLayoutProviderProps {
  children: ReactNode;
  /** Seed the category from the URL ?category= param (passed from layout.tsx). */
  initialCategory?: string | null;
}

export function MarketplaceLayoutProvider({
  children,
  initialCategory = null,
}: MarketplaceLayoutProviderProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(
    initialCategory,
  );
  const [searchValue, setSearchValue] = useState("");
  const [sortValue, setSortValue] = useState<MarketplaceSortValue>("newest");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const openMobileSidebar = useCallback(() => setMobileSidebarOpen(true), []);
  const closeMobileSidebar = useCallback(() => setMobileSidebarOpen(false), []);
  const toggleMobileSidebar = useCallback(
    () => setMobileSidebarOpen((v) => !v),
    [],
  );

  const value = useMemo<MarketplaceLayoutState>(
    () => ({
      activeCategory,
      setActiveCategory,
      searchValue,
      setSearchValue,
      sortValue,
      setSortValue,
      mobileSidebarOpen,
      openMobileSidebar,
      closeMobileSidebar,
      toggleMobileSidebar,
    }),
    [
      activeCategory,
      searchValue,
      sortValue,
      mobileSidebarOpen,
      openMobileSidebar,
      closeMobileSidebar,
      toggleMobileSidebar,
    ],
  );

  return (
    <MarketplaceLayoutContext.Provider value={value}>
      {children}
    </MarketplaceLayoutContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useMarketplaceLayout(): MarketplaceLayoutState {
  const ctx = useContext(MarketplaceLayoutContext);
  if (!ctx) {
    throw new Error(
      "useMarketplaceLayout must be used inside <MarketplaceLayoutProvider>",
    );
  }
  return ctx;
}
