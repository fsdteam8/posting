import { baseURL } from "@/constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

export type RatingRole = "seller" | "buyer";

type RatingVariables = {
  listingId: string;
  role: RatingRole;
  rating: number; // 1–5
  review?: string;
};

type RatingResponse = {
  success: boolean;
  message: string;
  data: {
    _id: string;
    role: RatingRole;
    ratee: string;
    rater: string;
    listing: string;
    rating: number;
    review: string;
    createdAt: string;
    updatedAt: string;
  };
};

/**
 * Submits a star rating and optional review for a seller or buyer
 * after a transaction on a specific listing.
 *
 * role "seller" → the current user is rating the seller
 * role "buyer"  → the current user is rating the buyer
 *
 * Cache: invalidates user ratings for the ratee so their profile
 * summary updates immediately if it is visible.
 */
export function useRateUser({ accessToken }: { accessToken: string }) {
  const queryClient = useQueryClient();

  return useMutation<RatingResponse, Error, RatingVariables>({
    mutationKey: ["marketplace", "rate-user"],

    mutationFn: async ({ listingId, role, rating, review }) => {
      const res = await fetch(
        `${baseURL}/marketplace/listings/${listingId}/ratings`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role, rating, review }),
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

      // Refresh ratings for the person who was rated
      queryClient.invalidateQueries({
        queryKey: ["marketplace", "user-ratings", res.data.ratee],
      });

      toast.success(res.message || "Rating submitted");
    },

    onError: (err) => {
      toast.error(err.message || "Failed to submit rating");
    },
  });
}
