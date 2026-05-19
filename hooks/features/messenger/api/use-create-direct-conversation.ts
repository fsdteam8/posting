import { baseURL } from "@/constants";
import type { Conversation } from "@/types/messenger";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface Params {
  accessToken: string;
}

type Response = {
  success: boolean;
  message: string;
  data: Conversation;
};

export function useCreateDirectConversation({ accessToken }: Params) {
  const qc = useQueryClient();
  return useMutation<Response, Error, { userId: string }>({
    mutationKey: ["messenger", "create-direct"],
    mutationFn: async ({ userId }) => {
      const res = await fetch(`${baseURL}/messages/conversations/direct`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });
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
    onSuccess: (res) => {
      if (!res.success) {
        toast.error(res.message);
        return;
      }
      qc.invalidateQueries({ queryKey: ["messenger", "conversations"] });
    },
    onError: (err) => toast.error(err.message),
  });
}
