import { baseURL } from "@/constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UseDeleteReplyOptions {
  replyId: string;
  postId: string;
  accessToken: string;
}

export function useDeleteReply({
  replyId,
  postId,
  accessToken,
}: UseDeleteReplyOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["delete-reply", replyId],
    mutationFn: async () => {
      const res = await fetch(`${baseURL}/comments/${replyId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Failed to delete reply");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post-comments", postId] });
    },
  });
}
