import { baseURL } from "@/constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface Params {
  accessToken: string;
}

interface Body {
  messageId: string;
  conversationId: string;
  forEveryone?: boolean;
}

export function useDeleteMessage({ accessToken }: Params) {
  const qc = useQueryClient();

  return useMutation<unknown, Error, Body>({
    mutationKey: ["messenger", "delete-message"],
    mutationFn: async ({ messageId, forEveryone }) => {
      const url = new URL(`${baseURL}/messages/${messageId}`);
      if (forEveryone) url.searchParams.set("forEveryone", "true");
      const res = await fetch(url.toString(), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
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
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({
        queryKey: ["messenger", "messages", vars.conversationId],
      });
      qc.invalidateQueries({ queryKey: ["messenger", "conversations"] });
    },
    onError: (err) => toast.error(err.message),
  });
}
