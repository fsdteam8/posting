import { baseURL } from "@/constants";
import type { ConversationsResponse } from "@/types/messenger";
import { useQuery } from "@tanstack/react-query";

/**
 * `type` separates the regular messenger inbox from the marketplace inbox:
 *   "direct"      → direct + group conversations (default; excludes marketplace)
 *   "marketplace" → only marketplace conversations
 *   "all"         → everything (rarely needed; legacy/admin)
 */
export type ConversationsTypeFilter = "direct" | "marketplace" | "all";

interface Params {
  accessToken: string;
  page?: number;
  limit?: number;
  type?: ConversationsTypeFilter;
}

export function useGetConversations({
  accessToken,
  page = 1,
  limit = 30,
  type = "direct",
}: Params) {
  return useQuery<ConversationsResponse, Error>({
    queryKey: ["messenger", "conversations", { page, limit, type }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        type,
      });
      const res = await fetch(
        `${baseURL}/messages/conversations?${params.toString()}`,
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
