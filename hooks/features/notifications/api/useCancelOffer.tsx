import { baseURL } from "@/constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type CancelOfferResponse = {
  success: boolean;
  message: string;
  data: {
    _id: string;
    listing: string;
    status: "cancelled";
    respondedAt: string;
  };
};

/**
 * Cancels a pending offer. Only the buyer who created the offer can cancel it.
 *
 * Cache: invalidates my-offers list so the cancelled offer disappears or
 * updates its status chip immediately.
 */
export function useCancelOffer({ accessToken }: { accessToken: string }) {
  const queryClient = useQueryClient();

  return useMutation<CancelOfferResponse, Error, string>({
    mutationKey: ["marketplace", "cancel-offer"],

    // Variable is the offerId
    mutationFn: async (offerId) => {
      const res = await fetch(
        `${baseURL}/marketplace/offers/${offerId}/cancel`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${accessToken}` },
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

    onSuccess: (res) => {
      if (!res.success) {
        toast.error(res.message);
        return;
      }

      queryClient.invalidateQueries({
        queryKey: ["marketplace", "my-offers"],
      });
      // Also refresh the listing detail in case offersCount changed
      queryClient.invalidateQueries({
        queryKey: ["marketplace", "listing", res.data.listing],
      });

      toast.success(res.message || "Offer cancelled");
    },

    onError: (err) => {
      toast.error(err.message || "Failed to cancel offer");
    },
  });
}
