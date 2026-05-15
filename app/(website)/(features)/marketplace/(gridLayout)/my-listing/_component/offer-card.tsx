"use client";

/**
 * OfferCard
 *
 * Renders a single offer with its listing thumbnail, amounts, status badge,
 * and context-aware action buttons.
 *
 * Action visibility rules:
 *
 *   pending   → Cancel button (buyer withdraws)
 *   countered → "Respond to counter" button (opens CounterOfferDialog)
 *   accepted  → Read-only — congratulations message
 *   rejected  → Read-only — rejection note
 *   cancelled → Read-only
 *   expired   → Read-only
 */

import { Button } from "@/components/ui/button";
import { useCancelOffer } from "@/hooks/features/notifications/api/useCancelOffer";
import type { MyOffer } from "@/hooks/features/notifications/api/useGetMyOffers";
import { formatDistanceToNow } from "date-fns";
import { ArrowRight, Ban, Tag, User } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { OfferStatusBadge } from "./offer-status-badge";
const CounterOfferDialog = dynamic(() => import("./counter-offer-dialog"), {
  ssr: false,
});

type Props = {
  offer: MyOffer;
  accessToken: string;
  onRefresh: () => void;
};

export function OfferCard({ offer, accessToken, onRefresh }: Props) {
  const router = useRouter();
  const [counterDialogOpen, setCounterDialogOpen] = useState(false);

  const { mutate: cancelOffer, isPending: isCancelling } = useCancelOffer({
    accessToken,
  });

  const listing = offer.listing;
  const photo = listing.photos?.[0]?.url;
  const sellerName =
    `${listing.seller.firstName} ${listing.seller.lastName}`.trim();
  const timeAgo = formatDistanceToNow(new Date(offer.createdAt), {
    addSuffix: true,
  });

  function handleCancel() {
    cancelOffer(offer._id, {
      onSuccess: (res) => {
        if (res.success) onRefresh();
      },
    });
  }

  return (
    <>
      <div className="flex gap-3 p-3 rounded-xl border border-neutral-100 bg-white hover:border-neutral-200 transition-colors">
        {/* ── Listing thumbnail ─────────────────────────────────────── */}
        <button
          onClick={() => router.push(`/marketplace/listing/${listing._id}`)}
          className="relative shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-neutral-100"
        >
          {photo ? (
            <Image
              src={photo}
              alt={listing.title}
              fill
              className="object-cover"
              sizes="64px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Tag className="w-5 h-5 text-neutral-300" />
            </div>
          )}
        </button>

        {/* ── Main content ──────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-1.5">
          {/* Title + status */}
          <div className="flex items-start justify-between gap-2">
            <button
              onClick={() => router.push(`/marketplace/listing/${listing._id}`)}
              className="text-[13px] font-semibold text-neutral-800 truncate hover:text-blue-600 transition-colors text-left"
            >
              {listing.title}
            </button>
            <OfferStatusBadge status={offer.status} />
          </div>

          {/* Seller */}
          <div className="flex items-center gap-1 text-[11.5px] text-neutral-400">
            <User className="w-3 h-3" />
            <span>{sellerName}</span>
            <span>·</span>
            <span>{timeAgo}</span>
          </div>

          {/* ── Amount row ──────────────────────────────────────────── */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Original offer */}
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-neutral-400">Your offer:</span>
              <span
                className={`text-[13px] font-semibold ${
                  offer.status === "countered"
                    ? "line-through text-neutral-400"
                    : "text-neutral-800"
                }`}
              >
                {offer.currency} {offer.amount.toLocaleString()}
              </span>
            </div>

            {/* Counter amount — shown when countered */}
            {offer.counterAmount !== null && (
              <>
                <ArrowRight className="w-3 h-3 text-neutral-300" />
                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-neutral-400">Counter:</span>
                  <span className="text-[13px] font-bold text-purple-700">
                    {offer.currency} {offer.counterAmount.toLocaleString()}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Optional buyer message */}
          {offer.message && (
            <p className="text-[11.5px] text-neutral-400 italic truncate">
              &rdquo;{offer.message}&rdquo;
            </p>
          )}

          {/* ── Context-aware action buttons ────────────────────────── */}
          <div className="pt-1">
            {/* PENDING → can only cancel */}
            {offer.status === "pending" && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-[11.5px] gap-1.5 text-neutral-500 hover:text-red-500 hover:border-red-200"
                onClick={handleCancel}
                disabled={isCancelling}
              >
                <Ban className="w-3 h-3" />
                {isCancelling ? "Cancelling..." : "Withdraw offer"}
              </Button>
            )}

            {/* COUNTERED → buyer must respond */}
            {offer.status === "countered" && (
              <Button
                size="sm"
                className="h-7 text-[11.5px] gap-1.5 bg-purple-600 hover:bg-purple-700"
                onClick={() => setCounterDialogOpen(true)}
              >
                Respond to counter
                <ArrowRight className="w-3 h-3" />
              </Button>
            )}

            {/* ACCEPTED */}
            {offer.status === "accepted" && (
              <p className="text-[11.5px] text-emerald-600 font-medium">
                ✓ Offer accepted — arrange with the seller to complete the
                purchase.
              </p>
            )}

            {/* REJECTED */}
            {offer.status === "rejected" && (
              <p className="text-[11.5px] text-neutral-400">
                The seller declined this offer.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Counter offer response dialog */}
      {offer.status === "countered" && (
        <CounterOfferDialog
          open={counterDialogOpen}
          onOpenChange={setCounterDialogOpen}
          offer={offer}
          accessToken={accessToken}
          onActionComplete={onRefresh}
        />
      )}
    </>
  );
}
