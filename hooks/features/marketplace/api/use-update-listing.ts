import { baseURL } from "@/constants";
import type {
  MarketplaceListingResponse,
  UpdateListingPayload,
} from "@/types/features/marketplace";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type Vars = {
  listingId: string;
  payload: UpdateListingPayload;
};

export function useUpdateListing({ accessToken }: { accessToken: string }) {
  const queryClient = useQueryClient();

  return useMutation<MarketplaceListingResponse, Error, Vars>({
    mutationKey: ["marketplace", "update-listing"],

    mutationFn: async ({ listingId, payload }) => {
      const res = await fetch(`${baseURL}/marketplace/listings/${listingId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

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

    onSuccess: (res, { listingId }) => {
      if (!res.success) {
        toast.error(res.message);
        return;
      }

      queryClient.invalidateQueries({
        queryKey: ["marketplace", "my-listings"],
      });
      queryClient.invalidateQueries({
        queryKey: ["marketplace", "listing", listingId],
      });

      toast.success(res.message || "Listing updated successfully");
    },

    onError: (err) => {
      toast.error(err.message || "Failed to update listing");
    },
  });
}
