import { baseURL } from "@/constants";
import { FeedPostsResponse } from "@/types/features/feed";
import { useInfiniteQuery } from "@tanstack/react-query";

interface Params {
  accessToken: string;
  limit?: number;
}

export function useGetFeedPosts({ accessToken, limit = 10 }: Params) {
  return useInfiniteQuery<FeedPostsResponse>({
    queryKey: ["feed-posts"],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await fetch(
        `${baseURL}/posts?page=${pageParam}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!res.ok) {
        throw new Error("Failed to fetch posts");
      }

      return res.json();
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, pages } = lastPage.pagination;
      return page < pages ? page + 1 : undefined;
    },
    enabled: Boolean(accessToken),
  });
}
