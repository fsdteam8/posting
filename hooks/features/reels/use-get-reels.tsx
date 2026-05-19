import { baseURL } from "@/constants";
import { ReelsResponse } from "@/types/features/reels";
import { useInfiniteQuery } from "@tanstack/react-query";

interface Params {
  accessToken: string;
  limit?: number;
}

export const REELS_QUERY_KEY = ["reels"] as const;

export function useGetReels({ accessToken, limit = 5 }: Params) {
  return useInfiniteQuery<ReelsResponse>({
    queryKey: REELS_QUERY_KEY,
    queryFn: async ({ pageParam = 1 }) => {
      const res = await fetch(
        `${baseURL}/posts?postType=reel&page=${pageParam}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!res.ok) {
        let message = `Failed to fetch reels (${res.status})`;
        try {
          const body = await res.json();
          message = body?.message ?? message;
        } catch {}
        throw new Error(message);
      }

      return res.json();
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, pages } = lastPage.pagination;
      return page < pages ? page + 1 : undefined;
    },
    enabled: Boolean(accessToken),
    staleTime: 30_000,
  });
}
