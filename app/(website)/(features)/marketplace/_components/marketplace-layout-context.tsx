"use client";

/**
 * MarketplaceLayoutContext
 *
 * Shared client-side state that lives at the layout level so every
 * marketplace route (browse, create, my-listing, detail, …) can:
 *
 *  - read / set the active category
 *  - open / close the mobile sidebar drawer
 *
 * Usage
 * ─────
 *  // In any child component:
 *  const { activeCategory, setActiveCategory } = useMarketplaceLayout();
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

interface MarketplaceLayoutState {
  /** Currently selected category filter — null means "all". */
  activeCategory: string | null;
  setActiveCategory: (cat: string | null) => void;

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
  /** Seed the category from the URL search param (passed down from layout.tsx). */
  initialCategory?: string | null;
}

export function MarketplaceLayoutProvider({
  children,
  initialCategory = null,
}: MarketplaceLayoutProviderProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(
    initialCategory,
  );
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
      mobileSidebarOpen,
      openMobileSidebar,
      closeMobileSidebar,
      toggleMobileSidebar,
    }),
    [
      activeCategory,
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
