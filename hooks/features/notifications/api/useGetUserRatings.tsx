import { baseURL } from "@/constants";
import { useInfiniteQuery } from "@tanstack/react-query";

// ─── Types ────────────────────────────────────────────────────────────────────

type RaterProfile = {
  profileImage: { public_id: string; url: string };
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
};

type RatingListing = {
  _id: string;
  title: string;
  price: number;
  currency: string;
  photos: { url: string; public_id: string }[];
};

export type UserRating = {
  _id: string;
  role: "seller" | "buyer";
  ratee: string;
  rater: RaterProfile;
  listing: RatingListing;
  rating: number;
  review: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
};

type UserRatingsPage = {
  success: boolean;
  message: string;
  data: {
    summary: {
      avgRating: number;
      totalRatings: number;
    };
    ratings: UserRating[];
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

// ─── Params ───────────────────────────────────────────────────────────────────

type Params = {
  targetUserId: string | null;
  limit?: number;
};

/**
 * Fetches paginated ratings for a specific user (seller or buyer profile).
 *
 * The first page also contains a summary { avgRating, totalRatings } which
 * can be read from data.pages[0].data.summary for the profile header.
 *
 * useInfiniteQuery is used so a "load more" button or scroll trigger
 * can be added without any hook changes later.
 */
export function useGetUserRatings({ targetUserId, limit = 10 }: Params) {
  return useInfiniteQuery<UserRatingsPage, Error>({
    queryKey: ["marketplace", "user-ratings", targetUserId, { limit }],

    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams({
        page: String(pageParam),
        limit: String(limit),
      });

      const res = await fetch(
        `${baseURL}/marketplace/ratings/${targetUserId}?${params.toString()}`,
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

    getNextPageParam: (lastPage) => {
      const { page, pages } = lastPage.pagination;
      return page < pages ? page + 1 : undefined;
    },

    initialPageParam: 1,

    // Only fetch when we have a real userId to query against
    enabled: !!targetUserId,

    // Rating summaries are fairly stable — 5 min is fine
    staleTime: 1000 * 60 * 5,
  });
}
