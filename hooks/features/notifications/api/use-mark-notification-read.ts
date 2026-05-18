import { baseURL } from "@/constants";
import { MarkReadResponse } from "@/types/notification/notification";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useMarkNotificationRead({
  accessToken,
}: {
  accessToken: string;
}) {
  const queryClient = useQueryClient();

  return useMutation<MarkReadResponse, Error, { notificationId: string }>({
    mutationKey: ["mark-notification-read"],
    mutationFn: async ({ notificationId }) => {
      const res = await fetch(
        `${baseURL}/notifications/${notificationId}/read`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

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
    },
  });
}
