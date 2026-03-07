import { baseURL } from "@/constants";
import { useMutation } from "@tanstack/react-query";

interface Params {
  postId: string;
  accessToken: string;
}

export interface CreateCommentBody {
  content: string;
  mentions?: string[]; // array of user IDs
  images?: File[]; // array of image files
}

export function useCreateComment({ postId, accessToken }: Params) {
  return useMutation({
    mutationKey: ["create-comment", postId],
    mutationFn: async (body: CreateCommentBody) => {
      const formData = new FormData();

      formData.append("content", body.content);

      // Append each mention ID individually under the same key
      if (body.mentions && body.mentions.length > 0) {
        body.mentions.forEach((id) => formData.append("mentions", id));
      }

      // Append each image file individually under the same key
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
        throw new Error(err.message ?? "Failed to create comment");
      }

      return res.json();
    },
  });
}
