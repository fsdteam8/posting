import { baseURL } from "@/constants";
import { DeleteNotificationResponse } from "@/types/notification/notification";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useDeleteNotification({
  accessToken,
}: {
  accessToken: string;
}) {
  const queryClient = useQueryClient();

  return useMutation<
    DeleteNotificationResponse,
    Error,
    { notificationId: string }
  >({
    mutationKey: ["delete-notification"],
    mutationFn: async ({ notificationId }) => {
      const res = await fetch(`${baseURL}/notifications/${notificationId}`, {
        method: "DELETE",
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
    },
  });
}
