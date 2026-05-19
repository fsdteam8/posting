import { baseURL } from "@/constants";
import type { PaginatedApiRes } from "@/types/features/pages";
import type { Post } from "@/types/features/posts";
import { useInfiniteQuery } from "@tanstack/react-query";

export function useGetPagePostsInfinite({
  accessToken,
  pageId,
  limit = 20,
}: {
  accessToken: string;
  pageId: string;
  limit?: number;
}) {
  return useInfiniteQuery<PaginatedApiRes<Post[]>, Error>({
    queryKey: ["page-posts-infinite", pageId, limit],
    enabled: Boolean(accessToken) && Boolean(pageId),
    initialPageParam: 1,

    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams({
        page: String(pageParam),
        limit: String(limit),
      });

      const res = await fetch(`${baseURL}/pages/${pageId}/posts?${params}`, {
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
  });
}
