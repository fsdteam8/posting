"use client";

import { baseURL } from "@/constants";
import { Pagination } from "@/types";
import { ProfileImage } from "@/types/features/groups";
import { useInfiniteQuery } from "@tanstack/react-query";

export interface InvitableFriend {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  profileImage?: ProfileImage;
}

export interface FriendsNotInGroupResponse {
  success: boolean;
  message: string;
  data: InvitableFriend[];
  pagination: Pagination;
}

interface Params {
  groupId: string;
  accessToken: string;
  limit?: number;
  enabled?: boolean;
}

export function useGetFriendsNotInGroup({
  groupId,
  accessToken,
  limit = 20,
  enabled = true,
}: Params) {
  return useInfiniteQuery<FriendsNotInGroupResponse>({
    queryKey: ["friends-not-in-group", groupId],
    enabled: Boolean(groupId && accessToken && enabled),

    queryFn: async ({ pageParam }) => {
      const page = (pageParam as number) ?? 1;

      const res = await fetch(
        `${baseURL}/groups/${groupId}/friends-not-in-group?page=${page}&limit=${limit}`,
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
