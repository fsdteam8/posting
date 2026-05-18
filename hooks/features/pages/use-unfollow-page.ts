import { baseURL } from "@/constants";
import { ApiRes, Page } from "@/types/features/pages";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useUnfollowPage({
  accessToken,
  pageId,
}: {
  accessToken: string;
  pageId: string;
}) {
  const queryClient = useQueryClient();

  return useMutation<ApiRes<Page>, Error>({
    mutationKey: ["unfollow-page", pageId],

    mutationFn: async () => {
      const res = await fetch(`${baseURL}/pages/${pageId}/follow`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
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

    onSuccess: (res) => {
      if (!res.success) {
        toast.error(res.message);
        return;
      }

      queryClient.setQueryData<ApiRes<Page>>(["page", pageId], (old) => {
        if (!old || !res.data) return old;
        return { ...old, data: res.data };
      });

      queryClient.invalidateQueries({ queryKey: ["liked-pages"] });
      queryClient.invalidateQueries({ queryKey: ["discover-pages"] });

      toast.success(res.message || "Page unfollowed successfully");
    },
  });
}
