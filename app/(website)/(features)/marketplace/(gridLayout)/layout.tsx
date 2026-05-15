/**
 * app/marketplace/layout.tsx — SERVER COMPONENT
 *
 * This layout wraps every route under /marketplace:
 *
 *   /marketplace              → page.tsx  (browse grid)
 *   /marketplace/create       → page.tsx  (create wizard)
 *   /marketplace/my-listing   → page.tsx  (seller's listings)
 *   /marketplace/[id]         → page.tsx  (listing detail)
 *
 * Responsibilities
 * ────────────────
 *  ✓ Reads the ?category search param so the sidebar pre-selects on load
 *  ✓ Provides MarketplaceLayoutProvider (client context) to all children
 *  ✓ Renders MarketplaceShell — the persistent sidebar + top bar chrome
 *  ✗ Does NOT fetch listings — each page owns its own data
 *
 * Why a layout instead of a shared client component?
 * ──────────────────────────────────────────────────
 * Next.js layouts persist across navigations within the same segment,
 * so the sidebar does not remount when the user moves between
 * /marketplace → /marketplace/create → /marketplace/my-listing.
 * This gives instant, flicker-free transitions with zero extra fetches.
 */

import type { ReactNode } from "react";
import { MarketplaceLayoutProvider } from "./_components/marketplace-layout-context";
import { MarketplaceShell } from "./_components/marketplace-shell";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MarketplaceLayoutProps {
  children: ReactNode;
  /** Next.js 13+ passes the current route's search params to layouts. */
  searchParams?: Promise<{ category?: string }>;
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export default async function MarketplaceLayout({
  children,
  searchParams,
}: MarketplaceLayoutProps) {
  // Read ?category from the URL so the sidebar pre-highlights the right item.
  // Falls back to null (all categories) when the param is absent.
  const resolvedParams = await searchParams;
  const initialCategory = resolvedParams?.category ?? null;

  return (
    /**
     * MarketplaceLayoutProvider
     * ─────────────────────────
     * Client boundary that holds shared UI state:
     *   - activeCategory  (synced from URL, then controlled client-side)
     *   - mobileSidebarOpen
     *
     * Wrapped around MarketplaceShell so the shell AND every child page
     * can read/write the same state via useMarketplaceLayout().
     */
    <MarketplaceLayoutProvider initialCategory={initialCategory}>
      {/**
       * MarketplaceShell
       * ────────────────
       * Renders the two-column chrome (sidebar + main area).
       * {children} is projected into the main content column.
       *
       * Each page can customise the top bar by passing props through a
       * shared store or by using the topBarExtra slot — see marketplace-shell.tsx.
       */}
      <MarketplaceShell>{children}</MarketplaceShell>
    </MarketplaceLayoutProvider>
  );
}
