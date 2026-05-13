import { baseURL } from "@/constants";
import type {
  BrowseListingsPage,
  BrowseListingsParams,
} from "@/types/features/marketplace";
import { useInfiniteQuery } from "@tanstack/react-query";

/**
 * Fetches paginated marketplace listings with infinite scroll support.
 *
 * Uses useInfiniteQuery so each "load more" appends the next page to the
 * existing data instead of replacing it. The component just calls
 * fetchNextPage() when the user reaches the bottom.
 *
 * Query params supported by the API:
 *   - page      (managed internally by useInfiniteQuery)
 *   - limit     (default 10)
 *   - q         (full-text search)
 *   - category  (filter by category string)
 *   - sortBy    ("recent" | "price_asc" | "price_desc")
 *
 * queryKey includes all filter params so changing search/category/sort
 * automatically resets to page 1 and refetches from scratch.
 */
export function useBrowseListings(params: BrowseListingsParams = {}) {
  const { limit = 10, q, category, sortBy = "recent" } = params;

  return useInfiniteQuery<BrowseListingsPage, Error>({
    queryKey: ["marketplace", "listings", { q, category, sortBy, limit }],

    queryFn: async ({ pageParam = 1 }) => {
      // Build query string — omit empty/undefined values so the URL stays clean
      const search = new URLSearchParams({
        page: String(pageParam),
        limit: String(limit),
        sortBy,
        ...(q ? { q } : {}),
        ...(category ? { category } : {}),
      });

      const res = await fetch(
        `${baseURL}/marketplace/listings?${search.toString()}`,
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

    // pageParam for the next fetch — return undefined when we are on the last page
    // so hasNextPage becomes false and the "Load more" trigger stops firing.
    getNextPageParam: (lastPage) => {
      const { page, pages } = lastPage.pagination;
      return page < pages ? page + 1 : undefined;
    },

    // Start at page 1 on every fresh query
    initialPageParam: 1,

    // Keep fetched pages in cache for 2 minutes before going stale.
    // Shorter than meta (10 min) because listing inventory changes more often.
    staleTime: 1000 * 60 * 2,
  });
}
