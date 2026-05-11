"use client";

import { cn } from "@/lib/utils";
import { MarketplaceListing } from "@/types/features/marketplace";
import { MapPin, Tag } from "lucide-react";
import Image from "next/image";

type Props = {
  listing: MarketplaceListing;
  onClick?: () => void;
};

const CONDITION_LABEL: Record<string, string> = {
  new: "New",
  like_new: "Like New",
  good: "Good",
  fair: "Fair",
  used: "Used",
  not_applicable: "",
};

const CONDITION_COLOR: Record<string, string> = {
  new: "bg-emerald-50 text-emerald-700",
  like_new: "bg-sky-50 text-sky-700",
  good: "bg-blue-50 text-blue-700",
  fair: "bg-amber-50 text-amber-700",
  used: "bg-neutral-100 text-neutral-600",
  not_applicable: "",
};

export function ListingCard({ listing, onClick }: Props) {
  const photo = listing.photos?.[0]?.url;
  const location = listing.location;

  return (
    <button
      onClick={onClick}
      className="group text-left w-full flex flex-col rounded-xl border border-neutral-100 bg-white hover:shadow-md hover:border-neutral-200 transition-all duration-200 overflow-hidden"
    >
      {/* Image */}
      <div className="aspect-square w-full bg-neutral-50 relative overflow-hidden">
        {photo ? (
          <Image
            src={photo}
            alt={listing.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Tag className="w-8 h-8 text-neutral-200" />
          </div>
        )}

        {listing.listingStatus !== "available" && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white text-[11px] font-semibold uppercase tracking-wide bg-black/60 px-2 py-0.5 rounded">
              {listing.listingStatus}
            </span>
          </div>
        )}

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
      </div>

      {/* Info */}
      <div className="px-2.5 py-2">
        <p className="text-[13px] font-semibold text-neutral-900 truncate">
          ${listing.price.toLocaleString()}
        </p>

        <p className="text-[12px] text-neutral-600 truncate mt-0.5 leading-tight">
          {listing.title}
        </p>

        {(location?.city || location?.state) && (
          <div className="flex items-center gap-1 mt-1">
            <MapPin className="w-2.5 h-2.5 text-neutral-400 shrink-0" />

            <span className="text-[11px] text-neutral-400 truncate">
              {[location.city, location.state].filter(Boolean).join(", ")}
            </span>
          </div>
        )}
      </div>
    </button>
  );
}
