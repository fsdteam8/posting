"use client";

/**
 * MakeOfferCard
 *
 * Shown when the listing is negotiable and the viewer is not the seller.
 * Lets the buyer enter an offer amount and optional message.
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tag } from "lucide-react";
import { useMakeOffer } from "@/hooks/features/notifications/api/useMakeOffer";

type Props = {
  listingId: string;
  listingPrice: number;
  currency: string;
  accessToken: string;
};

export function MakeOfferCard({
  listingId,
  listingPrice,
  currency,
  accessToken,
}: Props) {
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { mutate, isPending } = useMakeOffer({ accessToken });

  function handleSubmit() {
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) return;

    mutate(
      { listingId, amount: parsed, message: message.trim() || undefined },
      {
        onSuccess: (res) => {
          if (res.success) {
            setSubmitted(true);
          }
        },
      },
    );
  }

  // ── After successful offer ─────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-center space-y-1">
        <p className="text-[13px] font-semibold text-emerald-700">
          Offer submitted
        </p>
        <p className="text-[12px] text-emerald-600">
          The seller will respond to your offer.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-neutral-100 bg-white p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Tag className="w-4 h-4 text-neutral-400" />
        <p className="text-[13px] font-semibold text-neutral-800">Make an offer</p>
      </div>

      <p className="text-[12px] text-neutral-500">
        Listed at{" "}
        <span className="font-semibold text-neutral-700">
          {currency} {listingPrice.toLocaleString()}
        </span>
        . Seller is open to offers.
      </p>

      {/* Amount input */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-neutral-400 font-medium">
          {currency}
        </span>
        <Input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Your offer"
          className="pl-10 h-9 text-[13px]"
          min={0}
        />
      </div>

      {/* Optional message */}
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Add a note (optional)"
        className="resize-none text-[12.5px] min-h-[60px]"
        rows={2}
      />

      <Button
        className="w-full h-9 text-[13px]"
        onClick={handleSubmit}
        disabled={isPending || !amount || parseFloat(amount) <= 0}
      >
        {isPending ? "Submitting..." : "Submit offer"}
      </Button>
    </div>
  );
}
