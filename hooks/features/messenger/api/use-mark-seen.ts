import { baseURL } from "@/constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface Params {
  accessToken: string;
}

export function useMarkConversationSeen({ accessToken }: Params) {
  const qc = useQueryClient();
  return useMutation<unknown, Error, { conversationId: string }>({
    mutationKey: ["messenger", "mark-seen"],
    mutationFn: async ({ conversationId }) => {
      const res = await fetch(
        `${baseURL}/messages/conversations/${conversationId}/seen`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      if (!res.ok) {
        let msg = `Request failed (${res.status})`;
        try {
          const body = await res.json();
          msg = body?.message ?? msg;
        } catch {}
        throw new Error(msg);
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["messenger", "conversations"] });
    },
  });
}
