/**
 * Marketplace page — SERVER COMPONENT
 *
 * This file intentionally has NO "use client" directive so Next.js renders it
 * on the server. Responsibilities here are limited to:
 *   1. Fetching the marketplace meta (categories, conditions, etc.) at request
 *      time so the client shell receives it as a plain prop — no loading state
 *      needed for meta on the client.
 *   2. Reading the session cookie server-side to pass the access token down
 *      safely without exposing it to the browser bundle.
 *   3. Rendering <MarketplaceClient> which owns all interactive state.
 *
 * Rule of thumb for this file: no useState / useEffect / event handlers.
 * If you need interactivity, push it into MarketplaceClient or a child
 * "use client" component.
 */

import { auth } from "@/auth";
import type { MarketplaceMeta } from "@/types/features/marketplace";
import { redirect } from "next/navigation";
import { MarketplaceClient } from "./_components/marketplace-client";

// ─── Server-side meta fetch ───────────────────────────────────────────────────
//
// We fetch meta here instead of via React Query because:
//  - Meta is stable (same for every user, no auth required)
//  - Server fetch removes a client-side waterfall on first render
//  - Next.js deduplicates identical fetch() calls within the same request
//
// Falls back to null on failure — MarketplaceClient handles the empty state.

async function getMarketplaceMeta(): Promise<MarketplaceMeta | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/marketplace/meta`,
      {
        // Revalidate every 10 minutes — meta (categories, conditions, etc.)
        // changes infrequently. Switch to cache: "no-store" if it ever
        // becomes user-specific or changes in real time.
        next: { revalidate: 600 },
      },
    );

    if (!res.ok) return null;

    const json = await res.json();
    return (json?.data as MarketplaceMeta) ?? null;
  } catch {
    // Network or parse error — degrade gracefully so the page still renders
    return null;
  }
}

// ─── Page props ───────────────────────────────────────────────────────────────
//
// Next.js passes searchParams to server page components automatically.
// We read ?category here so a shared/bookmarked URL pre-filters the grid
// without any client-side JS needing to parse the URL on mount.

type PageProps = {
  searchParams?: {
    category?: string;
  };
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function MarketplacePage({}: PageProps) {
  const cu = await auth();

  // Kick off meta fetch — async, so Next.js can stream the shell immediately
  // while this resolves in the background (works with React Suspense too).
  const meta = await getMarketplaceMeta();

  if (!cu || !cu.user || !cu.user.accessToken) redirect("/");

  // Hand everything to the interactive client shell. The server has done its
  // work — from here on, MarketplaceClient owns state and interactivity.

  return <MarketplaceClient meta={meta} accessToken={cu.user.accessToken} />;
}
