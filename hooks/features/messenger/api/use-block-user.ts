import { baseURL } from "@/constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface Params {
  accessToken: string;
}

interface Response {
  success: boolean;
  message: string;
}

export function useBlockUser({ accessToken }: Params) {
  const qc = useQueryClient();
  return useMutation<Response, Error, { userId: string }>({
    mutationKey: ["messenger", "block-user"],
    mutationFn: async ({ userId }) => {
      const res = await fetch(`${baseURL}/friends/block/${userId}`, {
        method: "POST",
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
    onSuccess: (res) => {
      if (!res.success) {
        toast.error(res.message);
        return;
      }
      toast.success("User blocked");
      qc.invalidateQueries({ queryKey: ["messenger", "conversations"] });
    },
    onError: (err) => toast.error(err.message),
  });
}
