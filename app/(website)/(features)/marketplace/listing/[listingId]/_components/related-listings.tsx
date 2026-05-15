"use client";

/**
 * RelatedListings
 *
 * Horizontally scrollable row of related listings from the same category.
 * Tapping a card navigates to that listing's detail page.
 */

import { MapPin, Tag } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

type RelatedListing = {
  _id: string;
  title: string;
  price: number;
  currency: string;
  listingStatus: string;
  photos: { url: string; public_id: string }[];
  location?: {
    city?: string;
    state?: string;
  };
  createdAt: string;
};

type Props = {
  listings: RelatedListing[];
};

export function RelatedListings({ listings }: Props) {
  const router = useRouter();

  if (listings.length === 0) return null;

  return (
    <div>
      <h3 className="text-[13px] font-semibold text-neutral-800 mb-3">
        Related listings
      </h3>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
        {listings.map((listing) => {
          const photo = listing.photos?.[0]?.url;

          return (
            <button
              key={listing._id}
              onClick={() => router.push(`/marketplace/listing/${listing._id}`)}
              className="shrink-0 w-36 text-left group"
            >
              {/* Thumbnail */}
              <div className="w-full aspect-square rounded-xl overflow-hidden bg-neutral-100 mb-2">
                {photo ? (
                  <Image
                    src={photo}
                    alt={listing.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Tag className="w-6 h-6 text-neutral-300" />
                  </div>
                )}
              </div>

              {/* Info */}
              <p className="text-[13px] font-semibold text-neutral-800">
                {listing.currency} {listing.price.toLocaleString()}
              </p>
              <p className="text-[12px] text-neutral-500 truncate mt-0.5">
                {listing.title}
              </p>

              {listing.location?.city && (
                <div className="flex items-center gap-1 mt-0.5">
                  <MapPin className="w-2.5 h-2.5 text-neutral-400" />
                  <span className="text-[11px] text-neutral-400 truncate">
                    {listing.location.city}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
