import { baseURL } from "@/constants";
import { SearchApiRes, SearchType } from "@/types/features/search/types";
import { useQuery } from "@tanstack/react-query";

type UseSearchParams = {
  query: string;
  type?: SearchType;
  limit?: number;
  accessToken: string;
};

export function useSearch({
  query,
  type = "all",
  limit = 10,
  accessToken,
}: UseSearchParams) {
  return useQuery<SearchApiRes, Error>({
    queryKey: ["search", query, type, limit],

    queryFn: async () => {
      const params = new URLSearchParams({
        q: query,
        type,
        limit: String(limit),
      });

      const res = await fetch(`${baseURL}/search?${params.toString()}`, {
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

    enabled: query.trim().length > 0,
    staleTime: 1000 * 30,
  });
}
