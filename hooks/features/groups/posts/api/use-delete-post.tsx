"use client";

import { baseURL } from "@/constants";
import { FeedPostsResponse } from "@/types/features/feed";
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
};

type Params = {
  postId: string;
  groupId: string;
  accessToken: string;
};

export function useDeletePost({ postId, groupId, accessToken }: Params) {
  const queryClient = useQueryClient();

  return useMutation<ApiRes, Error>({
    mutationKey: ["delete-post", postId],

    mutationFn: async () => {
      const res = await fetch(`${baseURL}/posts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
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

    onSuccess: (res) => {
      if (!res.success) {
        toast.error(res.message);
        return;
      }

      toast.success("Post deleted");

      // ✅ Remove post from infinite query cache
      queryClient.setQueryData<InfiniteData<GroupPostsResponse>>(
        ["group-posts", groupId],
        (old) => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.filter((post) => post._id !== postId),
            })),
          };
        },
      );

      // ✅ Remove from feed-posts cache (always)
      queryClient.setQueryData<InfiniteData<FeedPostsResponse>>(
        ["feed-posts"],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.filter((post) => post._id !== postId),
            })),
          };
        },
      );
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });
}
