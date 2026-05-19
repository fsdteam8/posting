import { baseURL } from "@/constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface Params {
  accessToken: string;
  pageId: string;
}

export function useCreatePagePostForm({ accessToken, pageId }: Params) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["create-page-post-form", pageId],

    mutationFn: async (body: FormData) => {
      const res = await fetch(`${baseURL}/pages/${pageId}/posts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          // Do not set Content-Type; browser sets multipart boundary.
        },
        body,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Failed to create post");
      }

      return res.json();
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["page-posts", pageId] });
    },
  });
}
