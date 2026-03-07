"use client";

import { baseURL } from "@/constants";
import { GetCommentsResponse } from "@/types/features/posts/comments";
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
  commentId: string;
  postId: string;
  accessToken: string;
};

export function useDeleteComment({ commentId, postId, accessToken }: Params) {
  const queryClient = useQueryClient();

  return useMutation<ApiRes, Error>({
    mutationKey: ["delete-comment", commentId],

    mutationFn: async () => {
      const res = await fetch(`${baseURL}/comments/${commentId}`, {
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

      toast.success("Comment deleted");

      // ✅ Remove comment from infinite query cache
      queryClient.setQueryData<InfiniteData<GetCommentsResponse>>(
        ["post-comments", postId],
        (old) => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.filter((comment) => comment._id !== commentId),
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
