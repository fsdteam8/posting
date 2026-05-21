"use client";

import { baseURL } from "@/constants";
import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { FriendsNotInGroupResponse } from "./use-get-friends-not-in-group";

type ApiRes = {
  success: boolean;
  message: string;
  data?: { groupId: string; userId: string };
};

interface Params {
  groupId: string;
  accessToken: string;
}

export function useInviteToGroup({ groupId, accessToken }: Params) {
  const queryClient = useQueryClient();

  return useMutation<ApiRes, Error, string>({
    mutationKey: ["invite-to-group", groupId],

    mutationFn: async (userId) => {
      const res = await fetch(
        `${baseURL}/groups/${groupId}/invite/${userId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
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

    onSuccess: (data, userId) => {
      if (!data.success) {
        toast.error(data.message);
        return;
      }

      toast.success(data.message || "Invitation sent");

      queryClient.setQueryData<InfiniteData<FriendsNotInGroupResponse>>(
        ["friends-not-in-group", groupId],
        (old) => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.filter((friend) => friend._id !== userId),
            })),
          };
        },
      );

      queryClient.invalidateQueries({ queryKey: ["group", groupId] });
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });
}
