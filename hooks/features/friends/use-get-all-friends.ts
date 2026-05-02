import { baseURL } from "@/constants";
import type { AllFriendsApiRes } from "@/types/features/friends";
import { useQuery } from "@tanstack/react-query";

type UseGetAllFriendsProps = {
  accessToken: string;
  page?: number;
  limit?: number;
};

export function useGetAllFriends({
  accessToken,
  page = 1,
  limit = 10,
}: UseGetAllFriendsProps) {
  return useQuery<AllFriendsApiRes, Error>({
    queryKey: ["all-friends", page, limit],

    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });

      const res = await fetch(`${baseURL}/friends?${params.toString()}`, {
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
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
