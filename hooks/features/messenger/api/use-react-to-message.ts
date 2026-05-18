import { baseURL } from "@/constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface Params {
  accessToken: string;
}

interface Body {
  conversationId: string;
  messageId: string;
  emoji: string;
}

export function useReactToMessage({ accessToken }: Params) {
  const qc = useQueryClient();

  return useMutation<unknown, Error, Body>({
    mutationKey: ["messenger", "react"],
    mutationFn: async ({ conversationId, messageId, emoji }) => {
      const res = await fetch(
        `${baseURL}/messages/conversations/${conversationId}/messages/${messageId}/react`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ emoji }),
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
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({
        queryKey: ["messenger", "messages", vars.conversationId],
      });
    },
    onError: (err) => toast.error(err.message),
  });
}
