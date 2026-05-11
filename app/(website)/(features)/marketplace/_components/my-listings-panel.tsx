"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDeleteListing } from "@/hooks/features/marketplace/api/use-delete-listing";
import { useGetMyListings } from "@/hooks/features/marketplace/api/use-get-my-listings";
import { cn } from "@/lib/utils";
import {
  ListingStatus,
  MarketplaceListing,
} from "@/types/features/marketplace";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Pencil,
  Tag,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

type Props = {
  accessToken: string;
  onEdit?: (listing: MarketplaceListing) => void;
};

const STATUS_OPTIONS: { value: ListingStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "available", label: "Available" },
  { value: "pending", label: "Pending" },
  { value: "sold", label: "Sold" },
  { value: "archived", label: "Archived" },
];

const STATUS_BADGE: Record<ListingStatus, string> = {
  available: "bg-emerald-50 text-emerald-700",
  pending: "bg-amber-50 text-amber-700",
  sold: "bg-neutral-100 text-neutral-500",
  shipped: "bg-blue-50 text-blue-700",
  archived: "bg-red-50 text-red-600",
};

export function MyListingsPanel({ accessToken, onEdit }: Props) {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<ListingStatus | "all">("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading, isError } = useGetMyListings({
    accessToken,
    page,
    limit: 10,
    status: status === "all" ? undefined : status,
  });

  const { mutate: deleteListing, isPending: isDeleting } = useDeleteListing({
    accessToken,
  });

  const listings = data?.data ?? [];
  const pagination = data?.pagination;

  function handleDelete(id: string) {
    setDeletingId(id);
    deleteListing(id, {
      onSettled: () => setDeletingId(null),
    });
  }

  return (
    <div className="w-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[13px] font-semibold text-neutral-800">
          Your Listings
        </h2>
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v as ListingStatus | "all");
            setPage(1);
          }}
        >
          <SelectTrigger className="h-7 w-30 text-[12px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem
                key={s.value}
                value={s.value}
                className="text-[12.5px]"
              >
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-xl bg-neutral-100 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-[13px] text-red-500">
            Failed to load your listings.
          </p>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && listings.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Tag className="w-8 h-8 text-neutral-200 mb-2" />
          <p className="text-[13px] text-neutral-500">No listings yet.</p>
        </div>
      )}

      {/* List */}
      {!isLoading && listings.length > 0 && (
        <div className="flex flex-col gap-2">
          {listings.map((listing) => {
            const photo = listing.photos?.[0]?.url;
            return (
              <div
                key={listing._id}
                className="flex items-start gap-3 p-3 rounded-xl border border-neutral-100 hover:border-neutral-200 bg-white transition-colors group"
              >
                {/* Thumbnail */}
                <div className="w-14 h-14 rounded-lg bg-neutral-50 shrink-0 overflow-hidden relative">
                  {photo ? (
                    <Image
                      src={photo}
                      alt={listing.title}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Tag className="w-4 h-4 text-neutral-300" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-neutral-800 truncate">
                        {listing.title}
                      </p>
                      <p className="text-[12px] text-neutral-500 mt-0.5">
                        ${listing.price.toLocaleString()} {listing.currency}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-full capitalize",
                        STATUS_BADGE[listing.listingStatus] ??
                          "bg-neutral-100 text-neutral-500",
                      )}
                    >
                      {listing.listingStatus}
                    </span>
                  </div>

                  {listing.location?.city && (
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="w-2.5 h-2.5 text-neutral-400" />
                      <span className="text-[11px] text-neutral-400">
                        {[listing.location.city, listing.location.state]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(listing)}
                      className="p-1.5 rounded-md hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(listing._id)}
                    disabled={isDeleting && deletingId === listing._id}
                    className="p-1.5 rounded-md hover:bg-red-50 text-neutral-400 hover:text-red-500 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </Button>
          <span className="text-[12px] text-neutral-500">
            {page} / {pagination.pages}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            disabled={page === pagination.pages}
            onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
