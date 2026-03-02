import { baseURL } from "@/constants";
import { GroupPostsResponse } from "@/types/features/posts";
import { useInfiniteQuery } from "@tanstack/react-query";

interface Params {
  groupId: string;
  accessToken: string;
  limit?: number;
}

export function useGetGroupPosts({ groupId, accessToken, limit = 10 }: Params) {
  return useInfiniteQuery<GroupPostsResponse>({
    queryKey: ["group-posts", groupId],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await fetch(
        `${baseURL}/groups/${groupId}/posts?page=${pageParam}&limit=${limit}`,
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
      const { page, total } = lastPage.pagination;
      return page < total ? page + 1 : undefined;
    },
    enabled: Boolean(groupId && accessToken),
  });
}
