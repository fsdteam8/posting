"use client";

/**
 * CounterOfferDialog
 *
 * Shown when the buyer clicks "Respond" on an offer that has status "countered".
 * The seller has proposed a counterAmount — the buyer can:
 *   - Accept the counter  → useRespondToOffer action: "accept"
 *   - Reject the counter  → useRespondToOffer action: "reject"
 *   - Cancel their offer  → useCancelOffer
 */

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCancelOffer } from "@/hooks/features/notifications/api/useCancelOffer";
import type { MyOffer } from "@/hooks/features/notifications/api/useGetMyOffers";
import { useRespondToOffer } from "@/hooks/features/notifications/api/useRespondToOffer";
import { Ban, CheckCircle2, XCircle } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  offer: MyOffer;
  accessToken: string;
  onActionComplete: () => void;
};

export default function CounterOfferDialog({
  open,
  onOpenChange,
  offer,
  accessToken,
  onActionComplete,
}: Props) {
  const { mutate: respond, isPending: isResponding } = useRespondToOffer({
    accessToken,
  });
  const { mutate: cancel, isPending: isCancelling } = useCancelOffer({
    accessToken,
  });

  const isPending = isResponding || isCancelling;

  function handleRespond(action: "accept" | "reject") {
    respond(
      { offerId: offer._id, action },
      {
        onSuccess: (res) => {
          if (res.success) {
            onOpenChange(false);
            onActionComplete();
          }
        },
      },
    );
  }

  function handleCancel() {
    cancel(offer._id, {
      onSuccess: (res) => {
        if (res.success) {
          onOpenChange(false);
          onActionComplete();
        }
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm p-0">
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-neutral-100">
          <DialogTitle className="text-[14px] font-semibold">
            Seller sent a counter offer
          </DialogTitle>
        </DialogHeader>

        <div className="px-5 py-4 space-y-4">
          {/* ── Offer summary ──────────────────────────────────────────── */}
          <div className="rounded-xl bg-neutral-50 border border-neutral-100 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-neutral-500">Your offer</span>
              <span className="text-[13px] font-semibold text-neutral-700 line-through">
                {offer.currency} {offer.amount.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-neutral-500">
                Seller&apos;s counter
              </span>
              <span className="text-[15px] font-bold text-purple-700">
                {offer.currency} {offer.counterAmount?.toLocaleString() ?? "—"}
              </span>
            </div>
            <div className="pt-1 border-t border-neutral-100">
              <p className="text-[11.5px] text-neutral-400">
                Listing: {offer.listing.title}
              </p>
            </div>
          </div>

          <p className="text-[12.5px] text-neutral-500">
            Do you want to accept the seller&apos;s price of{" "}
            <span className="font-semibold text-neutral-700">
              {offer.currency} {offer.counterAmount?.toLocaleString()}
            </span>
            ?
          </p>

          {/* ── Actions ────────────────────────────────────────────────── */}
          <div className="flex flex-col gap-2">
            {/* Accept counter */}
            <Button
              className="w-full h-10 text-[13px] gap-2 bg-emerald-600 hover:bg-emerald-700"
              onClick={() => handleRespond("accept")}
              disabled={isPending}
            >
              <CheckCircle2 className="w-4 h-4" />
              {isResponding ? "Accepting..." : "Accept counter offer"}
            </Button>

            {/* Reject counter */}
            <Button
              variant="outline"
              className="w-full h-10 text-[13px] gap-2 border-red-200 text-red-600 hover:bg-red-50"
              onClick={() => handleRespond("reject")}
              disabled={isPending}
            >
              <XCircle className="w-4 h-4" />
              {isResponding ? "Rejecting..." : "Decline counter offer"}
            </Button>

            {/* Cancel own offer entirely */}
            <Button
              variant="ghost"
              className="w-full h-9 text-[12px] text-neutral-400 hover:text-neutral-600 gap-1.5"
              onClick={handleCancel}
              disabled={isPending}
            >
              <Ban className="w-3.5 h-3.5" />
              {isCancelling ? "Cancelling..." : "Withdraw my offer"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
