"use client";

import { MarketplaceListing } from "@/types/features/marketplace";
import { Tag } from "lucide-react";
import { ListingCard } from "./listing-card";

type Props = {
  listings: MarketplaceListing[];
  isLoading?: boolean;
  onListingClick?: (listing: MarketplaceListing) => void;
};

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-neutral-100 overflow-hidden">
      <div className="aspect-square bg-neutral-100 animate-pulse" />
      <div className="p-2.5 space-y-1.5">
        <div className="h-3.5 w-16 bg-neutral-100 rounded animate-pulse" />
        <div className="h-3 w-28 bg-neutral-100 rounded animate-pulse" />
        <div className="h-2.5 w-20 bg-neutral-100 rounded animate-pulse" />
      </div>
    </div>
  );
}

export function MarketplaceGrid({
  listings,
  isLoading,
  onListingClick,
}: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5">
        {Array.from({ length: 20 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Tag className="w-10 h-10 text-neutral-200 mb-3" />
        <p className="text-[13px] font-medium text-neutral-500">
          No listings found
        </p>
        <p className="text-[12px] text-neutral-400 mt-1">
          Try adjusting your filters or check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5">
      {listings.map((listing) => (
        <ListingCard
          key={listing._id}
          listing={listing}
          onClick={() => onListingClick?.(listing)}
        />
      ))}
    </div>
  );
}
