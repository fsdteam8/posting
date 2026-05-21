import { baseURL } from "@/constants";
import type { ToggleSavePostApiRes } from "@/types/features/saved";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type Params = { accessToken: string };

type Payload = {
  postId: string;
  collectionId?: string | null;
};

export function useToggleSavePost({ accessToken }: Params) {
  const queryClient = useQueryClient();

  return useMutation<ToggleSavePostApiRes, Error, Payload>({
    mutationKey: ["toggle-save-post"],

    mutationFn: async ({ postId, collectionId }) => {
      const res = await fetch(`${baseURL}/posts/${postId}/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(collectionId ? { collectionId } : {}),
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
      queryClient.invalidateQueries({ queryKey: ["saved-posts"] });
      queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
      queryClient.invalidateQueries({ queryKey: ["group-posts"] });
      queryClient.invalidateQueries({ queryKey: ["page-posts"] });
    },

    onError: (err) => {
      toast.error(err.message || "Failed to update saved item");
    },
  });
}
