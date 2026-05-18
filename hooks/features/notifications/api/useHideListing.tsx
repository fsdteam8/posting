import { baseURL } from "@/constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type HideToggleResponse = {
  success: boolean;
  message: string;
  data: {
    hidden: boolean;
    listingId: string;
  };
};

/**
 * Toggles hide/unhide on a listing for the current user.
 * Hidden listings are filtered out of the user's browse feed.
 *
 * Cache: invalidates the browse grid and the individual listing entry.
 */
export function useHideListing({ accessToken }: { accessToken: string }) {
  const queryClient = useQueryClient();

  return useMutation<HideToggleResponse, Error, string>({
    mutationKey: ["marketplace", "hide-listing"],

    mutationFn: async (listingId) => {
      const res = await fetch(
        `${baseURL}/marketplace/listings/${listingId}/hide`,
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

      queryClient.invalidateQueries({
        queryKey: ["marketplace", "listing", listingId],
      });
      // Remove from browse grid immediately
      queryClient.invalidateQueries({
        queryKey: ["marketplace", "listings"],
      });

      toast.success(res.data.hidden ? "Listing hidden" : "Listing unhidden");
    },

    onError: (err) => {
      toast.error(err.message || "Failed to hide listing");
    },
  });
}
