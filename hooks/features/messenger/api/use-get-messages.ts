import { baseURL } from "@/constants";
import type { MessagesResponse } from "@/types/messenger";
import { useQuery } from "@tanstack/react-query";

interface Params {
  accessToken: string;
  conversationId: string | null;
  page?: number;
  limit?: number;
}

export function useGetMessages({
  accessToken,
  conversationId,
  page = 1,
  limit = 50,
}: Params) {
  return useQuery<MessagesResponse, Error>({
    queryKey: ["messenger", "messages", conversationId, { page, limit }],
    enabled: !!conversationId,
    queryFn: async () => {
      const res = await fetch(
        `${baseURL}/messages/conversations/${conversationId}/messages?page=${page}&limit=${limit}`,
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
    staleTime: 1000 * 10,
    refetchOnWindowFocus: false,
  });
}
