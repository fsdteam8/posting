import { baseURL } from "@/constants";
import { FriendRequestsApiRes } from "@/types/features/friends";
import { useQuery } from "@tanstack/react-query";

type UseGetFriendRequestsProps = {
  accessToken: string;
  mode?: "incoming" | "outgoing";
};

export function useGetFriendRequests({
  accessToken,
  mode = "incoming",
}: UseGetFriendRequestsProps) {
  return useQuery<FriendRequestsApiRes, Error>({
    queryKey: ["friend-requests", mode],

    queryFn: async () => {
      const res = await fetch(`${baseURL}/friends/requests?mode=${mode}`, {
        method: "GET",
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

    enabled: !!accessToken,
    staleTime: 1000 * 60, // 1 minute
  });
}
