"use client";

/**
 * ListingDetailClient — CLIENT COMPONENT
 *
 * Full listing detail page modelled after the Facebook Marketplace listing
 * detail layout:
 *
 *  ┌─────────────────────────────┬──────────────────┐
 *  │  Photo gallery              │  Price + actions  │
 *  │  Action bar (save/share)    │  Seller card      │
 *  │  Details section            │  Make offer card  │
 *  │  Delivery & tags            │                   │
 *  │  Related listings           │                   │
 *  └─────────────────────────────┴──────────────────┘
 *
 * On mobile the right column stacks below the left column.
 * The sticky "Message / Offer" bar at the bottom is mobile-only.
 */

import { Button } from "@/components/ui/button";
import { useGetListing } from "@/hooks/features/marketplace/api/use-get-listing-by-id";
import { cn } from "@/lib/utils";
import type { ListingSeller } from "@/types/features/marketplace";
import { formatDistanceToNow } from "date-fns";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  MapPin,
  MessageCircle,
  Package,
  Tag,
  Truck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ListingActionsBar } from "./listing-actions-bar";
import { ListingDetailSkeleton } from "./listing-detail-skeleton";
import { ListingImageGallery } from "./listing-image-gallery";
import { MakeOfferCard } from "./make-offer-card";
import { RelatedListings } from "./related-listings";
import { SellerInfoCard } from "./seller-info-card";

// ─── Label maps ───────────────────────────────────────────────────────────────

const CONDITION_LABEL: Record<string, string> = {
  new: "New",
  like_new: "Like New",
  good: "Good",
  fair: "Fair",
  used: "Used",
  not_applicable: "N/A",
};

const CONDITION_COLOR: Record<string, string> = {
  new: "bg-emerald-50 text-emerald-700 border-emerald-100",
  like_new: "bg-sky-50 text-sky-700 border-sky-100",
  good: "bg-blue-50 text-blue-700 border-blue-100",
  fair: "bg-amber-50 text-amber-700 border-amber-100",
  used: "bg-neutral-100 text-neutral-600 border-neutral-200",
  not_applicable: "bg-neutral-100 text-neutral-500 border-neutral-200",
};

const STATUS_COLOR: Record<string, string> = {
  available: "bg-emerald-50 text-emerald-700",
  pending: "bg-amber-50 text-amber-700",
  sold: "bg-neutral-100 text-neutral-500",
  shipped: "bg-blue-50 text-blue-700",
  archived: "bg-red-50 text-red-600",
};

const DELIVERY_LABEL: Record<string, string> = {
  local_pickup: "Local Pickup",
  shipping: "Shipping",
  door_drop: "Door Drop",
  meetup: "Meetup",
  local_delivery: "Local Delivery",
};

// ─── Props ────────────────────────────────────────────────────────────────────

type Props = {
  listingId: string;
  accessToken: string;
  currentUserId: string;
};

// ─── Component ────────────────────────────────────────────────────────────────

export function ListingDetailClient({
  listingId,
  accessToken,
  currentUserId,
}: Props) {
  const router = useRouter();

  const { data, isLoading, isError } = useGetListing({
    listingId,
    accessToken,
  });

  console.log("listingId", listingId);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) return <ListingDetailSkeleton />;

  // ── Error ──────────────────────────────────────────────────────────────────
  if (isError || !data?.data?.listing) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <AlertCircle className="w-10 h-10 text-red-300 mb-3" />
        <p className="text-[14px] font-semibold text-neutral-700">
          Listing not found
        </p>
        <p className="text-[12px] text-neutral-400 mt-1 mb-4">
          This listing may have been removed or is no longer available.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/marketplace")}
          className="gap-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Marketplace
        </Button>
      </div>
    );
  }

  const { listing, sellerRating, relatedListings } = data.data;

  // Seller is always populated (API always populates it on detail endpoint)
  const seller = listing.seller as ListingSeller;
  const isSeller = seller._id === currentUserId;

  // Determine if the current user has saved / hidden this listing
  const isSaved = listing.saves.includes(currentUserId);
  const isHidden = listing.hiddenBy.includes(currentUserId);

  const location = listing.location;
  const locationStr = [location?.city, location?.state, location?.country]
    .filter(Boolean)
    .join(", ");

  const timeAgo = formatDistanceToNow(new Date(listing.createdAt), {
    addSuffix: true,
  });

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-5xl mx-auto px-4 py-4 pb-24 lg:pb-8">
      {/* ── Back nav ───────────────────────────────────────────────────── */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-[12.5px] text-neutral-500 hover:text-neutral-800 mb-4 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to marketplace
      </button>

      {/* ── Two-column layout ──────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* ══ LEFT COLUMN ════════════════════════════════════════════════ */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Photo gallery */}
          <ListingImageGallery photos={listing.photos} title={listing.title} />

          {/* Action bar — save, share, hide, report */}
          <ListingActionsBar
            listingId={listingId}
            accessToken={accessToken}
            isSaved={isSaved}
            isHidden={isHidden}
          />

          {/* ── Details section ──────────────────────────────────────── */}
          <div className="space-y-3">
            {/* Status + condition badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={cn(
                  "text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize",
                  STATUS_COLOR[listing.listingStatus] ??
                    "bg-neutral-100 text-neutral-500",
                )}
              >
                {listing.listingStatus}
              </span>

              {listing.condition && listing.condition !== "not_applicable" && (
                <span
                  className={cn(
                    "text-[11px] font-medium px-2 py-0.5 rounded-full border capitalize",
                    CONDITION_COLOR[listing.condition],
                  )}
                >
                  {CONDITION_LABEL[listing.condition]}
                </span>
              )}

              {listing.isNegotiable && (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full border bg-purple-50 text-purple-700 border-purple-100">
                  Negotiable
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-[22px] sm:text-[26px] font-bold text-neutral-900 leading-tight">
              {listing.title}
            </h1>

            {/* Price */}
            <p className="text-[22px] font-bold text-neutral-900">
              {listing.currency} {listing.price.toLocaleString()}
            </p>

            {/* Meta row — location, time, views */}
            <div className="flex flex-wrap items-center gap-3 text-[12px] text-neutral-400">
              {locationStr && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {locationStr}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Listed {timeAgo}
              </span>
              <span>{listing.viewsCount} views</span>
              <span>{listing.savesCount} saves</span>
            </div>

            {/* Category breadcrumb */}
            <div className="flex items-center gap-1.5 text-[12px] text-neutral-400">
              <Tag className="w-3 h-3" />
              <span>{listing.category}</span>
              {listing.subcategory && (
                <>
                  <span>·</span>
                  <span>{listing.subcategory}</span>
                </>
              )}
            </div>
          </div>

          {/* ── Description ──────────────────────────────────────────── */}
          {listing.description && (
            <div className="space-y-2 pt-1 border-t border-neutral-100">
              <h3 className="text-[12px] font-semibold uppercase tracking-wider text-neutral-400">
                Description
              </h3>
              <p className="text-[13.5px] text-neutral-700 leading-relaxed whitespace-pre-line">
                {listing.description}
              </p>
            </div>
          )}

          {/* ── Details grid ─────────────────────────────────────────── */}
          <div className="space-y-2 pt-1 border-t border-neutral-100">
            <h3 className="text-[12px] font-semibold uppercase tracking-wider text-neutral-400">
              Details
            </h3>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {[
                {
                  label: "Condition",
                  value: CONDITION_LABEL[listing.condition],
                },
                { label: "Quantity", value: listing.quantity },
                { label: "Category", value: listing.category },
                {
                  label: "Type",
                  value: listing.listingType.replace(/_/g, " "),
                },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[11px] text-neutral-400">{label}</p>
                  <p className="text-[13px] font-medium text-neutral-700 capitalize">
                    {String(value)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Delivery options ─────────────────────────────────────── */}
          {listing.deliveryOptions.length > 0 && (
            <div className="space-y-2 pt-1 border-t border-neutral-100">
              <h3 className="text-[12px] font-semibold uppercase tracking-wider text-neutral-400">
                Delivery
              </h3>
              <div className="flex flex-wrap gap-2">
                {listing.deliveryOptions.map((opt) => (
                  <span
                    key={opt}
                    className="flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-lg bg-neutral-50 border border-neutral-100 text-neutral-600"
                  >
                    <Truck className="w-3.5 h-3.5 text-neutral-400" />
                    {DELIVERY_LABEL[opt] ?? opt}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ── Tags ─────────────────────────────────────────────────── */}
          {listing.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1 border-t border-neutral-100">
              {listing.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[11.5px] px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-500"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* ── Related listings ─────────────────────────────────────── */}
          <div className="pt-2 border-t border-neutral-100">
            <RelatedListings listings={relatedListings} />
          </div>
        </div>

        {/* ══ RIGHT COLUMN (sidebar on lg+) ══════════════════════════════ */}
        <div className="w-full lg:w-80 shrink-0 space-y-3 lg:sticky lg:top-20">
          {/* Price card — visible on desktop, hidden on mobile (shown inline) */}
          <div className="hidden lg:block rounded-xl border border-neutral-100 bg-white p-4 space-y-1">
            <p className="text-[24px] font-bold text-neutral-900">
              {listing.currency} {listing.price.toLocaleString()}
            </p>
            {listing.isNegotiable && (
              <p className="text-[12px] text-neutral-400">
                <CheckCircle2 className="w-3.5 h-3.5 inline mr-1 text-purple-400" />
                Open to offers
              </p>
            )}
            {locationStr && (
              <p className="text-[12px] text-neutral-400 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {locationStr}
              </p>
            )}
            <p className="text-[11.5px] text-neutral-400">Listed {timeAgo}</p>
          </div>

          {/* Seller card */}
          <SellerInfoCard
            seller={seller}
            sellerRating={sellerRating}
            listingId={listingId}
            accessToken={accessToken}
            isSeller={isSeller}
          />

          {/* Make offer card — only shown when negotiable and viewer is not seller */}
          {listing.isNegotiable &&
            !isSeller &&
            listing.listingStatus === "available" && (
              <MakeOfferCard
                listingId={listingId}
                listingPrice={listing.price}
                currency={listing.currency}
                accessToken={accessToken}
              />
            )}

          {/* Availability notice for non-available listings */}
          {listing.listingStatus !== "available" && (
            <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-4 text-center">
              <Package className="w-6 h-6 text-neutral-300 mx-auto mb-2" />
              <p className="text-[13px] font-medium text-neutral-600 capitalize">
                This item is {listing.listingStatus}
              </p>
              <p className="text-[12px] text-neutral-400 mt-0.5">
                Check back for similar items.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ══ MOBILE STICKY BOTTOM BAR ══════════════════════════════════════ */}
      {/* Shown only on mobile/tablet. Replaces the right sidebar column.   */}
      {!isSeller && listing.listingStatus === "available" && (
        <div className="fixed bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur border-t border-neutral-100 px-4 py-3 flex gap-2 lg:hidden">
          <Button
            variant="outline"
            className="flex-1 h-11 text-[13px] gap-2"
            onClick={() => {
              // Scroll to seller card message box
              document.getElementById("seller-message-box")?.scrollIntoView({
                behavior: "smooth",
              });
            }}
          >
            <MessageCircle className="w-4 h-4" />
            Message
          </Button>

          {listing.isNegotiable && (
            <Button
              className="flex-1 h-11 text-[13px] gap-2"
              onClick={() => {
                document.getElementById("offer-box")?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
            >
              <Tag className="w-4 h-4" />
              Make offer
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
