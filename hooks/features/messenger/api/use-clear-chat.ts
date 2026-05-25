import { baseURL } from "@/constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface Params {
  accessToken: string;
}

interface Response {
  success: boolean;
  message: string;
  data: { conversationId: string };
}

/**
 * "Delete chat" from the current user's perspective only. The conversation
 * document survives on the server, so the other side can still message and
 * the chat reappears in this user's inbox the moment a new message arrives.
 */
export function useClearChat({ accessToken }: Params) {
  const qc = useQueryClient();
  return useMutation<Response, Error, { conversationId: string }>({
    mutationKey: ["messenger", "clear-chat"],
    mutationFn: async ({ conversationId }) => {
      const res = await fetch(
        `${baseURL}/messages/conversations/${conversationId}/clear`,
        {
          method: "DELETE",
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
    onSuccess: (res, { conversationId }) => {
      if (!res.success) {
        toast.error(res.message);
        return;
      }
      qc.invalidateQueries({ queryKey: ["messenger", "conversations"] });
      qc.invalidateQueries({
        queryKey: ["messenger", "messages", conversationId],
      });
    },
    onError: (err) => toast.error(err.message),
  });
}
