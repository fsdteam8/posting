import { baseURL } from "@/constants";
import type { SavedItemsApiRes } from "@/types/features/saved";
import { useInfiniteQuery } from "@tanstack/react-query";

type Params = {
  accessToken: string;
  collectionId?: string | null;
  limit?: number;
};

export function useGetSavedPosts({
  accessToken,
  collectionId,
  limit = 12,
}: Params) {
  return useInfiniteQuery<SavedItemsApiRes, Error>({
    queryKey: ["saved-posts", collectionId ?? "all", limit],
    enabled: Boolean(accessToken),
    initialPageParam: 1,

    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams({
        page: String(pageParam),
        limit: String(limit),
      });
      if (collectionId) params.set("collectionId", collectionId);

      const res = await fetch(`${baseURL}/posts/saved/me?${params}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
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

    getNextPageParam: (lastPage) => {
      const { page, pages } = lastPage.pagination;
      return page < pages ? page + 1 : undefined;
    },

    staleTime: 1000 * 30,
  });
}
