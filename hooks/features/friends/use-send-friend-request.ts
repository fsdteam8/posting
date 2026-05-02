import { baseURL } from "@/constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type ApiRes = {
  success: boolean;
  message: string;
  data?: unknown;
};

type UseSendFriendRequestProps = {
  accessToken: string;
};

type SendFriendRequestPayload = {
  receiverId: string;
};

export function useSendFriendRequest({
  accessToken,
}: UseSendFriendRequestProps) {
  const queryClient = useQueryClient();

  return useMutation<ApiRes, Error, SendFriendRequestPayload>({
    mutationKey: ["send-friend-request"],

    mutationFn: async ({ receiverId }) => {
      const res = await fetch(`${baseURL}/friends/request`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ recipientId: receiverId }),
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

      // Invalidate non-friends list so sent requests disappear or update
      queryClient.invalidateQueries({ queryKey: ["non-friends"] });

      toast.success(res.message || "Friend request sent!");
    },

    onError: (err) => {
      toast.error(err.message || "Something went wrong");
    },
  });
}
