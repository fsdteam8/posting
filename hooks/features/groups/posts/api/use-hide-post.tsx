import { baseURL } from "@/constants";
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
  accessToken: string;
  groupId: string;
};

export function useHidePost({ postId, accessToken, groupId }: Params) {
  const queryClient = useQueryClient();

  return useMutation<ApiRes, Error>({
    mutationKey: ["hide-post", postId],

    mutationFn: async () => {
      const res = await fetch(`${baseURL}/posts/${postId}/hide`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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

    onSuccess: (res: ApiRes) => {
      if (!res.success) {
        toast.error(res.message);
        return;
      }
      // Optional: you can invalidate queries here
      // queryClient.invalidateQueries({ queryKey: ["posts"] })

      queryClient.setQueryData<InfiniteData<GroupPostsResponse>>(
        ["group-posts", groupId],
        (old) => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.filter((p) => p._id !== postId),
            })),
          };
        },
      );

      // Refresh page-posts feeds so hiding propagates to page profiles too.
      queryClient.invalidateQueries({ queryKey: ["page-posts"] });
    },
  });
}
