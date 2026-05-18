import { baseURL } from "@/constants";
import type { FriendsResponse } from "@/types/messenger";
import { useQuery } from "@tanstack/react-query";

interface Params {
  accessToken: string;
  page?: number;
  limit?: number;
  q?: string;
}

export function useFriends({ accessToken, page = 1, limit = 50, q }: Params) {
  return useQuery<FriendsResponse, Error>({
    queryKey: ["messenger", "friends", { page, limit, q }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (q) params.set("q", q);

      const res = await fetch(
        `${baseURL}/friends?${params.toString()}`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      if (!res.ok) {
        let msg = `Request failed (${res.status})`;
        try {
          const body = await res.json();
          msg = body?.message ?? msg;
        } catch {}
        throw new Error(msg);
      }
      return res.json();
    },
    staleTime: 1000 * 60,
  });
}
