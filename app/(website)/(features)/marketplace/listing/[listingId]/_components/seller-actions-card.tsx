"use client";

/**
 * SellerActionsCard
 *
 * Right-rail card shown only when the viewer owns the listing. Lets the
 * seller close out a sale after they have agreed on a buyer through
 * marketplace messages — even when multiple buyers have been negotiating
 * on the same listing — by picking the buyer and confirming.
 *
 * Buyer candidates come from MarketplaceOffer (everyone who has made an
 * offer). If the seller hasn't received an offer yet but agreed on a sale
 * through chat, they can still mark the listing as sold from the chat
 * banner instead, where the buyer is implicit.
 */

import { Button } from "@/components/ui/button";
import { baseURL } from "@/constants";
import { useChangeListingStatus } from "@/hooks/features/marketplace/api/use-change-listing-status";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, ChevronRight, MessageCircle, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type OfferBuyer = {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  profileImage?: { url?: string };
};

type Offer = {
  _id: string;
  amount: number;
  status: "pending" | "accepted" | "rejected" | "countered" | "cancelled";
  createdAt: string;
  buyer: OfferBuyer;
};

type OffersResponse = {
  success: boolean;
  message: string;
  data: Offer[];
};

type Props = {
  listingId: string;
  accessToken: string;
  listingStatus: string;
  currency: string;
};

export function SellerActionsCard({
  listingId,
  accessToken,
  listingStatus,
  currency,
}: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedBuyerId, setSelectedBuyerId] = useState<string | null>(null);

  const offersEnabled = pickerOpen;
  const { data: offersData, isLoading: offersLoading } = useQuery<
    OffersResponse,
    Error
  >({
    queryKey: ["marketplace", "listing", listingId, "offers"],
    enabled: offersEnabled,
    queryFn: async () => {
      const res = await fetch(
        `${baseURL}/marketplace/listings/${listingId}/offers`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      return res.json();
    },
    staleTime: 1000 * 30,
  });

  const offers = offersData?.data ?? [];

  // De-dupe offers by buyer so each buyer shows once (with their latest offer)
  const buyers = (() => {
    const seen = new Set<string>();
    const out: { buyer: OfferBuyer; latest: Offer }[] = [];
    for (const o of offers) {
      if (!o.buyer || seen.has(o.buyer._id)) continue;
      seen.add(o.buyer._id);
      out.push({ buyer: o.buyer, latest: o });
    }
    return out;
  })();

  const changeStatus = useChangeListingStatus({ accessToken });

  const canMarkSold =
    listingStatus === "available" || listingStatus === "pending";

  function close() {
    if (changeStatus.isPending) return;
    setPickerOpen(false);
    setSelectedBuyerId(null);
  }

  function confirmSold() {
    if (!selectedBuyerId) return;
    changeStatus.mutate(
      { listingId, status: "sold", soldTo: selectedBuyerId },
      {
        onSuccess: (res) => {
          if (res.success) close();
        },
      },
    );
  }

  return (
    <div className="rounded-xl border border-neutral-100 bg-white p-4 space-y-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
        Seller tools
      </p>

      {canMarkSold ? (
        <>
          <Button
            onClick={() => setPickerOpen(true)}
            className="w-full h-9 text-[12.5px] gap-1.5 bg-emerald-600 hover:bg-emerald-700"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Mark as sold
          </Button>
          <p className="text-[11.5px] text-neutral-500 leading-relaxed">
            Already agreed on a sale in chat? You can also mark this sold
            directly from the conversation — the buyer is detected automatically
            there.
          </p>
        </>
      ) : (
        <p className="text-[12px] text-neutral-500 capitalize">
          Status: {listingStatus}
        </p>
      )}

      {pickerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
          onClick={close}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b px-5 py-3">
              <h3 className="text-[14px] font-semibold">Pick the buyer</h3>
              <button
                type="button"
                onClick={close}
                disabled={changeStatus.isPending}
                className="text-neutral-400 hover:text-neutral-700 disabled:cursor-not-allowed"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto p-2">
              {offersLoading ? (
                <p className="px-4 py-6 text-center text-[12.5px] text-neutral-400">
                  Loading buyers…
                </p>
              ) : buyers.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <MessageCircle className="w-7 h-7 text-neutral-300 mx-auto mb-2" />
                  <p className="text-[12.5px] text-neutral-600 font-medium">
                    No offers yet on this listing
                  </p>
                  <p className="text-[11.5px] text-neutral-400 mt-1">
                    If you agreed on a sale in chat, open the conversation and
                    use the &quot;Mark as sold&quot; button there.
                  </p>
                  <Link
                    href="/marketplace/messages"
                    className="mt-3 inline-flex items-center gap-1 text-[12px] text-blue-600 hover:text-blue-700"
                  >
                    Go to marketplace messages
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              ) : (
                buyers.map(({ buyer, latest }) => {
                  const fullName =
                    `${buyer.firstName ?? ""} ${buyer.lastName ?? ""}`.trim() ||
                    buyer.username ||
                    "Buyer";
                  const selected = selectedBuyerId === buyer._id;
                  return (
                    <button
                      key={buyer._id}
                      type="button"
                      onClick={() => setSelectedBuyerId(buyer._id)}
                      className={cn(
                        "w-full flex items-center gap-3 rounded-xl px-3 py-2 text-left transition",
                        selected
                          ? "bg-emerald-50 ring-1 ring-emerald-200"
                          : "hover:bg-neutral-50",
                      )}
                    >
                      <div className="relative w-9 h-9 rounded-full overflow-hidden bg-neutral-100 shrink-0">
                        {buyer.profileImage?.url ? (
                          <Image
                            src={buyer.profileImage.url}
                            alt={fullName}
                            fill
                            sizes="36px"
                            className="object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-semibold text-neutral-800">
                          {fullName}
                        </p>
                        <p className="text-[11.5px] text-neutral-400 capitalize">
                          Last offer: {currency}{" "}
                          {latest.amount.toLocaleString()} · {latest.status}
                        </p>
                      </div>
                      {selected && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                    </button>
                  );
                })
              )}
            </div>

            <div className="flex items-center justify-end gap-2 border-t bg-neutral-50 px-5 py-3">
              <button
                type="button"
                onClick={close}
                disabled={changeStatus.isPending}
                className="rounded-md px-3 py-1.5 text-[12.5px] font-medium text-neutral-500 transition hover:bg-neutral-100 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmSold}
                disabled={!selectedBuyerId || changeStatus.isPending}
                className="rounded-md bg-emerald-600 px-3 py-1.5 text-[12.5px] font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {changeStatus.isPending ? "Marking…" : "Mark as sold"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
