import { baseURL } from "@/constants";
import type { PaginatedApiRes, Post } from "@/types/features/pages";
import { useQuery } from "@tanstack/react-query";

export function useGetPagePosts({
  accessToken,
  pageId,
  page = 1,
  limit = 10,
}: {
  accessToken: string;
  pageId: string;
  page?: number;
  limit?: number;
}) {
  return useQuery<PaginatedApiRes<Post[]>, Error>({
    queryKey: ["page-posts", pageId, page, limit],

    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
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

    enabled: Boolean(accessToken) && Boolean(pageId),
  });
}
