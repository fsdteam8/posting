import { baseURL } from "@/constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type SharePostBody = {
  content: string;
  visibility: "public" | "friends" | "private";
  status: "published" | "draft";
};

type SharedPostData = {
  _id: string;
  id: string;
  content: string;
  postType: string;
  sharedPost: string;
  sharedMessage: string;
  author: string;
  status: string;
  visibility: string;
  views: number;
  reactionCount: number;
  saveCount: number;
  shareCount: number;
  commentCount: number;
  allowComments: boolean;
  isPinned: boolean;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
};

type SharePostRes = {
  success: boolean;
  message: string;
  data?: SharedPostData;
};

type UseSharePostParams = {
  accessToken: string;
  postId: string;
};

export function useSharePost({ accessToken, postId }: UseSharePostParams) {
  const queryClient = useQueryClient();

  return useMutation<SharePostRes, Error, SharePostBody>({
    mutationKey: ["share-post", postId],

    mutationFn: async (body: SharePostBody) => {
      const res = await fetch(`${baseURL}/posts/${postId}/share`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        let message = `Request failed (${res.status})`;
        try {
          const errBody = await res.json();
          message = errBody?.message ?? message;
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

      // Invalidate the feed or posts list so share count updates
      queryClient.invalidateQueries({ queryKey: ["posts"] });

      // Optionally invalidate the specific post to refresh its shareCount
      queryClient.invalidateQueries({ queryKey: ["post", postId] });

      toast.success(res.message || "Post shared successfully");
    },

    onError: (error) => {
      toast.error(error.message || "Something went wrong");
    },
  });
}
