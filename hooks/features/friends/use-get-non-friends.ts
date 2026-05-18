import { baseURL } from "@/constants";
import { NonFriendsApiRes } from "@/types/features/friends";
import { useQuery } from "@tanstack/react-query";

type UseGetNonFriendsProps = {
  accessToken: string;
  page?: number;
  limit?: number;
};

export function useGetNonFriends({
  accessToken,
  page = 1,
  limit = 10,
}: UseGetNonFriendsProps) {
  return useQuery<NonFriendsApiRes, Error>({
    queryKey: ["non-friends", page, limit],

    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });

      const res = await fetch(
        `${baseURL}/friends/non-friends?${params.toString()}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        },
      );

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
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
