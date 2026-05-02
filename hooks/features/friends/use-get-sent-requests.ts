import { baseURL } from "@/constants";
import type { SentRequestsApiRes } from "@/types/features/friends";
import { useQuery } from "@tanstack/react-query";

type UseGetSentRequestsProps = {
  accessToken: string;
  enabled?: boolean;
};

export function useGetSentRequests({
  accessToken,
  enabled = true,
}: UseGetSentRequestsProps) {
  return useQuery<SentRequestsApiRes, Error>({
    queryKey: ["friend-requests", "outgoing"],

    queryFn: async () => {
      const res = await fetch(`${baseURL}/friends/requests?mode=outgoing`, {
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

    enabled: !!accessToken && enabled,
    staleTime: 1000 * 60, // 1 minute
  });
}
