"use client";

/**
 * MyOffersContainer
 *
 * Lists all offers the current user (as buyer) has sent.
 * Countered offers are highlighted and surfaced at the top via the
 * "Needs attention" tab so the buyer never misses a seller's counter.
 *
 * Tabs:
 *   All       → every offer regardless of status
 *   Pending   → awaiting seller response
 *   Countered → seller has replied with a counter — needs buyer action
 *   Closed    → accepted / rejected / cancelled / expired
 */

import {
  useGetMyOffers,
  type OfferStatus,
} from "@/hooks/features/notifications/api/useGetMyOffers";
import { cn } from "@/lib/utils";
import { Bell, Loader2, Tag } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { OfferCard } from "./offer-card";

// ─── Tab config ───────────────────────────────────────────────────────────────

type Tab = {
  key: "all" | "pending" | "countered" | "closed";
  label: string;
  status?: OfferStatus;
  highlight?: boolean; // draws extra attention (countered tab)
};

const TABS: Tab[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending", status: "pending" },
  {
    key: "countered",
    label: "Countered",
    status: "countered",
    highlight: true,
  },
  { key: "closed", label: "Closed" },
];

// "Closed" is a virtual tab — we filter client-side since the API doesn't
// have a combined closed status. We fetch all and filter for display.
const CLOSED_STATUSES: OfferStatus[] = [
  "accepted",
  "rejected",
  "cancelled",
  "expired",
];

// ─── Props ────────────────────────────────────────────────────────────────────

type Props = {
  accessToken: string;
};

// ─── Component ───────────────────────────────────────────────────────────────

export function MyOffersContainer({ accessToken }: Props) {
  const [activeTab, setActiveTab] = useState<Tab["key"]>("all");

  // Map tab to the status param the API accepts.
  // "all" and "closed" fetch without a status filter, then we filter "closed" client-side.
  const apiStatus: OfferStatus | undefined =
    activeTab === "pending"
      ? "pending"
      : activeTab === "countered"
        ? "countered"
        : undefined;

  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useGetMyOffers({ accessToken, status: apiStatus, limit: 10 });

  // Flatten all pages
  const allOffers = data?.pages.flatMap((p) => p.data) ?? [];

  // Client-side filter for the "closed" virtual tab
  const displayOffers =
    activeTab === "closed"
      ? allOffers.filter((o) => CLOSED_STATUSES.includes(o.status))
      : allOffers;

  // Count countered offers for the attention badge
  const counteredCount =
    data?.pages.flatMap((p) => p.data).filter((o) => o.status === "countered")
      .length ?? 0;

  // ── Infinite scroll sentinel ──────────────────────────────────────────────
  const sentinelRef = useRef<HTMLDivElement>(null);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) handleLoadMore();
      },
      { rootMargin: "100px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleLoadMore]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <section className="mt-8 pt-6 border-t border-neutral-100">
      {/* ── Section header ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 mb-4">
        <Tag className="w-4 h-4 text-neutral-500" />
        <h2 className="text-[14px] font-semibold text-neutral-800">
          My offers
        </h2>
        {/* Attention badge when there are countered offers needing response */}
        {counteredCount > 0 && (
          <span className="flex items-center gap-1 ml-auto text-[11px] font-semibold text-purple-700 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded-full">
            <Bell className="w-3 h-3" />
            {counteredCount} need{counteredCount === 1 ? "s" : ""} response
          </span>
        )}
      </div>

      {/* ── Status tabs ─────────────────────────────────────────────────── */}
      <div className="flex gap-1 mb-4 overflow-x-auto scrollbar-none">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "relative shrink-0 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all",
              activeTab === tab.key
                ? "bg-neutral-900 text-white"
                : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200",
              // Highlight the countered tab when there are pending counters
              tab.highlight && counteredCount > 0 && activeTab !== tab.key
                ? "bg-purple-50 text-purple-700 border border-purple-100"
                : "",
            )}
          >
            {tab.label}
            {/* Counter badge on the Countered tab */}
            {tab.key === "countered" && counteredCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-purple-600 text-white text-[9px] font-bold flex items-center justify-center">
                {counteredCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Loading ─────────────────────────────────────────────────────── */}
      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-xl bg-neutral-100 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* ── Error ───────────────────────────────────────────────────────── */}
      {isError && (
        <p className="text-center text-[13px] text-red-400 py-8">
          Failed to load offers.
        </p>
      )}

      {/* ── Empty state ─────────────────────────────────────────────────── */}
      {!isLoading && !isError && displayOffers.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center gap-2">
          <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
            <Tag className="w-5 h-5 text-neutral-300" />
          </div>
          <p className="text-[13px] font-medium text-neutral-600">
            No {activeTab === "all" ? "" : activeTab} offers
          </p>
          <p className="text-[12px] text-neutral-400">
            {activeTab === "countered"
              ? "No sellers have countered your offers yet."
              : "Offers you make on listings appear here."}
          </p>
        </div>
      )}

      {/* ── Offers list ─────────────────────────────────────────────────── */}
      {!isLoading && displayOffers.length > 0 && (
        <>
          <div className="space-y-2">
            {displayOffers.map((offer) => (
              <OfferCard
                key={offer._id}
                offer={offer}
                accessToken={accessToken}
                // Refetch the current tab after any mutation
                onRefresh={() => refetch()}
              />
            ))}

            {isFetchingNextPage && (
              <div className="h-20 rounded-xl bg-neutral-100 animate-pulse" />
            )}
          </div>

          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} className="h-1 w-full mt-2" aria-hidden />

          {!hasNextPage && displayOffers.length > 0 && (
            <p className="text-center text-[11.5px] text-neutral-400 py-6">
              All offers loaded
            </p>
          )}

          {isFetchingNextPage && (
            <div className="flex justify-center py-3">
              <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />
            </div>
          )}
        </>
      )}
    </section>
  );
}
