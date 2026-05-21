import { baseURL } from "@/constants";
import type { CollectionApiRes } from "@/types/features/saved";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type Params = { accessToken: string };

export function useDeleteCollection({ accessToken }: Params) {
  const queryClient = useQueryClient();

  return useMutation<CollectionApiRes, Error, string>({
    mutationKey: ["delete-collection"],

    mutationFn: async (collectionId: string) => {
      const res = await fetch(`${baseURL}/collections/${collectionId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
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
      toast.success(data.message || "Collection deleted");
      queryClient.invalidateQueries({ queryKey: ["collections", "me"] });
      queryClient.invalidateQueries({ queryKey: ["saved-posts"] });
    },

    onError: (err) => {
      toast.error(err.message || "Failed to delete collection");
    },
  });
}
