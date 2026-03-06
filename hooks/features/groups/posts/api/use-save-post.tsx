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
  data?: {
    saved: boolean;
    postId: string;
  };
};

type Params = {
  postId: string;
  accessToken: string;
  groupId: string;
};

export function useSavePost({ postId, accessToken, groupId }: Params) {
  const queryClient = useQueryClient();

  return useMutation<ApiRes, Error, void>({
    mutationKey: ["save-post", postId],

    mutationFn: async () => {
      const res = await fetch(`${baseURL}/posts/${postId}/save`, {
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

    onSuccess: (data: ApiRes) => {
      if (!data.success) {
        toast.error(data.message);
        return;
      }

      // handle success
      toast.success(data.message);

      // ✅ Update infinite query cache
      queryClient.setQueryData<InfiniteData<GroupPostsResponse>>(
        ["group-posts", groupId],
        (old) => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((p) =>
                p._id === postId ? { ...p, isSaved: !p.isSaved } : p,
              ),
            })),
          };
        },
      );
    },
  });
}
