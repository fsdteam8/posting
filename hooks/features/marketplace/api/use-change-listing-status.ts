import { baseURL } from "@/constants";
import type { ListingStatus } from "@/types/features/marketplace";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type ApiRes = {
  success: boolean;
  message: string;
};

type Variables = {
  listingId: string;
  status: ListingStatus;
  /** Required when status === "sold" — the buyer's user id. */
  soldTo?: string;
};

/**
 * Updates a marketplace listing's status (available / pending / sold / shipped / archived).
 *
 * When marking a listing as "sold", pass `soldTo` with the buyer's user id so
 * the listing records who the item went to — important when several buyers
 * have been negotiating on the same listing in marketplace chats.
 */
export function useChangeListingStatus({
  accessToken,
}: {
  accessToken: string;
}) {
  const queryClient = useQueryClient();

  return useMutation<ApiRes, Error, Variables>({
    mutationKey: ["marketplace", "change-listing-status"],

    mutationFn: async ({ listingId, status, soldTo }) => {
      const res = await fetch(
        `${baseURL}/marketplace/listings/${listingId}/status`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status, ...(soldTo ? { soldTo } : {}) }),
        },
      );

      if (!res.ok) {
        let message = `Request failed (${res.status})`;
        try {
          const body = await res.json();
          message = body?.message ?? message;
        } catch {}
        throw new Error(message);
      }

      return res.json();
    },

    onSuccess: (res, vars) => {
      if (!res.success) {
        toast.error(res.message);
        return;
      }

      // Refresh anything that could be showing this listing or its status badge
      queryClient.invalidateQueries({
        queryKey: ["marketplace", "listing", vars.listingId],
      });
      queryClient.invalidateQueries({
        queryKey: ["marketplace", "my-listings"],
      });
      queryClient.invalidateQueries({ queryKey: ["marketplace", "listings"] });
      // The conversation list shows the listing badge ("Available" / "Sold"),
      // so refresh it too.
      queryClient.invalidateQueries({
        queryKey: ["messenger", "conversations"],
      });

      toast.success(
        vars.status === "sold"
          ? "Marked as sold"
          : res.message || "Listing status updated",
      );
    },

    onError: (err) => {
      toast.error(err.message || "Failed to update listing status");
    },
  });
}
