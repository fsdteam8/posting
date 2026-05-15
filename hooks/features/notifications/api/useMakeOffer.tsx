import { baseURL } from "@/constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

type OfferBuyer = {
  profileImage: { public_id: string; url: string };
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
};

type Offer = {
  _id: string;
  listing: string;
  buyer: OfferBuyer;
  seller: string;
  amount: number;
  currency: string;
  message: string;
  status:
    | "pending"
    | "accepted"
    | "rejected"
    | "cancelled"
    | "countered"
    | "expired";
  counterAmount: number | null;
  expiresAt: string | null;
  respondedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type MakeOfferResponse = {
  success: boolean;
  message: string;
  data: Offer;
};

type MakeOfferVariables = {
  listingId: string;
  amount: number;
  message?: string;
};

/**
 * Submits a price offer on a marketplace listing.
 *
 * Cache: invalidates the listing detail (offersCount increments server-side)
 * and the user's own offers list.
 */
export function useMakeOffer({ accessToken }: { accessToken: string }) {
  const queryClient = useQueryClient();

  return useMutation<MakeOfferResponse, Error, MakeOfferVariables>({
    mutationKey: ["marketplace", "make-offer"],

    mutationFn: async ({ listingId, amount, message }) => {
      const res = await fetch(
        `${baseURL}/marketplace/listings/${listingId}/offers`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ amount, message }),
        },
      );

      if (!res.ok) {
        let msg = `Request failed (${res.status})`;
        try {
          const body = await res.json();
          msg = body?.message ?? msg;
        } catch {}
        throw new Error(msg);
      }

      return res.json();
    },

    onSuccess: (res, { listingId }) => {
      if (!res.success) {
        toast.error(res.message);
        return;
      }

      queryClient.invalidateQueries({
        queryKey: ["marketplace", "listing", listingId],
      });
      queryClient.invalidateQueries({
        queryKey: ["marketplace", "my-offers"],
      });

      toast.success(res.message || "Offer submitted");
    },

    onError: (err) => {
      toast.error(err.message || "Failed to submit offer");
    },
  });
}
