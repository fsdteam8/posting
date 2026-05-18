import { baseURL } from "@/constants";
import type { ApiRes, Post } from "@/types/features/pages";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export type CreatePagePostPayload = {
  content?: string;
  title?: string;
  status?: "published" | "draft";
  visibility?: "public" | "private";
  postType?: "text" | "image" | "video" | "shared";
  tags?: string[];
  mentions?: string[];
  sharedPost?: string;
  images?: File[];
  videos?: File[];
};

export function useCreatePagePost({
  accessToken,
  pageId,
}: {
  accessToken: string;
  pageId: string;
}) {
  const queryClient = useQueryClient();

  return useMutation<ApiRes<Post>, Error, CreatePagePostPayload>({
    mutationKey: ["create-page-post", pageId],

    mutationFn: async (payload) => {
      const formData = new FormData();

      if (payload.content) formData.append("content", payload.content);
      if (payload.title) formData.append("title", payload.title);
      if (payload.status) formData.append("status", payload.status);
      if (payload.visibility) formData.append("visibility", payload.visibility);
      if (payload.postType) formData.append("postType", payload.postType);
      if (payload.sharedPost) formData.append("sharedPost", payload.sharedPost);

      if (payload.tags?.length) {
        payload.tags.forEach((tag) => formData.append("tags[]", tag));
      }

      if (payload.mentions?.length) {
        payload.mentions.forEach((mention) =>
          formData.append("mentions[]", mention),
        );
      }

      if (payload.images?.length) {
        payload.images.forEach((image) => formData.append("images", image));
      }

      if (payload.videos?.length) {
        payload.videos.forEach((video) => formData.append("videos", video));
      }

      const res = await fetch(`${baseURL}/pages/${pageId}/posts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          // NOTE: Do NOT set Content-Type manually for FormData
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

      queryClient.invalidateQueries({ queryKey: ["page-posts", pageId] });

      toast.success(res.message || "Post created successfully");
    },
  });
}
