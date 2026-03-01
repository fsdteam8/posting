import { baseURL } from "@/constants";
import { useMutation } from "@tanstack/react-query";

interface Params {
  groupId: string;
  accessToken: string;
}

export function useCreateGroupPost({ groupId, accessToken }: Params) {
  return useMutation({
    mutationKey: ["create-group-post", groupId],
    mutationFn: async (body: FormData) => {
      // ← type FormData, not any
      const res = await fetch(`${baseURL}/groups/${groupId}/posts`, {
        method: "POST", // ← was missing
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
  });
}
