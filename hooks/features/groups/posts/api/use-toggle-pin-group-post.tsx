"use client";

import { baseURL } from "@/constants";
import { GroupPostsResponse } from "@/types/features/posts";
import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

type ApiRes = {
  success: boolean;
  message: string;
  data?: {
    isPinned: boolean;
    postId: string;
  };
};

type Params = {
  postId: string;
  accessToken: string;
  groupId: string;
};

export function useTogglePinGroupPost({ postId, accessToken, groupId }: Params) {
  const queryClient = useQueryClient();

  return useMutation<ApiRes, Error, void>({
    mutationKey: ["toggle-pin-group-post", postId],

    mutationFn: async () => {
      const res = await fetch(
        `${baseURL}/groups/${groupId}/posts/${postId}/pin`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
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

    onSuccess: (data) => {
      if (!data.success) {
        toast.error(data.message);
        return;
      }

      toast.success(data.message);

      const nextPinned = data.data?.isPinned;

      queryClient.setQueryData<InfiniteData<GroupPostsResponse>>(
        ["group-posts", groupId],
        (old) => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((p) =>
                p._id === postId
                  ? { ...p, isPinned: nextPinned ?? !p.isPinned }
                  : p,
              ),
            })),
          };
        },
      );

      queryClient.invalidateQueries({ queryKey: ["pinned-posts-of-group"] });
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });
}
