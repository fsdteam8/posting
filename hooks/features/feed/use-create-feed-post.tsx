import { baseURL } from "@/constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface Params {
  accessToken: string;
}

export function useCreateFeedPost({ accessToken }: Params) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["create-feed-post"],
    mutationFn: async (body: FormData) => {
      // ← type FormData, not any
      const res = await fetch(`${baseURL}/posts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          // DO NOT set Content-Type here — browser sets it automatically
          // with the correct multipart boundary for FormData
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
      queryClient.invalidateQueries({
        queryKey: ["timeline-posts", "feed-posts"],
      });
    },
  });
}
