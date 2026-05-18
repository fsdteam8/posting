import { baseURL } from "@/constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

export type OfferAction = "accept" | "reject" | "counter";

type RespondToOfferVariables = {
  offerId: string;
  action: OfferAction;
  /** Required only when action === "counter" */
  counterAmount?: number;
};

type RespondToOfferResponse = {
  success: boolean;
  message: string;
  data: {
    _id: string;
    listing: { _id: string } | string;
    status: string;
    counterAmount: number | null;
    respondedAt: string;
  };
};

const SUCCESS_MESSAGES: Record<OfferAction, string> = {
  accept: "Offer accepted",
  reject: "Offer rejected",
  counter: "Counter offer sent",
};

/**
 * Allows the seller to respond to an incoming offer.
 *
 * Actions:
 *   "accept"  → offer.status becomes "accepted"
 *   "reject"  → offer.status becomes "rejected"
 *   "counter" → offer.status becomes "countered"; counterAmount required
 *
 * Cache: invalidates my-offers and the relevant listing detail.
 */
export function useRespondToOffer({ accessToken }: { accessToken: string }) {
  const queryClient = useQueryClient();

  return useMutation<RespondToOfferResponse, Error, RespondToOfferVariables>({
    mutationKey: ["marketplace", "respond-to-offer"],

    mutationFn: async ({ offerId, action, counterAmount }) => {
      const res = await fetch(
        `${baseURL}/marketplace/offers/${offerId}/respond`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action,
            // Only include counterAmount when countering — avoids sending null
            ...(action === "counter" && counterAmount !== undefined
              ? { counterAmount }
              : {}),
          }),
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

    onSuccess: (res, { action }) => {
      if (!res.success) {
        toast.error(res.message);
        return;
      }

      queryClient.invalidateQueries({
        queryKey: ["marketplace", "my-offers"],
      });

      // listing may be a full object or just an id string depending on action
      const listingId =
        typeof res.data.listing === "string"
          ? res.data.listing
          : res.data.listing._id;

      queryClient.invalidateQueries({
        queryKey: ["marketplace", "listing", listingId],
      });

      toast.success(res.message || SUCCESS_MESSAGES[action]);
    },

    onError: (err) => {
      toast.error(err.message || "Failed to respond to offer");
    },
  });
}
