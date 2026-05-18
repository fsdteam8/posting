import { baseURL } from "@/constants";
import type {
  RespondFriendRequestApiRes,
  RespondFriendRequestPayload,
} from "@/types/features/friends";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type UseRespondFriendRequestProps = {
  accessToken: string;
};

export function useRespondFriendRequest({
  accessToken,
}: UseRespondFriendRequestProps) {
  const queryClient = useQueryClient();

  return useMutation<
    RespondFriendRequestApiRes,
    Error,
    RespondFriendRequestPayload
  >({
    mutationKey: ["respond-friend-request"],

    mutationFn: async ({ requestId, action }) => {
      const res = await fetch(`${baseURL}/friends/request/${requestId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
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

    onSuccess: (res, { action }) => {
      if (!res.success) {
        toast.error(res.message);
        return;
      }

      // Remove from incoming list & refresh friends list
      queryClient.invalidateQueries({
        queryKey: ["friend-requests", "incoming"],
      });
      queryClient.invalidateQueries({ queryKey: ["non-friends"] });

      if (action === "accept") {
        // Refresh all-friends list if it's been fetched
        queryClient.invalidateQueries({ queryKey: ["all-friends"] });
        toast.success(res.message || "Friend request accepted!");
      } else {
        toast.success(res.message || "Friend request declined.");
      }
    },

    onError: (err) => {
      toast.error(err.message || "Something went wrong");
    },
  });
}
