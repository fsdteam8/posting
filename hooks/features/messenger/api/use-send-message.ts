import { baseURL } from "@/constants";
import type { SendMessageResponse } from "@/types/messenger";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface Params {
  accessToken: string;
}

interface Body {
  conversationId: string;
  text?: string;
  replyTo?: string | null;
  file?: File | null;
}

export function useSendMessage({ accessToken }: Params) {
  const qc = useQueryClient();

  return useMutation<SendMessageResponse, Error, Body>({
    mutationKey: ["messenger", "send"],
    mutationFn: async ({ conversationId, text, replyTo, file }) => {
      const fd = new FormData();
      if (text) fd.append("text", text);
      if (replyTo) fd.append("replyTo", replyTo);
      if (file) fd.append("file", file);

      const res = await fetch(
        `${baseURL}/messages/conversations/${conversationId}/messages`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` },
          body: fd,
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
    onSuccess: (res, vars) => {
      if (!res.success) {
        toast.error(res.message);
        return;
      }
      qc.invalidateQueries({
        queryKey: ["messenger", "messages", vars.conversationId],
      });
      qc.invalidateQueries({ queryKey: ["messenger", "conversations"] });
    },
    onError: (err) => toast.error(err.message),
  });
}
