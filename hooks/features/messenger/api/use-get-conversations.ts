import { baseURL } from "@/constants";
import type { ConversationsResponse } from "@/types/messenger";
import { useQuery } from "@tanstack/react-query";

interface Params {
  accessToken: string;
  page?: number;
  limit?: number;
}

export function useGetConversations({
  accessToken,
  page = 1,
  limit = 30,
}: Params) {
  return useQuery<ConversationsResponse, Error>({
    queryKey: ["messenger", "conversations", { page, limit }],
    queryFn: async () => {
      const res = await fetch(
        `${baseURL}/messages/conversations?page=${page}&limit=${limit}`,
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
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
  });
}
