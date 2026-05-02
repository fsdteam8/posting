import { baseURL } from "@/constants";
import type { UnfriendApiRes } from "@/types/features/friends";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type UseUnfriendProps = {
  accessToken: string;
};

type UnfriendPayload = {
  friendId: string;
};

export function useUnfriend({ accessToken }: UseUnfriendProps) {
  const queryClient = useQueryClient();

  return useMutation<UnfriendApiRes, Error, UnfriendPayload>({
    mutationKey: ["unfriend"],

    mutationFn: async ({ friendId }) => {
      const res = await fetch(`${baseURL}/friends/${friendId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
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

      // Refresh all friends list & non-friends suggestions
      queryClient.invalidateQueries({ queryKey: ["all-friends"] });
      queryClient.invalidateQueries({ queryKey: ["non-friends"] });

      toast.success(res.message || "Unfriended successfully");
    },

    onError: (err) => {
      toast.error(err.message || "Something went wrong");
    },
  });
}
