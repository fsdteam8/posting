import { baseURL } from "@/constants";
import { StoryGroup } from "@/types/features/feed/story";
import { useQuery } from "@tanstack/react-query";

interface Params {
  accessToken: string;
  userId: string | null;
}

interface GetStoriesByUserResponse {
  success: boolean;
  message: string;
  data: StoryGroup[];
}

export function useGetStoriesByUser({ accessToken, userId }: Params) {
  return useQuery({
    queryKey: ["stories-by-user", userId],
    queryFn: async () => {
      const res = await fetch(`${baseURL}/stories/user/${userId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Failed to fetch user stories");
      }

      return res.json() as Promise<GetStoriesByUserResponse>;
    },
    enabled: !!accessToken && !!userId,
  });
}
