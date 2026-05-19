import { baseURL } from "@/constants";
import { ReelsResponse } from "@/types/features/reels";
import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { REELS_QUERY_KEY } from "./use-get-reels";

type ApiRes = {
  success: boolean;
  message: string;
  data?: {
    saved: boolean;
    postId: string;
  };
};

type Params = {
  reelId: string;
  accessToken: string;
};

export function useSaveReel({ reelId, accessToken }: Params) {
  const queryClient = useQueryClient();

  return useMutation<ApiRes, Error, void>({
    mutationKey: ["save-reel", reelId],

    mutationFn: async () => {
      const res = await fetch(`${baseURL}/posts/${reelId}/save`, {
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

    onSuccess: (data) => {
      if (!data.success) {
        toast.error(data.message);
        return;
      }

      toast.success(data.message);

      queryClient.setQueryData<InfiniteData<ReelsResponse>>(
        REELS_QUERY_KEY,
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((item) =>
                item._id === reelId
                  ? { ...item, isSaved: !item.isSaved }
                  : item,
              ),
            })),
          };
        },
      );
    },

    onError: (err) => {
      toast.error(err.message || "Could not save reel");
    },
  });
}
