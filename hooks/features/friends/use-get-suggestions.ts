import { baseURL } from "@/constants";
import type { SuggestionsApiRes } from "@/types/features/friends/index";
import { useQuery } from "@tanstack/react-query";

type UseGetSuggestionsProps = {
  accessToken: string;
  limit?: number;
};

export function useGetSuggestions({
  accessToken,
  limit = 10,
}: UseGetSuggestionsProps) {
  return useQuery<SuggestionsApiRes, Error>({
    queryKey: ["friend-suggestions", limit],

    queryFn: async () => {
      const res = await fetch(`${baseURL}/friends/suggestions?limit=${limit}`, {
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
    staleTime: 1000 * 60 * 3, // 3 minutes
  });
}
