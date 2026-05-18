import { baseURL } from "@/constants";
import { FeedPostsResponse } from "@/types/features/feed";
import { useInfiniteQuery } from "@tanstack/react-query";

interface Params {
  accessToken: string;
  targetUserId: string;
  limit?: number;
}

export function useGetTimelinePosts({
  accessToken,
  targetUserId,
  limit = 10,
}: Params) {
  return useInfiniteQuery<FeedPostsResponse>({
    queryKey: ["timeline-posts", targetUserId],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await fetch(
        `${baseURL}/posts/timeline/${targetUserId}?page=${pageParam}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!res.ok) {
        throw new Error("Failed to fetch timeline posts");
      }

      return res.json();
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, pages } = lastPage.pagination;
      return page < pages ? page + 1 : undefined;
    },
    enabled: Boolean(accessToken) && Boolean(targetUserId),
  });
}
