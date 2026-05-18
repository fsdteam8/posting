import { baseURL } from "@/constants";
import type { CancelFriendRequestApiRes } from "@/types/features/friends";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type UseCancelFriendRequestProps = {
  accessToken: string;
};

type CancelPayload = {
  requestId: string;
};

export function useCancelFriendRequest({
  accessToken,
}: UseCancelFriendRequestProps) {
  const queryClient = useQueryClient();

  return useMutation<CancelFriendRequestApiRes, Error, CancelPayload>({
    mutationKey: ["cancel-friend-request"],

    mutationFn: async ({ requestId }) => {
      const res = await fetch(
        `${baseURL}/friends/request/${requestId}/cancel`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
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

      // Remove from sent requests cache & refresh non-friends suggestions
      queryClient.invalidateQueries({
        queryKey: ["friend-requests", "outgoing"],
      });
      queryClient.invalidateQueries({ queryKey: ["non-friends"] });

      toast.success(res.message || "Request cancelled");
    },

    onError: (err) => {
      toast.error(err.message || "Something went wrong");
    },
  });
}
