import { baseURL } from "@/constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type SaveToggleResponse = {
  success: boolean;
  message: string;
  data: {
    saved: boolean;
    listingId: string;
  };
};

/**
 * Toggles save/unsave on a listing.
 * The API handles the toggle logic — one endpoint for both directions.
 *
 * Cache updates:
 *  - Invalidates the single listing cache so the saves count stays fresh.
 *  - Invalidates saved listings so the saved page reflects the change.
 */
export function useSaveListing({ accessToken }: { accessToken: string }) {
  const queryClient = useQueryClient();

  return useMutation<SaveToggleResponse, Error, string>({
    mutationKey: ["marketplace", "save-listing"],

    mutationFn: async (listingId) => {
      const res = await fetch(
        `${baseURL}/marketplace/listings/${listingId}/save`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` },
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

    onSuccess: (res, listingId) => {
      if (!res.success) {
        toast.error(res.message);
        return;
      }

      // Refresh the individual listing (saves count changes)
      queryClient.invalidateQueries({
        queryKey: ["marketplace", "listing", listingId],
      });
      // Refresh saved listings page
      queryClient.invalidateQueries({
        queryKey: ["marketplace", "saved-listings"],
      });

      toast.success(res.data.saved ? "Listing saved" : "Listing unsaved");
    },

    onError: (err) => {
      toast.error(err.message || "Failed to save listing");
    },
  });
}
