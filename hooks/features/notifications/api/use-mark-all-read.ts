import { baseURL } from "@/constants";
import { MarkAllReadResponse } from "@/types/notification/notification";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useMarkAllRead({ accessToken }: { accessToken: string }) {
  const queryClient = useQueryClient();

  return useMutation<MarkAllReadResponse, Error>({
    mutationKey: ["mark-all-notifications-read"],
    mutationFn: async () => {
      const res = await fetch(`${baseURL}/notifications/read-all`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!res.ok) {
        let message = `Request failed (${res.status})`;
        try {
          const body = await res.json();
          message = body?.message ?? message;
        } catch {}
        throw new Error(message);
      }

      return res.json();
    },
    onSuccess: (res) => {
      if (!res.success) {
        toast.error(res.message);
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success(res.message);
    },
  });
}
