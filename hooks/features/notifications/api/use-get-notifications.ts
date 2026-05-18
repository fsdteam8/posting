import { baseURL } from "@/constants";
import { NotificationsResponse } from "@/types/notification/notification";
import { useQuery } from "@tanstack/react-query";

type Params = {
  accessToken: string;
  page?: number;
  limit?: number;
  unread?: boolean;
};

export function useGetNotifications({
  accessToken,
  page = 1,
  limit = 10,
  unread,
}: Params) {
  return useQuery<NotificationsResponse, Error>({
    queryKey: ["notifications", { page, limit, unread }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (unread !== undefined) params.set("unread", String(unread));

      const res = await fetch(`${baseURL}/notifications?${params}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
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
    staleTime: 1000 * 30,
  });
}
