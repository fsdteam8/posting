"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeleteListing } from "@/hooks/features/marketplace/api/use-delete-listing";
import { useGetMyListings } from "@/hooks/features/marketplace/api/use-get-my-listings";
import { cn } from "@/lib/utils";
import type { ListingStatus } from "@/types/features/marketplace";
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Eye,
  MapPin,
  MoreHorizontal,
  Package,
  Pencil,
  Plus,
  Tag,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  accessToken: string;
};

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_TABS: { value: ListingStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "available", label: "Available" },
  { value: "pending", label: "Pending" },
  { value: "sold", label: "Sold" },
  { value: "archived", label: "Archived" },
];

const STATUS_BADGE: Record<string, string> = {
  available: "bg-emerald-50 text-emerald-700 border-emerald-100",
  pending: "bg-amber-50   text-amber-700   border-amber-100",
  sold: "bg-neutral-100 text-neutral-500 border-neutral-200",
  shipped: "bg-blue-50    text-blue-700    border-blue-100",
  archived: "bg-red-50     text-red-600     border-red-100",
};

// ─── Skeleton card ────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-neutral-100 overflow-hidden animate-pulse">
      <div className="aspect-square bg-neutral-100" />
      <div className="p-3 space-y-2">
        <div className="h-3.5 w-20 rounded bg-neutral-100" />
        <div className="h-3 w-32 rounded bg-neutral-100" />
        <div className="h-3 w-16 rounded bg-neutral-100" />
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MyListingsPanel({ accessToken }: Props) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<ListingStatus | "all">("all");
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const { data, isLoading, isError } = useGetMyListings({
    accessToken,
    page,
    limit: 12,
    status: status === "all" ? undefined : status,
  });

  const { mutate: deleteListing, isPending: isDeleting } = useDeleteListing({
    accessToken,
  });

  const listings = data?.data ?? [];
  const pagination = data?.pagination;

  function handleDeleteConfirm() {
    if (!deleteTargetId) return;
    deleteListing(deleteTargetId, {
      onSettled: () => setDeleteTargetId(null),
    });
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="w-full space-y-4">
        {/* ── Header row ───────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-neutral-500" />
            <h2 className="text-[14px] font-semibold text-neutral-800">
              Your listings
            </h2>
            {pagination && (
              <span className="text-[12px] text-neutral-400">
                · {pagination.total}
              </span>
            )}
          </div>

          {/* Create new listing shortcut */}
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-[12px] gap-1.5"
            onClick={() => router.push("/marketplace/create")}
          >
            <Plus className="w-3.5 h-3.5" />
            New listing
          </Button>
        </div>

        {/* ── Status tabs ──────────────────────────────────────────────── */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setStatus(tab.value);
                setPage(1);
              }}
              className={cn(
                "shrink-0 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all",
                status === tab.value
                  ? "bg-neutral-900 text-white"
                  : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Loading skeleton ─────────────────────────────────────────── */}
        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* ── Error ────────────────────────────────────────────────────── */}
        {isError && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-[13px] text-red-400">
              Failed to load your listings.
            </p>
          </div>
        )}

        {/* ── Empty state ──────────────────────────────────────────────── */}
        {!isLoading && !isError && listings.length === 0 && (
          <div className="flex flex-col items-center justify-center py-14 text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center">
              <Tag className="w-6 h-6 text-neutral-300" />
            </div>
            <div>
              <p className="text-[13px] font-medium text-neutral-600">
                No {status === "all" ? "" : status} listings
              </p>
              <p className="text-[12px] text-neutral-400 mt-0.5">
                Create your first listing to start selling.
              </p>
            </div>
            <Button
              size="sm"
              className="mt-1 h-8 text-[12.5px] gap-1.5"
              onClick={() => router.push("/marketplace/create")}
            >
              <Plus className="w-3.5 h-3.5" />
              Create listing
            </Button>
          </div>
        )}

        {/* ── Card grid ────────────────────────────────────────────────── */}
        {!isLoading && listings.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {listings.map((listing) => {
              const photo = listing.photos?.[0]?.url;
              const locationStr = [
                listing.location?.city,
                listing.location?.state,
              ]
                .filter(Boolean)
                .join(", ");

              return (
                <div
                  key={listing._id}
                  className="group relative flex flex-col rounded-2xl border border-neutral-100 bg-white overflow-hidden hover:shadow-md hover:border-neutral-200 transition-all duration-200"
                >
                  {/* ── Photo ─────────────────────────────────────── */}
                  <div
                    className="relative aspect-square bg-neutral-50 overflow-hidden cursor-pointer"
                    onClick={() =>
                      router.push(`/marketplace/listing/${listing._id}`)
                    }
                  >
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

                    {/* Status badge — top left */}
                    <span
                      className={cn(
                        "absolute top-2 left-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border capitalize",
                        STATUS_BADGE[listing.listingStatus] ??
                          "bg-neutral-100 text-neutral-500 border-neutral-200",
                      )}
                    >
                      {listing.listingStatus}
                    </span>

                    {/* Three-dot menu — top right, visible on hover */}
                    <div
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      // Stop click bubbling to the photo navigate handler
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="w-7 h-7 rounded-full bg-white/90 hover:bg-white shadow-sm flex items-center justify-center transition-colors">
                            <MoreHorizontal className="w-3.5 h-3.5 text-neutral-600" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36">
                          <DropdownMenuItem
                            className="text-[12.5px] gap-2"
                            onClick={() =>
                              router.push(`/marketplace/listing/${listing._id}`)
                            }
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View listing
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            className="text-[12.5px] gap-2"
                            onClick={() =>
                              router.push(
                                `/marketplace/my-listing/${listing._id}`,
                              )
                            }
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            Edit
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            className="text-[12.5px] gap-2 text-red-500 focus:text-red-500"
                            onClick={() => setDeleteTargetId(listing._id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* ── Info ──────────────────────────────────────── */}
                  <div className="p-2.5 space-y-0.5">
                    {/* Price */}
                    <p className="text-[13px] font-bold text-neutral-900">
                      {listing.currency} {listing.price.toLocaleString()}
                    </p>

                    {/* Title */}
                    <p className="text-[12px] text-neutral-600 truncate leading-tight">
                      {listing.title}
                    </p>

                    {/* Location */}
                    {locationStr && (
                      <div className="flex items-center gap-1 pt-0.5">
                        <MapPin className="w-2.5 h-2.5 text-neutral-400 shrink-0" />
                        <span className="text-[11px] text-neutral-400 truncate">
                          {locationStr}
                        </span>
                      </div>
                    )}

                    {/* Stats row — views + saves */}
                    <div className="flex items-center gap-3 pt-1.5 border-t border-neutral-50 mt-1">
                      <span className="flex items-center gap-1 text-[11px] text-neutral-400">
                        <Eye className="w-3 h-3" />
                        {listing.viewsCount}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-neutral-400">
                        <Bookmark className="w-3 h-3" />
                        {listing.savesCount}
                      </span>
                      {listing.offersCount > 0 && (
                        <span className="flex items-center gap-1 text-[11px] text-blue-500 font-medium ml-auto">
                          <Tag className="w-3 h-3" />
                          {listing.offersCount} offer
                          {listing.offersCount !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Pagination ───────────────────────────────────────────────── */}
        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>

            {/* Page number pills */}
            <div className="flex items-center gap-1">
              {Array.from({ length: pagination.pages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={cn(
                    "w-7 h-7 rounded-lg text-[12px] font-medium transition-colors",
                    page === i + 1
                      ? "bg-neutral-900 text-white"
                      : "text-neutral-400 hover:bg-neutral-100",
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page === pagination.pages}
              onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}
      </div>

      {/* ── Delete confirmation dialog ───────────────────────────────────── */}
      <AlertDialog
        open={!!deleteTargetId}
        onOpenChange={(v) => {
          if (!v) setDeleteTargetId(null);
        }}
      >
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[15px]">
              Delete listing?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[13px]">
              This listing will be permanently removed. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-9 text-[13px]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="h-9 text-[13px] bg-red-600 hover:bg-red-700"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
