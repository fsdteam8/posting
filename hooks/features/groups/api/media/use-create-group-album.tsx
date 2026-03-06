import { baseURL } from "@/constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface Params {
  groupId: string;
  accessToken: string;
}

interface CreateAlbumBody {
  title: string;
  description?: string;
}

export function useCreateGroupAlbum({ groupId, accessToken }: Params) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["create-group-album", groupId],
    mutationFn: async (body: CreateAlbumBody) => {
      const res = await fetch(`${baseURL}/groups/${groupId}/media/albums`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Failed to create album");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group-albums", groupId] });
    },
  });
}
