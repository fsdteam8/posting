"use client";

/**
 * MarketplaceShell — CLIENT COMPONENT
 *
 * Renders the persistent two-column shell that wraps every marketplace route.
 * Active nav state is derived from `usePathname()` so the sidebar highlights
 * the correct item on every route automatically.
 *
 * Search and sort are read/written directly from MarketplaceLayoutContext so
 * MarketplaceBrowsePage reacts to them without any prop threading.
 *
 *   /marketplace            → "Browse All" active
 *   /marketplace/my-listing → "Your Listings" active
 *   /marketplace/create     → "Create New Listing" active
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
import { cn } from "@/lib/utils";
import { Menu, Plus, Search, SlidersHorizontal, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import {
  useMarketplaceLayout,
  type MarketplaceSortValue,
} from "./marketplace-layout-context";
import { MarketplaceSidebar } from "./marketplace-sidebar";

// ─── Types ────────────────────────────────────────────────────────────────────

export type MarketplaceNavItem = "browse" | "my-listings" | "create";

interface MarketplaceShellProps {
  children: ReactNode;
  /** Hide the search input — useful on create / detail pages. */
  showSearch?: boolean;
  /** Hide the sort dropdown — useful on non-browse pages. */
  showSort?: boolean;
  /** Hide the "Create listing" button and mobile FAB. */
  showCreateButton?: boolean;
  /** Optional extra controls injected into the right side of the top bar. */
  topBarExtra?: ReactNode;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Maps the current URL pathname to one of the three sidebar nav items.
 * Derived fresh on every render via usePathname() — no stale state possible.
 */
function getActiveNavItem(pathname: string): MarketplaceNavItem {
  if (pathname === "/marketplace/my-listing") return "my-listings";
  if (pathname === "/marketplace/create") return "create";
  return "browse";
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MarketplaceShell({
  children,
  showSearch = true,
  showSort = true,
  showCreateButton = true,
  topBarExtra,
}: MarketplaceShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const activeNavItem = getActiveNavItem(pathname);

  // ── Context ─────────────────────────────────────────────────────────────────
  // All shared state lives here. The shell WRITES search/sort/category;
  // MarketplaceBrowsePage READS them. Single source of truth, no prop drilling.
  const {
    activeCategory,
    setActiveCategory,
    searchValue,
    setSearchValue,
    sortValue,
    setSortValue,
    mobileSidebarOpen,
    openMobileSidebar,
    closeMobileSidebar,
  } = useMarketplaceLayout();

  // ── Navigation ───────────────────────────────────────────────────────────────

  function handleBrowseClick() {
    closeMobileSidebar();
    router.push("/marketplace");
  }

  function handleMyListingsClick() {
    closeMobileSidebar();
    router.push("/marketplace/my-listing");
  }

  function handleCreateClick() {
    closeMobileSidebar();
    router.push("/marketplace/create");
  }

  function handleCategoryChange(cat: string | null) {
    setActiveCategory(cat);
    closeMobileSidebar();
  }

  // ── Search clear ─────────────────────────────────────────────────────────────
  // Clears the context value so the browse page's debounce effect fires with ""
  // and the query resets to all listings.
  function handleSearchClear() {
    setSearchValue("");
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-full min-h-screen bg-white">
      {/* ── Mobile sidebar backdrop ──────────────────────────────────────────── */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 md:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      {/* ── Sidebar ──────────────────────────────────────────────────────────── */}
      {/* Mobile: fixed drawer. md+: static column.                              */}
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
          <button onClick={closeMobileSidebar}>
            <X className="w-4 h-4 text-neutral-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <MarketplaceSidebar
            activeNavItem={activeNavItem}
            activeCategory={activeCategory}
            onCategoryChange={handleCategoryChange}
            onBrowseClick={handleBrowseClick}
            onCreateClick={handleCreateClick}
            onMyListingsClick={handleMyListingsClick}
          />
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────────────────────── */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* ── Sticky top bar — browse page only ───────────────────────────── */}
        {pathname === "/marketplace" && (
          <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-neutral-100 px-4 py-2.5">
            <div className="flex items-center gap-2">
              {/* Hamburger — mobile only */}
              <button
                className="md:hidden p-1.5 rounded-md hover:bg-neutral-100"
                onClick={openMobileSidebar}
              >
                <Menu className="w-4 h-4 text-neutral-600" />
              </button>

              {/* Search input — writes directly to context.
                  MarketplaceBrowsePage debounces the value before the API call. */}
              {showSearch && (
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                  <Input
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Search marketplace..."
                    className="h-8 pl-8 pr-7 text-[12.5px] bg-neutral-50 border-neutral-200"
                  />
                  {/* Clear button — only visible when there is text */}
                  {searchValue && (
                    <button
                      onClick={handleSearchClear}
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                    >
                      <X className="w-3 h-3 text-neutral-400 hover:text-neutral-600 transition-colors" />
                    </button>
                  )}
                </div>
              )}

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

                {topBarExtra}

                {/* Sort dropdown — writes directly to context.
                    The browse page reads sortValue and maps it to the API param. */}
                {showSort && (
                  <Select
                    value={sortValue}
                    onValueChange={(v) =>
                      setSortValue(v as MarketplaceSortValue)
                    }
                  >
                    <SelectTrigger className="h-8 w-27.5 text-[12px] bg-neutral-50 border-neutral-200">
                      <SlidersHorizontal className="w-3 h-3 mr-1 shrink-0" />
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
                )}

                {/* Create listing — hidden on mobile (FAB handles it) */}
                {showCreateButton && (
                  <Button
                    onClick={handleCreateClick}
                    size="sm"
                    className="h-8 text-[12px] gap-1.5 hidden sm:flex"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Create listing
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Page content ─────────────────────────────────────────────────── */}
        <div className="flex-1 px-4 py-4">{children}</div>

        {/* ── Mobile FAB ───────────────────────────────────────────────────── */}
        {showCreateButton && (
          <button
            onClick={handleCreateClick}
            className="fixed bottom-5 right-5 sm:hidden flex items-center gap-2 px-4 py-2.5 rounded-full bg-blue-600 text-white text-[12.5px] font-semibold shadow-lg hover:bg-blue-700 transition-colors z-30"
          >
            <Plus className="w-4 h-4" />
            Sell
          </button>
        )}
      </main>
    </div>
  );
}
