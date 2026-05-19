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

export function useLeaveConversation({ accessToken }: Params) {
  const qc = useQueryClient();
  return useMutation<Response, Error, { conversationId: string }>({
    mutationKey: ["messenger", "leave-conversation"],
    mutationFn: async ({ conversationId }) => {
      const res = await fetch(
        `${baseURL}/messages/conversations/${conversationId}/leave`,
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
