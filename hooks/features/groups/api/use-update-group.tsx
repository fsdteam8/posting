import { baseURL } from "@/constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface Params {
  groupId: string;
  accessToken: string;
}

export function useUpdateGroup({ groupId, accessToken }: Params) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["update-group", groupId],
    mutationFn: async (body: FormData) => {
      const res = await fetch(`${baseURL}/groups/${groupId}/manage`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          // DO NOT set Content-Type here — browser sets it automatically
          // with the correct multipart boundary for FormData
        },
        body,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Failed to update group");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group", groupId] });
    },
  });
}
