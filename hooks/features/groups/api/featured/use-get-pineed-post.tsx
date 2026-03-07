"use client";

import { baseURL } from "@/constants";
import { GroupPostsResponse } from "@/types/features/posts";

import { useInfiniteQuery } from "@tanstack/react-query";

interface Params {
  accessToken: string;
  groupId: string;
  limit?: number;
}

export function useGetPinnedPostOfGroup({
  accessToken,
  groupId,
  limit = 10,
}: Params) {
  return useInfiniteQuery<GroupPostsResponse>({
    queryKey: ["pinned-posts-of-group", groupId, accessToken],
    enabled: !!accessToken && !!groupId,

    queryFn: async ({ pageParam }) => {
      const page = (pageParam as number) ?? 1;

      const res = await fetch(
        `${baseURL}/groups/${groupId}/posts/pinned?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
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

    initialPageParam: 1,

    getNextPageParam: (lastPage) => {
      const { page, pages } = lastPage.pagination;
      return page < pages ? page + 1 : undefined;
    },

    staleTime: 30_000,
    retry: 1,
  });
}
