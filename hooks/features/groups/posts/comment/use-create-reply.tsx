import { baseURL } from "@/constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UseCreateReplyOptions {
  postId: string;
  accessToken: string;
}

export interface CreateReplyBody {
  content: string;
  parentComment: string;
  mentions?: string[];
  images?: File[];
}

export function useCreateReply({ postId, accessToken }: UseCreateReplyOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["create-reply", postId],
    mutationFn: async (body: CreateReplyBody) => {
      const formData = new FormData();

      formData.append("content", body.content);
      formData.append("parentComment", body.parentComment);

      if (body.mentions && body.mentions.length > 0) {
        body.mentions.forEach((id) => formData.append("mentions", id));
      }

      if (body.images && body.images.length > 0) {
        body.images.forEach((file) => formData.append("images", file));
      }

      const res = await fetch(`${baseURL}/comments/${postId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          // DO NOT set Content-Type — browser sets it automatically
          // with the correct multipart boundary for FormData
        },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Failed to create reply");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post-comments", postId] });
    },
  });
}
