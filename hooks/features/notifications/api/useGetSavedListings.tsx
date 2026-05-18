import { baseURL } from "@/constants";
import type { MarketplaceListing } from "@/types/features/marketplace";
import { useInfiniteQuery } from "@tanstack/react-query";

// ─── Types ────────────────────────────────────────────────────────────────────

type SavedListingsPage = {
  success: boolean;
  message: string;
  data: MarketplaceListing[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

type Params = {
  accessToken: string;
  limit?: number;
};

/**
 * Fetches the current user's saved listings with infinite scroll support.
 *
 * Data shape matches the full MarketplaceListing type — all listing fields
 * are present so the same <ListingCard> component can be reused here.
 *
 * Flatten pages for rendering:
 *   const listings = data?.pages.flatMap((p) => p.data) ?? [];
 *
 * Trigger next page from an IntersectionObserver sentinel:
 *   if (hasNextPage && !isFetchingNextPage) fetchNextPage();
 */
export function useGetSavedListings({ accessToken, limit = 10 }: Params) {
  return useInfiniteQuery<SavedListingsPage, Error>({
    queryKey: ["marketplace", "saved-listings", { limit }],

    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams({
        page: String(pageParam),
        limit: String(limit),
      });

      const res = await fetch(
        `${baseURL}/marketplace/saved/me?${params.toString()}`,
        {
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

    getNextPageParam: (lastPage) => {
      const { page, pages } = lastPage.pagination;
      return page < pages ? page + 1 : undefined;
    },

    initialPageParam: 1,
    enabled: !!accessToken,
    staleTime: 1000 * 60 * 2,
  });
}
