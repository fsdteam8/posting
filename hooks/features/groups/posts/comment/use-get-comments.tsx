import { baseURL } from "@/constants";
import { GetCommentsResponse } from "@/types/features/posts/comments";
import { useInfiniteQuery } from "@tanstack/react-query";

interface Params {
  postId: string;
  accessToken: string;
  limit?: number;
}

export function useGetComments({ postId, accessToken, limit = 10 }: Params) {
  return useInfiniteQuery<GetCommentsResponse>({
    queryKey: ["post-comments", postId],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await fetch(
        `${baseURL}/comments/post/${postId}?page=${pageParam}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!res.ok) {
        throw new Error("Failed to fetch comments");
      }

      return res.json();
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, pages } = lastPage.pagination;
      return page < pages ? page + 1 : undefined;
    },
    enabled: Boolean(postId && accessToken),
  });
}
