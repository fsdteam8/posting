"use client";

/**
 * SavedListingCard
 *
 * Displays a single saved listing with its photo, price, title, location,
 * condition badge, and an unsave (bookmark) toggle button.
 *
 * Unsaving is optimistic — the card fades out immediately while the
 * mutation fires in the background. On error it reappears.
 */

import { useSaveListing } from "@/hooks/features/notifications/api/useSaveListing";
import { cn } from "@/lib/utils";
import type { MarketplaceListing } from "@/types/features/marketplace";
import { BookmarkCheck, MapPin, Tag } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

// ─── Label maps ───────────────────────────────────────────────────────────────

const CONDITION_COLOR: Record<string, string> = {
  new: "bg-emerald-50 text-emerald-700",
  like_new: "bg-sky-50 text-sky-700",
  good: "bg-blue-50 text-blue-700",
  fair: "bg-amber-50 text-amber-700",
  used: "bg-neutral-100 text-neutral-500",
  not_applicable: "",
};

const CONDITION_LABEL: Record<string, string> = {
  new: "New",
  like_new: "Like New",
  good: "Good",
  fair: "Fair",
  used: "Used",
  not_applicable: "",
};

// ─── Props ────────────────────────────────────────────────────────────────────

type Props = {
  listing: MarketplaceListing;
  accessToken: string;
  /** Called after a successful unsave so the parent can remove the card */
  onUnsaved: (listingId: string) => void;
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function SavedListingCard({
  listing,
  accessToken,
  onUnsaved,
}: Props) {
  const router = useRouter();
  const { mutate: toggleSave, isPending } = useSaveListing({ accessToken });

  const photo = listing.photos?.[0]?.url;
  const locationStr = [listing.location?.city, listing.location?.state]
    .filter(Boolean)
    .join(", ");

  function handleUnsave(e: React.MouseEvent) {
    // Stop click from also navigating to the detail page
    e.stopPropagation();

    toggleSave(listing._id, {
      onSuccess: (res) => {
        // Toggle returns saved: false when the item was unsaved
        if (res.success && !res.data.saved) {
          onUnsaved(listing._id);
        }
      },
    });
  }

  return (
    <div
      onClick={() => router.push(`/marketplace/listing/${listing._id}`)}
      className={cn(
        "group relative flex flex-col rounded-xl border border-neutral-100 bg-white overflow-hidden cursor-pointer",
        "hover:shadow-md hover:border-neutral-200 transition-all duration-200",
        isPending && "opacity-50 pointer-events-none",
      )}
    >
      {/* ── Photo ────────────────────────────────────────────────────── */}
      <div className="relative aspect-square w-full bg-neutral-50 overflow-hidden">
        {photo ? (
          <Image
            src={photo}
            alt={listing.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Tag className="w-8 h-8 text-neutral-200" />
          </div>
        )}

        {/* Condition badge */}
        {listing.condition && listing.condition !== "not_applicable" && (
          <span
            className={cn(
              "absolute top-2 left-2 text-[10px] font-medium px-1.5 py-0.5 rounded-full",
              CONDITION_COLOR[listing.condition],
            )}
          >
            {CONDITION_LABEL[listing.condition]}
          </span>
        )}

        {/* Unsave button */}
        <button
          onClick={handleUnsave}
          disabled={isPending}
          className={cn(
            "absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all",
            "bg-white/90 hover:bg-white shadow-sm",
            isPending && "opacity-50",
          )}
          title="Remove from saved"
        >
          <BookmarkCheck className="w-3.5 h-3.5 text-blue-600" />
        </button>
      </div>

      {/* ── Info ─────────────────────────────────────────────────────── */}
      <div className="px-2.5 py-2">
        <p className="text-[13px] font-semibold text-neutral-900">
          {listing.currency} {listing.price.toLocaleString()}
        </p>
        <p className="text-[12px] text-neutral-500 truncate mt-0.5 leading-tight">
          {listing.title}
        </p>
        {locationStr && (
          <div className="flex items-center gap-1 mt-1">
            <MapPin className="w-2.5 h-2.5 text-neutral-400 shrink-0" />
            <span className="text-[11px] text-neutral-400 truncate">
              {locationStr}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
