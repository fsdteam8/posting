"use client";

/**
 * SellerInfoCard
 *
 * Shows the seller's avatar, name, username, and their marketplace rating.
 * The "Message" button triggers the useMessageSeller mutation and navigates
 * to the conversation on success.
 */

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMessageSeller } from "@/hooks/features/notifications/api/useMessageSeller";
import type { ListingSeller } from "@/types/features/marketplace";
import { MessageCircle, Star, User } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

type SellerRating = {
  avgRating: number;
  totalRatings: number;
};

type Props = {
  seller: ListingSeller;
  sellerRating: SellerRating;
  listingId: string;
  accessToken: string;
  /** Hide message box when the current user IS the seller */
  isSeller: boolean;
};

export function SellerInfoCard({
  seller,
  sellerRating,
  listingId,
  accessToken,
  isSeller,
}: Props) {
  const router = useRouter();
  const [showMessageBox, setShowMessageBox] = useState(false);
  const [messageText, setMessageText] = useState("");

  const { mutate: messageSeller, isPending } = useMessageSeller({
    accessToken,
  });

  function handleSendMessage() {
    if (!messageText.trim()) return;

    messageSeller(
      { listingId, message: messageText.trim() },
      {
        onSuccess: (res) => {
          if (res.success) {
            router.push(`/messenger/${res.data.conversationId}`);
          }
        },
      },
    );
  }

  const fullName = `${seller.firstName} ${seller.lastName}`.trim();

  return (
    <div className="rounded-xl border border-neutral-100 bg-white p-4 space-y-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
        Seller information
      </p>

      {/* ── Seller profile row ─────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <button
          onClick={() => router.push(`/marketplace/seller/${seller._id}`)}
          className="relative w-10 h-10 rounded-full overflow-hidden bg-neutral-100 shrink-0 cursor-pointer hover:ring-2 hover:ring-neutral-200 transition"
          aria-label={`View ${fullName}'s profile`}
        >
          {seller.profileImage?.url ? (
            <Image
              src={seller.profileImage.url}
              alt={fullName}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User className="w-5 h-5 text-neutral-400" />
            </div>
          )}
        </button>

        {/* Name + username */}
        <button
          onClick={() => router.push(`/marketplace/seller/${seller._id}`)}
          className="flex-1 min-w-0 text-left cursor-pointer"
        >
          <p className="text-[13px] font-semibold text-neutral-800 truncate hover:underline">
            {fullName}
          </p>
          <p className="text-[12px] text-neutral-400 truncate">
            @{seller.username}
          </p>
        </button>

        {/* View profile link */}
        <button
          onClick={() => router.push(`/marketplace/seller/${seller._id}`)}
          className="text-[12px] text-blue-600 hover:text-blue-700 font-medium shrink-0"
        >
          View profile
        </button>
      </div>

      {/* ── Rating summary ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5">
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-3.5 h-3.5 ${
                i < Math.round(sellerRating.avgRating)
                  ? "fill-amber-400 text-amber-400"
                  : "text-neutral-200"
              }`}
            />
          ))}
        </div>
        <span className="text-[12px] text-neutral-500">
          {sellerRating.avgRating > 0
            ? `${sellerRating.avgRating.toFixed(1)} · ${sellerRating.totalRatings} rating${sellerRating.totalRatings !== 1 ? "s" : ""}`
            : "No ratings yet"}
        </span>
      </div>

      {/* ── Message seller ─────────────────────────────────────────────── */}
      {/* Hidden when viewing your own listing */}
      {!isSeller && (
        <div className="space-y-2">
          {showMessageBox ? (
            <>
              <Textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Hi, is this still available?"
                className="resize-none text-[13px] min-h-18"
                rows={3}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 h-8 text-[12.5px]"
                  onClick={handleSendMessage}
                  disabled={isPending || !messageText.trim()}
                >
                  {isPending ? "Sending..." : "Send message"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-[12.5px]"
                  onClick={() => {
                    setShowMessageBox(false);
                    setMessageText("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <Button
              variant="outline"
              className="w-full h-9 text-[13px] gap-2"
              onClick={() => setShowMessageBox(true)}
            >
              <MessageCircle className="w-4 h-4" />
              Message seller
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
