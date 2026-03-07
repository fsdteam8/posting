"use client";

import { baseURL } from "@/constants";
import { GroupPostsResponse, Post } from "@/types/features/posts";
import type { InfiniteData } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type ApiRes = {
  success: boolean;
  message: string;
  data?: Post;
};

type Params = {
  postId: string;
  groupId: string;
  accessToken: string;
};

export function useEditPost({ postId, groupId, accessToken }: Params) {
  const queryClient = useQueryClient();

  return useMutation<ApiRes, Error, FormData>({
    mutationKey: ["edit-post", postId],

    mutationFn: async (formData) => {
      const res = await fetch(`${baseURL}/posts/${postId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          // ❌ DO NOT set Content-Type when using FormData
        },
        body: formData,
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

      const updatedPost = res.data;
      if (!updatedPost) {
        toast.error("Post updated but no post returned.");
        return;
      }

      toast.success("Post updated");

      // ✅ Update infinite query cache
      if (groupId) {
        queryClient.setQueryData<InfiniteData<GroupPostsResponse>>(
          ["group-posts", groupId],
          (old) => {
            if (!old) return old;

            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                data: page.data.map((p) =>
                  p._id === postId ? updatedPost : p,
                ),
              })),
            };
          },
        );
      }

      queryClient.invalidateQueries({ queryKey: ["pinned-posts-of-group"] });
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });
}
