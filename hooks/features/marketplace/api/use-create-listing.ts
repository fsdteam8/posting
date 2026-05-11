import { baseURL } from "@/constants";
import type {
  CreateListingPayload,
  MarketplaceListingResponse,
} from "@/types/features/marketplace";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useCreateListing({ accessToken }: { accessToken: string }) {
  const queryClient = useQueryClient();

  return useMutation<MarketplaceListingResponse, Error, CreateListingPayload>({
    mutationKey: ["marketplace", "create-listing"],

    mutationFn: async (payload) => {
      const res = await fetch(`${baseURL}/marketplace/listings`, {
        method: "POST",
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

    onSuccess: (res) => {
      if (!res.success) {
        toast.error(res.message);
        return;
      }

      queryClient.invalidateQueries({
        queryKey: ["marketplace", "my-listings"],
      });
      queryClient.invalidateQueries({ queryKey: ["marketplace", "listings"] });

      toast.success(res.message || "Listing created successfully");
    },

    onError: (err) => {
      toast.error(err.message || "Failed to create listing");
    },
  });
}
